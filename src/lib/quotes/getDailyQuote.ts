import { CATALOG, AUTHORS, WORKS, type CatalogEntry } from "./catalog";
import { LANGS, type DailyQuote, type Lang } from "./types";

/** Day 0 of the rotation: cycles of the shuffled catalog are counted from here. */
export const LAUNCH_DATE = "2026-11-22";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * The day changes at midnight in this time zone, for the author and the
 * audience (Spain, Italy), wherever the server runs. Daylight saving included.
 */
export const TIME_ZONE = "Europe/Madrid";

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Calendar day in TIME_ZONE as YYYY-MM-DD, so every server instance agrees on what "today" is. */
export function dateKey(now: Date = new Date()): string {
  return dayFormatter.format(now);
}

const offsetFormatter = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, timeZoneName: "longOffset" });

/** UTC offset of TIME_ZONE at a given instant, in ms (e.g. +1 h in winter, +2 h in summer). */
function offsetMs(at: number): number {
  const name = offsetFormatter.formatToParts(at).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!match) return 0;
  const sign = match[1] === "-" ? -1 : 1;
  return sign * (Number(match[2]) * 60 + Number(match[3])) * 60_000;
}

/** Seconds until the next midnight in TIME_ZONE, when the quote changes. Used for cache headers. */
export function secondsUntilNextDay(now: Date = new Date()): number {
  const [y, m, d] = dateKey(now).split("-").map(Number);
  const midnightAsUtc = Date.UTC(y, m - 1, d + 1);
  // Local midnight = that wall-clock time minus the zone's offset. Use the offset
  // valid at midnight itself (it can differ from now's on a DST change day).
  const guess = midnightAsUtc - offsetMs(now.getTime());
  const next = midnightAsUtc - offsetMs(guess);
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
  const date = dateKey(now);
  return resolveEntry(entryForDate(date), date);
}

/** A specific entry by id (used to preview cards during development). */
export function getQuoteById(id: string, now: Date = new Date()): DailyQuote | undefined {
  const entry = CATALOG.find((e) => e.id === id);
  return entry && resolveEntry(entry, dateKey(now));
}
