import { afterEach, describe, expect, it, vi } from "vitest";
import { createStoicProvider, normalizeQuote } from "@/lib/quotes/stoicProvider";
import { jsonResponse, mockFetch } from "./helpers";

afterEach(() => vi.unstubAllGlobals());

const provider = createStoicProvider("https://stoic.test/quote");

describe("Stoic provider", () => {
  it("maps a valid response and keys the request by day", async () => {
    const fetch = mockFetch(jsonResponse({ data: { author: " Seneca ", quote: "Luck is what happens…" } }));
    await expect(provider.fetchQuote("2026-11-22")).resolves.toEqual({ author: "Seneca", text: "Luck is what happens…" });
    expect(String((fetch.mock.calls[0] as unknown[])[0])).toBe("https://stoic.test/quote?day=2026-11-22");
  });

  it("rejects a response with an unexpected shape instead of rendering it", async () => {
    mockFetch(jsonResponse({ quote: "no data wrapper" }));
    await expect(provider.fetchQuote("2026-11-22")).rejects.toThrow("unexpected shape");
  });

  it("rejects an empty quote", async () => {
    mockFetch(jsonResponse({ data: { author: "Seneca", quote: "   " } }));
    await expect(provider.fetchQuote("2026-11-22")).rejects.toThrow("unexpected shape");
  });
});

describe("normalizeQuote", () => {
  it("strips a stray @ or @handle appended by the upstream (seen in real responses)", () => {
    expect(normalizeQuote({ author: "x", quote: "Be whole, not fragmentary. @" }).text).toBe("Be whole, not fragmentary.");
    expect(normalizeQuote({ author: "x", quote: "Be whole. @someone" }).text).toBe("Be whole.");
    expect(normalizeQuote({ author: "x", quote: "Email me@home is fine" }).text).toBe("Email me@home is fine");
  });

  it("strips enclosed symbols", () => {
    expect(normalizeQuote({ author: "x", quote: "Be whole. ⓐ" }).text).toBe("Be whole.");
  });

  it("splits authors written as handles, leaves normal names alone", () => {
    expect(normalizeQuote({ author: "TheAncientSage", quote: "x" }).author).toBe("The Ancient Sage");
    expect(normalizeQuote({ author: "Anthony de Mello", quote: "x" }).author).toBe("Anthony de Mello");
    expect(normalizeQuote({ author: "Seneca", quote: "x" }).author).toBe("Seneca");
  });
});
