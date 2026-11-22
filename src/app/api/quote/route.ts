import { NextResponse, type NextRequest } from "next/server";
import { getDailyQuote } from "@/lib/quotes/getDailyQuote";
import { isLang, LANGS } from "@/lib/quotes/types";

/**
 * GET /api/quote            → today's quote in every language
 * GET /api/quote?lang=it    → today's quote in one language
 */
export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");

  if (lang !== null && !isLang(lang)) {
    return NextResponse.json(
      { error: `Unsupported lang "${lang}". Use one of: ${LANGS.join(", ")}.` },
      { status: 400 },
    );
  }

  const quote = await getDailyQuote();
  const body = lang
    ? {
        date: quote.date,
        lang,
        author: quote.author,
        text: quote.text[lang],
        source: quote.source,
        translation: quote.text[lang] === null ? "unavailable" : "ok",
      }
    : quote;

  return NextResponse.json(body, {
    headers: {
      // Shared caches (CDN) keep it for an hour; a fallback is cached briefly so we recover fast.
      "Cache-Control":
        quote.source === "live"
          ? "public, s-maxage=3600, stale-while-revalidate=86400"
          : "public, s-maxage=60",
    },
  });
}
