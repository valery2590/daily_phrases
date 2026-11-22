export const LANGS = ["en", "es", "it"] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** Today's entry from the curated catalog, resolved for every language. */
export interface DailyQuote {
  /** Day the quote belongs to (Europe/Madrid), YYYY-MM-DD. */
  date: string;
  /** Stable catalog id. */
  id: string;
  author: Record<Lang, string>;
  /** Work and reference, e.g. "Meditations 12.17". */
  work: Record<Lang, string>;
  text: Record<Lang, string>;
  /** One line that translates the quote to a developer's life. */
  lesson: Record<Lang, string>;
}
