import { afterEach, describe, expect, it, vi } from "vitest";
import { createMyMemoryTranslator, sanitizeTranslation } from "@/lib/translation/myMemory";
import { jsonResponse, mockFetch } from "./helpers";

afterEach(() => vi.unstubAllGlobals());

const ok = (translatedText: string) =>
  jsonResponse({ responseData: { translatedText }, responseStatus: 200, quotaFinished: false });

describe("sanitizeTranslation", () => {
  it("removes quote marks the source did not have (seen in real responses)", () => {
    expect(sanitizeTranslation('Soffriamo di più nell’immaginazione.\"', "We suffer more in imagination.")).toBe(
      "Soffriamo di più nell’immaginazione.",
    );
  });

  it("keeps quote marks when the source is quoted", () => {
    expect(sanitizeTranslation("“Ciao”", "“Hello”")).toBe("“Ciao”");
  });

  it("decodes HTML entities and collapses whitespace", () => {
    expect(sanitizeTranslation("Tom &amp; Jerry  &#39;ok&#39;", "x")).toBe("Tom & Jerry 'ok'");
  });
});

describe("MyMemory translator", () => {
  const translator = createMyMemoryTranslator("https://mymemory.test/get");

  it("sends the language pair and returns the clean text", async () => {
    const fetch = mockFetch(ok("Hola mundo\""));
    await expect(translator.translate("Hello world", "en", "es")).resolves.toBe("Hola mundo");
    const url = new URL(String((fetch.mock.calls[0] as unknown[])[0]));
    expect(url.searchParams.get("langpair")).toBe("en|es");
  });

  it("skips the call when source and target are the same", async () => {
    const fetch = mockFetch();
    await expect(translator.translate("Hello", "en", "en")).resolves.toBe("Hello");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fails on an exhausted daily quota even though HTTP is 200", async () => {
    mockFetch(jsonResponse({ responseData: { translatedText: "MYMEMORY WARNING" }, responseStatus: 429, quotaFinished: true }));
    await expect(translator.translate("Hello", "en", "it")).rejects.toThrow("quota exhausted");
  });

  it("fails on an error reported in the body", async () => {
    mockFetch(jsonResponse({ responseData: { translatedText: "" }, responseStatus: "403", responseDetails: "INVALID LANGUAGE PAIR" }));
    await expect(translator.translate("Hello", "en", "it")).rejects.toThrow("error 403: INVALID LANGUAGE PAIR");
  });
});
