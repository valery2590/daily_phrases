import { NextResponse, type NextRequest } from "next/server";
import { getDailyQuote, secondsUntilNextDay, utcDateKey } from "@/lib/quotes/getDailyQuote";
import { isLang, LANGS } from "@/lib/quotes/types";

/**
 * GET /api/quote            → today's quote + dev lesson in every language
 * GET /api/quote?lang=it    → the same, in one language
 */
export async function GET(request: NextRequest) {
  const lang = request.nextUrl.searchParams.get("lang");

  if (lang !== null && !isLang(lang)) {
    return NextResponse.json(
      { error: `Unsupported lang "${lang}". Use one of: ${LANGS.join(", ")}.` },
      { status: 400 },
    );
  }

  const now = new Date();
  const quote = getDailyQuote(now);
  if (!quote) {
    // Quotes are never repeated: before launch or once the catalog runs out, there is none.
    return NextResponse.json(
      { error: "No quote for today.", date: utcDateKey(now) },
      { status: 404, headers: { "Cache-Control": "public, s-maxage=60" } },
    );
  }
  const body = lang
    ? {
        date: quote.date,
        id: quote.id,
        lang,
        author: quote.author[lang],
        work: quote.work[lang],
        text: quote.text[lang],
        lesson: quote.lesson[lang],
      }
    : quote;

  return NextResponse.json(body, {
    // The quote is fixed for the whole UTC day: shared caches keep it until midnight.
    headers: { "Cache-Control": `public, s-maxage=${secondsUntilNextDay(now)}` },
  });
}
