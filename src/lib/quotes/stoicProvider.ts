import { z } from "zod";
import { fetchWithRetry, UpstreamError } from "@/lib/http/fetchWithRetry";
import type { SourceQuote } from "./types";

const SERVICE = "stoic-api";
const DEFAULT_URL = "https://stoic.tekloon.net/stoic-quote";

/**
 * Upstream contract. We validate it instead of trusting it: if the API changes
 * shape, we want a clear error (and the fallback), not "undefined" on screen.
 */
const StoicResponse = z.object({
  data: z.object({
    author: z.string().trim().min(1),
    quote: z.string().trim().min(1),
  }),
});

/**
 * The upstream data is crowd-sourced and comes with artefacts seen in practice:
 * enclosed symbols appended to the text ("…fragmentary. ⓐ") and authors written
 * as handles ("TheAncientSage").
 */
export function normalizeQuote(raw: { author: string; quote: string }): SourceQuote {
  const text = raw.quote
    .replace(/[\u2460-\u24FF\u{1F100}-\u{1F1FF}]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  const author = /\s/.test(raw.author) ? raw.author : raw.author.replace(/(?<=[a-z])(?=[A-Z])/g, " ");
  return { author: author.trim(), text };
}

export interface QuoteProvider {
  /** Today's quote. `date` (YYYY-MM-DD) makes the request cacheable per day. */
  fetchQuote(date: string): Promise<SourceQuote>;
}

const DAY = 60 * 60 * 24;

export function createStoicProvider(
  url: string = process.env.STOIC_API_URL ?? DEFAULT_URL,
): QuoteProvider {
  return {
    async fetchQuote(date) {
      // The endpoint returns a random quote per call. Adding the date (ignored by
      // the API) gives Next's fetch cache one key per day, identical in every route,
      // so the page, the JSON API and the share image all get the same quote.
      const requestUrl = new URL(url);
      requestUrl.searchParams.set("day", date);

      const res = await fetchWithRetry(
        requestUrl,
        { headers: { accept: "application/json" }, next: { revalidate: DAY } },
        { service: SERVICE },
      );

      let body: unknown;
      try {
        body = await res.json();
      } catch (err) {
        throw new UpstreamError(`${SERVICE} returned invalid JSON`, SERVICE, res.status, {
          cause: err,
        });
      }

      const parsed = StoicResponse.safeParse(body);
      if (!parsed.success) {
        throw new UpstreamError(`${SERVICE} returned an unexpected shape`, SERVICE, res.status, {
          cause: parsed.error,
        });
      }

      const quote = normalizeQuote(parsed.data.data);
      if (!quote.text) throw new UpstreamError(`${SERVICE} returned an empty quote`, SERVICE, res.status);
      return quote;
    },
  };
}
