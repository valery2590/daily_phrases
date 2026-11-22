import { LANGS, type DailyQuote, type Lang, type SourceQuote } from "./types";
import { pickLocalQuote } from "./localQuotes";

export interface BuildDeps {
  /** Today's quote from the upstream API, in English. Throws if unavailable. */
  fetchSource: (date: string) => Promise<SourceQuote>;
  /** Translate English text into `to`. Throws if unavailable. */
  translate: (text: string, to: Lang) => Promise<string>;
  /** Where failures are reported. Defaults to console.warn. */
  onError?: (stage: "source" | "translation", err: unknown) => void;
}

const TARGETS = LANGS.filter((l): l is Exclude<Lang, "en"> => l !== "en");

/**
 * Orchestrates the integration: upstream quote → (on failure) local fallback,
 * then translations in parallel. A failing translation degrades that language
 * only; it never takes the page down.
 */
export async function buildDailyQuote(date: string, deps: BuildDeps): Promise<DailyQuote> {
  const report = deps.onError ?? ((stage, err) => console.warn(`[daily-quote] ${stage} failed:`, err));

  let source: SourceQuote;
  try {
    source = await deps.fetchSource(date);
  } catch (err) {
    report("source", err);
    const local = pickLocalQuote(date);
    return { date, author: local.author, text: { ...local.text }, source: "fallback", translation: "ok" };
  }

  const results = await Promise.allSettled(TARGETS.map((to) => deps.translate(source.text, to)));

  const text: Record<Lang, string | null> = { en: source.text, es: null, it: null };
  let failed = 0;
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      text[TARGETS[i]] = result.value;
    } else {
      failed++;
      report("translation", result.reason);
    }
  });

  return {
    date,
    author: source.author,
    text,
    source: "live",
    translation: failed === 0 ? "ok" : failed === TARGETS.length ? "unavailable" : "partial",
  };
}

/** UTC calendar day, so every server instance agrees on what "today" is. */
export function utcDateKey(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}
