import { describe, expect, it } from "vitest";
import { CATALOG } from "@/lib/quotes/catalog";
import { lessonLines } from "@/lib/quotes/lesson";
import { LANGS } from "@/lib/quotes/types";

describe("lessonLines", () => {
  it("splits one line per sentence", () => {
    expect(lessonLines("El servidor se cayó a las 3 a.m. El drama es opcional; el plan de reintentos, no.")).toEqual([
      "El servidor se cayó a las 3 a.m.",
      "El drama es opcional; el plan de reintentos, no.",
    ]);
  });

  it("keeps a single sentence on one line", () => {
    expect(lessonLines("Escribe cada log como si fueras tú quien lo lee a las 3 a.m.")).toHaveLength(1);
  });

  it("does not split before a lowercase word", () => {
    expect(lessonLines("Usa e.g. una cola. Luego reintenta.")).toEqual(["Usa e.g. una cola.", "Luego reintenta."]);
  });

  it("gives every catalog lesson at most 3 lines, so the editor panel fits the card", () => {
    for (const entry of CATALOG) {
      for (const lang of LANGS) {
        const lines = lessonLines(entry.lesson[lang]);
        expect(lines.length, `${entry.id} ${lang}`).toBeGreaterThanOrEqual(1);
        expect(lines.length, `${entry.id} ${lang}`).toBeLessThanOrEqual(3);
        expect(lines.join(" ")).toBe(entry.lesson[lang]);
      }
    }
  });
});
