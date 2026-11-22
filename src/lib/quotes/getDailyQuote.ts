import { CATALOG, AUTHORS, WORKS, type CatalogEntry } from "./catalog";
import { LANGS, type DailyQuote, type Lang } from "./types";

/** Day the rotation starts from: on this date the catalog shows its first entry. */
export const LAUNCH_DATE = "2026-11-23";

const DAY_MS = 24 * 60 * 60 * 1000;

/** UTC calendar day, so every server instance agrees on what "today" is. */
export function utcDateKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Seconds until the next UTC midnight, when the quote changes. Used for cache headers. */
export function secondsUntilNextDay(now: Date = new Date()): number {
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

function daysSinceLaunch(date: string): number {
  return Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${LAUNCH_DATE}T00:00:00Z`)) / DAY_MS);
}

/**
 * Deterministic rotation: the same date always gives the same entry, on every
 * instance and in every route (page, JSON API, share image, cron). No cache,
 * no state, no race between requests.
 */
export function entryForDate(date: string, catalog: readonly CatalogEntry[] = CATALOG): CatalogEntry {
  const n = catalog.length;
  const index = ((daysSinceLaunch(date) % n) + n) % n;
  return catalog[index];
}

function byLang(pick: (lang: Lang) => string): Record<Lang, string> {
  return Object.fromEntries(LANGS.map((l) => [l, pick(l)])) as Record<Lang, string>;
}

export function resolveEntry(entry: CatalogEntry, date: string): DailyQuote {
  return {
    date,
    id: entry.id,
    author: { ...AUTHORS[entry.author] },
    work: byLang((l) => [WORKS[entry.work][l], entry.ref].filter(Boolean).join(" ")),
    text: { ...entry.quote },
    lesson: { ...entry.lesson },
  };
}

export function getDailyQuote(now: Date = new Date()): DailyQuote {
  const date = utcDateKey(now);
  return resolveEntry(entryForDate(date), date);
}

/** A specific entry by id (used to preview cards during development). */
export function getQuoteById(id: string, now: Date = new Date()): DailyQuote | undefined {
  const entry = CATALOG.find((e) => e.id === id);
  return entry && resolveEntry(entry, utcDateKey(now));
}
