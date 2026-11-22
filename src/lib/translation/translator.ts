import type { Lang } from "@/lib/quotes/types";

/**
 * Any translation service plugs in behind this interface.
 * Swapping MyMemory for DeepL or Google means writing one new adapter;
 * nothing else in the app changes.
 */
export interface Translator {
  readonly name: string;
  translate(text: string, from: Lang, to: Lang): Promise<string>;
}
