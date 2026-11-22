import { CATALOG, AUTHORS, WORKS, type CatalogEntry } from "./catalog";
import { LANGS, type DailyQuote, type Lang } from "./types";

/** Day 0 of the rotation: cycles of the shuffled catalog are counted from here. */
export const LAUNCH_DATE = "2026-11-22";

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

/** Small, fast seeded PRNG (mulberry32): same seed, same sequence, on every instance. */
function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher–Yates shuffle of 0..n-1 driven by a seed. */
function shuffledOrder(n: number, seed: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  const random = seededRandom(seed);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/**
 * Random but deterministic rotation. The catalog is shuffled once per cycle
 * (a cycle = as many days as entries) with the cycle number as seed, so:
 * - the order looks random, and changes every cycle;
 * - within a cycle no quote repeats; every entry shows once before reshuffling;
 * - the same date always gives the same entry, on every instance and in every
 *   route (page, JSON API, share image), with no cache or stored state.
 */
export function entryForDate(date: string, catalog: readonly CatalogEntry[] = CATALOG): CatalogEntry {
  const n = catalog.length;
  const day = daysSinceLaunch(date);
  const cycle = Math.floor(day / n);
  const position = ((day % n) + n) % n;
  return catalog[shuffledOrder(n, cycle)[position]];
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
