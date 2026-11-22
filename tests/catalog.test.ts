import { describe, expect, it } from "vitest";
import { AUTHORS, CATALOG, WORKS } from "@/lib/quotes/catalog";
import {
  entryForDate,
  getDailyQuote,
  getLatestQuote,
  getQuoteById,
  LAUNCH_DATE,
  remainingDays,
  secondsUntilNextDay,
  utcDateKey,
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
  it("starts with the first entry on launch day", () => {
    expect(entryForDate(LAUNCH_DATE)).toBe(CATALOG[0]);
    expect(entryForDate(addDays(LAUNCH_DATE, 1))).toBe(CATALOG[1]);
  });

  it("shows every entry exactly once and never wraps around", () => {
    const seen = new Set<string>();
    for (let d = 0; d < CATALOG.length; d++) seen.add(entryForDate(addDays(LAUNCH_DATE, d))!.id);
    expect(seen.size).toBe(CATALOG.length);
    expect(entryForDate(addDays(LAUNCH_DATE, CATALOG.length))).toBeUndefined();
    expect(getDailyQuote(new Date(`${addDays(LAUNCH_DATE, CATALOG.length)}T08:00:00Z`))).toBeNull();
  });

  it("has no entry before launch", () => {
    expect(entryForDate(addDays(LAUNCH_DATE, -1))).toBeUndefined();
  });

  it("counts the days of content left", () => {
    expect(remainingDays(addDays(LAUNCH_DATE, -3))).toBe(CATALOG.length);
    expect(remainingDays(LAUNCH_DATE)).toBe(CATALOG.length - 1);
    expect(remainingDays(addDays(LAUNCH_DATE, CATALOG.length - 1))).toBe(0);
    expect(remainingDays(addDays(LAUNCH_DATE, CATALOG.length + 5))).toBe(0);
  });

  it("still gives link previews an image when there is no entry today", () => {
    expect(getLatestQuote(new Date(`${addDays(LAUNCH_DATE, -1)}T08:00:00Z`)).id).toBe(CATALOG[0].id);
    expect(getLatestQuote(new Date(`${addDays(LAUNCH_DATE, 999)}T08:00:00Z`)).id).toBe(CATALOG.at(-1)!.id);
  });

  it("uses the UTC day, not the server's local day", () => {
    expect(utcDateKey(new Date("2026-11-23T23:30:00-05:00"))).toBe("2026-11-24");
    expect(getDailyQuote(new Date("2026-11-22T00:00:00Z"))?.id).toBe(CATALOG[0].id);
  });

  it("resolves author, work and texts per language", () => {
    const q = getDailyQuote(new Date(`${LAUNCH_DATE}T08:00:00Z`))!;
    expect(q).toMatchObject({ date: LAUNCH_DATE, id: CATALOG[0].id });
    expect(q.author.es).toBe("Epicteto");
    expect(q.work.en).toBe("Enchiridion 5");
    expect(q.lesson.es).toContain("plan de reintentos");
  });

  it("omits the reference when an entry has none", () => {
    expect(getQuoteById("master-of-himself")?.work.it).toBe("Frammenti");
    expect(getQuoteById("nope")).toBeUndefined();
  });

  it("counts the seconds until the quote changes", () => {
    expect(secondsUntilNextDay(new Date("2026-11-23T23:59:00Z"))).toBe(60);
    expect(secondsUntilNextDay(new Date("2026-11-23T00:00:00Z"))).toBe(86_400);
  });
});
