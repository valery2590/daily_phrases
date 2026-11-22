export const LANGS = ["en", "es", "it"] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** Raw quote as returned by a provider: always English, single author. */
export interface SourceQuote {
  author: string;
  text: string;
}

export interface DailyQuote {
  /** UTC date the quote belongs to, YYYY-MM-DD. */
  date: string;
  author: string;
  /** null when the translation for that language is unavailable. */
  text: Record<Lang, string | null>;
  /** "live" = fetched from the upstream API; "fallback" = local curated list. */
  source: "live" | "fallback";
  translation: "ok" | "partial" | "unavailable";
}
