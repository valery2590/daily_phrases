import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchWithRetry, UpstreamError } from "@/lib/http/fetchWithRetry";
import { jsonResponse, mockFetch, noSleep } from "./helpers";

const opts = { service: "test-api", ...noSleep };

afterEach(() => vi.unstubAllGlobals());

describe("fetchWithRetry", () => {
  it("returns the first successful response", async () => {
    const fetch = mockFetch(jsonResponse({ ok: true }));
    const res = await fetchWithRetry("https://api.test", {}, opts);
    expect(await res.json()).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("retries 5xx and 429, then succeeds", async () => {
    const fetch = mockFetch(jsonResponse({}, 503), jsonResponse({}, 429), jsonResponse({ ok: true }));
    const res = await fetchWithRetry("https://api.test", {}, opts);
    expect(res.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("does not retry a 4xx: the request itself is wrong", async () => {
    const fetch = mockFetch(jsonResponse({}, 404), jsonResponse({ ok: true }));
    await expect(fetchWithRetry("https://api.test", {}, opts)).rejects.toMatchObject({
      name: "UpstreamError",
      status: 404,
    });
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("retries network errors and gives up after maxAttempts", async () => {
    const fetch = mockFetch(new TypeError("fetch failed"), new TypeError("fetch failed"), new TypeError("fetch failed"));
    const err = await fetchWithRetry("https://api.test", {}, opts).catch((e) => e);
    expect(err).toBeInstanceOf(UpstreamError);
    expect(err.message).toBe("test-api unreachable");
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("reports timeouts as such", async () => {
    mockFetch(new DOMException("timed out", "TimeoutError"));
    const err = await fetchWithRetry("https://api.test", {}, { ...opts, maxAttempts: 1, timeoutMs: 50 }).catch((e) => e);
    expect(err.message).toBe("test-api timed out after 50ms");
  });

  it("waits with exponential backoff, and honours Retry-After", async () => {
    const sleep = vi.fn(async () => {});
    mockFetch(jsonResponse({}, 500), jsonResponse({}, 429, { "retry-after": "1" }), jsonResponse({}));
    await fetchWithRetry("https://api.test", {}, { service: "t", sleep, random: () => 1, baseDelayMs: 100 });
    expect(sleep).toHaveBeenNthCalledWith(1, 100); // 1 * 100 * 2^0
    expect(sleep).toHaveBeenNthCalledWith(2, 1000); // Retry-After: 1s
  });
});
