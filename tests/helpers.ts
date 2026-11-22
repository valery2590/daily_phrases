import { vi } from "vitest";

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

/** Replace global fetch with a queue of responses (or errors) and return the mock. */
export function mockFetch(...steps: Array<Response | Error>) {
  const fn = vi.fn(async () => {
    const next = steps.shift();
    if (!next) throw new Error("unexpected fetch call");
    if (next instanceof Error) throw next;
    return next;
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

export const noSleep = { sleep: async () => {}, random: () => 0.5 };
