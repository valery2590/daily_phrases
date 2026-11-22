/**
 * Thin wrapper around fetch for calling third-party APIs.
 *
 * - Every attempt has a hard timeout (a hanging upstream must not hang us).
 * - Retries only what is worth retrying: network errors, timeouts, 429 and 5xx.
 *   A 4xx means our request is wrong; sending it again will not fix it.
 * - Exponential backoff with full jitter, so concurrent callers don't retry in lockstep.
 * - Honours Retry-After on 429/503 when the upstream sends it (capped).
 */

export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly service: string,
    readonly status?: number,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.name = "UpstreamError";
  }
}

export interface RetryOptions {
  /** Name used in errors and logs, e.g. "stoic-api". */
  service: string;
  /** Per-attempt timeout in ms. */
  timeoutMs?: number;
  /** Total attempts, including the first one. */
  maxAttempts?: number;
  /** Base delay for the backoff in ms. */
  baseDelayMs?: number;
  /** Upper bound for any single wait in ms. */
  maxDelayMs?: number;
  /** Injected for tests. */
  sleep?: (ms: number) => Promise<void>;
  random?: () => number;
}

const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

const defaultSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function isRetryableStatus(status: number): boolean {
  return RETRYABLE_STATUS.has(status);
}

function retryAfterMs(res: Response): number | undefined {
  const header = res.headers.get("retry-after");
  if (!header) return undefined;
  const seconds = Number(header);
  if (Number.isFinite(seconds)) return seconds * 1000;
  const date = Date.parse(header);
  return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
}

export async function fetchWithRetry(
  url: string | URL,
  init: RequestInit = {},
  options: RetryOptions,
): Promise<Response> {
  const {
    service,
    timeoutMs = 4000,
    maxAttempts = 3,
    baseDelayMs = 250,
    maxDelayMs = 2000,
    sleep = defaultSleep,
    random = Math.random,
  } = options;

  let lastError: UpstreamError | undefined;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let waitHint: number | undefined;

    try {
      const res = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (res.ok) return res;

      lastError = new UpstreamError(
        `${service} responded ${res.status}`,
        service,
        res.status,
      );
      if (!isRetryableStatus(res.status)) throw lastError;
      waitHint = retryAfterMs(res);
    } catch (err) {
      if (err instanceof UpstreamError && !isRetryableStatus(err.status ?? 0)) {
        throw err;
      }
      if (!(err instanceof UpstreamError)) {
        const timedOut = err instanceof DOMException && err.name === "TimeoutError";
        lastError = new UpstreamError(
          timedOut ? `${service} timed out after ${timeoutMs}ms` : `${service} unreachable`,
          service,
          undefined,
          { cause: err },
        );
      }
    }

    if (attempt < maxAttempts) {
      const backoff = random() * baseDelayMs * 2 ** (attempt - 1);
      await sleep(Math.min(waitHint ?? backoff, maxDelayMs));
    }
  }

  throw lastError ?? new UpstreamError(`${service} failed`, service);
}
