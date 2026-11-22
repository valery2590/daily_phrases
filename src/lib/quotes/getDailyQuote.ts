import "server-only";
import { unstable_cache } from "next/cache";
import { createStoicProvider } from "./stoicProvider";
import { createMyMemoryTranslator } from "@/lib/translation/myMemory";
import { buildDailyQuote, utcDateKey } from "./buildDailyQuote";
import type { DailyQuote, Lang } from "./types";

const DAY = 60 * 60 * 24;

const provider = createStoicProvider();
const translator = createMyMemoryTranslator();

/**
 * Caching:
 * - the upstream quote is cached once per UTC day by Next's fetch cache
 *   (see stoicProvider: the URL carries the date);
 * - each translation is cached per text + language. Only successes are stored
 *   (unstable_cache does not keep a thrown error), so that is about 2 MyMemory
 *   calls a day, far below its free quota, and a failed translation is retried
 *   on the next request instead of being stuck for days.
 * A fallback quote is never cached, so the page goes back to live as soon as
 * the upstream recovers.
 */

const cachedTranslation = unstable_cache(
  (text: string, to: Lang) => translator.translate(text, "en", to),
  ["translation-v1"],
  { revalidate: DAY * 7 },
);

/**
 * The upstream returns a *random* quote on every call, so two cache misses at the
 * same time would cache two different "quotes of the day" (page and share image
 * would disagree). Concurrent callers on this instance share one in-flight request.
 */
const inflight = new Map<string, Promise<DailyQuote>>();

export function getDailyQuote(now: Date = new Date()): Promise<DailyQuote> {
  const date = utcDateKey(now);
  const pending = inflight.get(date);
  if (pending) return pending;

  const promise = buildDailyQuote(date, {
    fetchSource: (d) => provider.fetchQuote(d),
    translate: cachedTranslation,
  }).finally(() => inflight.delete(date));

  inflight.set(date, promise);
  return promise;
}
