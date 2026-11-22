import { z } from "zod";
import { fetchWithRetry, UpstreamError } from "@/lib/http/fetchWithRetry";
import type { Lang } from "@/lib/quotes/types";
import type { Translator } from "./translator";

const SERVICE = "mymemory";
const DEFAULT_URL = "https://api.mymemory.translated.net/get";

/**
 * MyMemory answers HTTP 200 even when it fails: the real status lives in
 * `responseStatus`, and an exhausted daily quota is flagged in `quotaFinished`.
 * `responseStatus` comes back as a number or a numeric string depending on the error.
 */
const MyMemoryResponse = z.object({
  responseData: z.object({ translatedText: z.string() }),
  responseStatus: z.coerce.number(),
  responseDetails: z.string().optional(),
  quotaFinished: z.boolean().nullable().optional(),
});

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
};

/**
 * Translation memories return small artefacts: HTML entities, and quote marks
 * that were not in the source (seen in practice: a stray trailing `"`).
 * We only strip quote marks the source text did not have.
 */
export function sanitizeTranslation(translated: string, source: string): string {
  let out = translated.replace(/&(amp|quot|#39|apos|lt|gt);/g, (m) => ENTITIES[m] ?? m);
  out = out.replace(/\s+/g, " ").trim();

  const quoteChars = /^["“”«»]+|["“”«»]+$/g;
  const sourceIsQuoted = /^["“”«»]|["“”«»]$/.test(source.trim());
  if (!sourceIsQuoted) out = out.replace(quoteChars, "").trim();

  return out;
}

export function createMyMemoryTranslator(
  url: string = process.env.MYMEMORY_API_URL ?? DEFAULT_URL,
): Translator {
  return {
    name: SERVICE,
    async translate(text, from: Lang, to: Lang) {
      if (from === to) return text;

      const requestUrl = new URL(url);
      requestUrl.searchParams.set("q", text);
      requestUrl.searchParams.set("langpair", `${from}|${to}`);

      const res = await fetchWithRetry(requestUrl, { cache: "no-store" }, { service: SERVICE });

      const parsed = MyMemoryResponse.safeParse(await res.json().catch(() => null));
      if (!parsed.success) {
        throw new UpstreamError(`${SERVICE} returned an unexpected shape`, SERVICE, res.status, {
          cause: parsed.error,
        });
      }

      const { responseData, responseStatus, responseDetails, quotaFinished } = parsed.data;
      if (quotaFinished) {
        throw new UpstreamError(`${SERVICE} daily quota exhausted`, SERVICE, 429);
      }
      if (responseStatus !== 200) {
        throw new UpstreamError(
          `${SERVICE} error ${responseStatus}: ${responseDetails ?? "unknown"}`,
          SERVICE,
          responseStatus,
        );
      }

      const clean = sanitizeTranslation(responseData.translatedText, text);
      if (!clean) throw new UpstreamError(`${SERVICE} returned an empty translation`, SERVICE);
      return clean;
    },
  };
}
