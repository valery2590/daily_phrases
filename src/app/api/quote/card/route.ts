import { NextResponse, type NextRequest } from "next/server";
import { getDailyQuote, getQuoteById, secondsUntilNextDay } from "@/lib/quotes/getDailyQuote";
import { isLang, LANGS } from "@/lib/quotes/types";
import { CARD_FORMATS, isCardFormat, isCardTheme, renderQuoteCard, shareFooter } from "@/lib/share/renderCard";

/**
 * GET /api/quote/card?lang=es&format=story  → PNG of today's quote, ready to share.
 * format: story (1080×1920) · post (1080×1350) · og (1200×630). theme: light · dark.
 * Defaults: en, post, light.
 * id: a catalog entry instead of today's (development only, to preview cards).
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lang = params.get("lang") ?? "en";
  const format = params.get("format") ?? "post";
  const theme = params.get("theme") ?? "light";

  if (!isLang(lang)) {
    return NextResponse.json({ error: `Unsupported lang. Use one of: ${LANGS.join(", ")}.` }, { status: 400 });
  }
  if (!isCardFormat(format)) {
    return NextResponse.json(
      { error: `Unsupported format. Use one of: ${Object.keys(CARD_FORMATS).join(", ")}.` },
      { status: 400 },
    );
  }

  if (!isCardTheme(theme)) {
    return NextResponse.json({ error: "Unsupported theme. Use light or dark." }, { status: 400 });
  }

  const now = new Date();
  const previewId = process.env.NODE_ENV === "production" ? null : params.get("id");
  const quote = previewId ? getQuoteById(previewId, now) : getDailyQuote(now);
  if (!quote) {
    return NextResponse.json({ error: `Unknown id "${previewId}".` }, { status: 404 });
  }

  const image = await renderQuoteCard(quote, lang, format, shareFooter(), theme);

  // The quote is fixed for the whole UTC day: shared caches keep the image until midnight.
  image.headers.set("Cache-Control", previewId ? "no-store" : `public, s-maxage=${secondsUntilNextDay(now)}`);
  image.headers.set("Content-Disposition", `inline; filename="daily-stoic-${quote.date}-${lang}-${format}-${theme}.png"`);
  return image;
}
