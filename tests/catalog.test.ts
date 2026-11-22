import { describe, expect, it } from "vitest";
import { AUTHORS, CATALOG, WORKS } from "@/lib/quotes/catalog";
import {
  entryForDate,
  getDailyQuote,
  getQuoteById,
  LAUNCH_DATE,
  dateKey,
  secondsUntilNextDay,
} from "@/lib/quotes/getDailyQuote";
import { LANGS } from "@/lib/quotes/types";

const MAX_QUOTE = 170;
const MAX_LESSON = 110;

function addDays(date: string, days: number): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);
}

describe("catalog", () => {
  it("has unique, slug-like ids", () => {
    const ids = CATALOG.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it.each(CATALOG.map((e) => [e.id, e] as const))("%s is complete and fits the card", (_, entry) => {
    expect(AUTHORS[entry.author]).toBeDefined();
    expect(WORKS[entry.work]).toBeDefined();
    for (const lang of LANGS) {
      const quote = entry.quote[lang]?.trim();
      const lesson = entry.lesson[lang]?.trim();
      expect(quote, `${lang} quote`).toBeTruthy();
      expect(lesson, `${lang} lesson`).toBeTruthy();
      expect(quote.length, `${lang} quote length`).toBeLessThanOrEqual(MAX_QUOTE);
      expect(lesson.length, `${lang} lesson length`).toBeLessThanOrEqual(MAX_LESSON);
      // The card adds its own quote marks.
      expect(quote).not.toMatch(/^[“"«]/);
    }
  });
});

describe("daily rotation", () => {
  const cycle = (from: number) =>
    Array.from({ length: CATALOG.length }, (_, d) => entryForDate(addDays(LAUNCH_DATE, from + d)).id);

  it("is deterministic: the same date always gives the same entry", () => {
    expect(entryForDate("2027-03-14")).toBe(entryForDate("2027-03-14"));
    expect(cycle(0)).toEqual(cycle(0));
  });

  it("shows every entry once per cycle, in a shuffled order", () => {
    const first = cycle(0);
    expect(new Set(first).size).toBe(CATALOG.length);
    expect(first).not.toEqual(CATALOG.map((e) => e.id));
  });

  it("reshuffles every cycle", () => {
    const second = cycle(CATALOG.length);
    expect(new Set(second).size).toBe(CATALOG.length);
    expect(second).not.toEqual(cycle(0));
  });

  it("also works for dates before launch", () => {
    const before = cycle(-CATALOG.length);
    expect(new Set(before).size).toBe(CATALOG.length);
  });

  it("uses the day in Madrid, not UTC or the server's local day", () => {
    // 23:30 UTC is already the next day in Madrid (UTC+1 in winter, UTC+2 in summer).
    expect(dateKey(new Date("2026-11-22T23:30:00Z"))).toBe("2026-11-23");
    expect(dateKey(new Date("2026-11-22T22:59:00Z"))).toBe("2026-11-22");
    expect(dateKey(new Date("2027-07-01T22:30:00Z"))).toBe("2027-07-02");
    expect(dateKey(new Date("2027-07-01T21:30:00Z"))).toBe("2027-07-01");
    expect(getDailyQuote(new Date("2026-11-22T00:00:00Z")).id).toBe(entryForDate("2026-11-22").id);
  });

  it("resolves author, work and texts per language", () => {
    const entry = CATALOG.find((e) => e.id === "opinions-not-things")!;
    const q = getQuoteById(entry.id)!;
    expect(q.author.es).toBe("Epicteto");
    expect(q.work.en).toBe("Enchiridion 5");
    expect(q.lesson.es).toContain("plan de reintentos");
  });

  it("omits the reference when an entry has none", () => {
    expect(getQuoteById("master-of-himself")?.work.it).toBe("Frammenti");
    expect(getQuoteById("nope")).toBeUndefined();
  });

  it("counts the seconds until the quote changes", () => {
    // Madrid midnight is 23:00 UTC in winter and 22:00 UTC in summer.
    expect(secondsUntilNextDay(new Date("2026-11-22T22:59:00Z"))).toBe(60);
    expect(secondsUntilNextDay(new Date("2026-11-22T23:00:00Z"))).toBe(86_400);
    expect(secondsUntilNextDay(new Date("2027-07-01T21:59:00Z"))).toBe(60);
    // DST change days are 23 h (March) and 25 h (October) long.
    expect(secondsUntilNextDay(new Date("2027-03-27T23:00:00Z"))).toBe(23 * 3600);
    expect(secondsUntilNextDay(new Date("2027-10-30T22:00:00Z"))).toBe(25 * 3600);
  });
});
