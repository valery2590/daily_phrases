import { describe, expect, it, vi } from "vitest";
import { buildDailyQuote, utcDateKey } from "@/lib/quotes/buildDailyQuote";
import { LOCAL_QUOTES, pickLocalQuote } from "@/lib/quotes/localQuotes";

const source = { author: "Seneca", text: "We suffer more often in imagination than in reality." };
const quiet = { onError: () => {} };

describe("buildDailyQuote", () => {
  it("returns the live quote with every translation", async () => {
    const translate = vi.fn(async (text: string, to: string) => `[${to}] ${text}`);
    const quote = await buildDailyQuote("2026-11-22", { fetchSource: async () => source, translate, ...quiet });
    expect(quote).toMatchObject({ author: "Seneca", source: "live", translation: "ok" });
    expect(quote.text).toEqual({ en: source.text, es: `[es] ${source.text}`, it: `[it] ${source.text}` });
  });

  it("falls back to a local, pre-translated quote when the upstream fails", async () => {
    const translate = vi.fn();
    const onError = vi.fn();
    const quote = await buildDailyQuote("2026-11-22", {
      fetchSource: async () => {
        throw new Error("down");
      },
      translate,
      onError,
    });
    expect(quote.source).toBe("fallback");
    expect(quote.text).toEqual(pickLocalQuote("2026-11-22").text);
    expect(translate).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledWith("source", expect.any(Error));
  });

  it("degrades only the failing language", async () => {
    const quote = await buildDailyQuote("2026-11-22", {
      fetchSource: async () => source,
      translate: async (text, to) => {
        if (to === "it") throw new Error("quota");
        return `es: ${text}`;
      },
      ...quiet,
    });
    expect(quote.translation).toBe("partial");
    expect(quote.text.it).toBeNull();
    expect(quote.text.es).toBe(`es: ${source.text}`);
  });

  it("marks translation unavailable when every language fails, keeping English", async () => {
    const quote = await buildDailyQuote("2026-11-22", {
      fetchSource: async () => source,
      translate: async () => {
        throw new Error("down");
      },
      ...quiet,
    });
    expect(quote).toMatchObject({ source: "live", translation: "unavailable" });
    expect(quote.text.en).toBe(source.text);
  });
});

describe("helpers", () => {
  it("uses the UTC day", () => {
    expect(utcDateKey(new Date("2026-11-22T23:30:00-05:00"))).toBe("2026-11-23");
  });

  it("picks the same local quote for the same date, and varies across dates", () => {
    expect(pickLocalQuote("2026-11-22")).toBe(pickLocalQuote("2026-11-22"));
    const picks = new Set(Array.from({ length: 30 }, (_, i) => pickLocalQuote(`2026-12-${String(i + 1).padStart(2, "0")}`)));
    expect(picks.size).toBeGreaterThan(1);
  });

  it("has every local quote in every language", () => {
    for (const q of LOCAL_QUOTES) for (const t of Object.values(q.text)) expect(t.trim()).not.toBe("");
  });
});
