import type { Lang } from "./types";

/** File name shown on the code-editor tab around the lesson. */
export const LESSON_FILE: Record<Lang, string> = {
  es: "leccion.ts",
  en: "lesson.ts",
  it: "lezione.ts",
};

/**
 * Splits a lesson into editor "lines", one per sentence, so the card can number
 * them like code. Long sentences still soft-wrap inside their line.
 * "3 a.m. El drama…" splits after "a.m."; "a.m" inside a word does not split.
 */
export function lessonLines(lesson: string): string[] {
  return lesson
    .trim()
    .split(/(?<=[.!?…])\s+(?=[\p{Lu}¿¡«“"])/u)
    .map((line) => line.trim())
    .filter(Boolean);
}
