import { NextResponse, type NextRequest } from "next/server";
import { getDailyQuote } from "@/lib/quotes/getDailyQuote";
import { isLang, LANGS } from "@/lib/quotes/types";
import { CARD_FORMATS, isCardFormat, isCardTheme, renderQuoteCard, shareFooter } from "@/lib/share/renderCard";

/**
 * GET /api/quote/card?lang=es&format=story  → PNG of today's quote, ready to share.
 * format: story (1080×1920) · post (1080×1350) · og (1200×630). theme: light · dark.
 * Defaults: en, post, light.
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

  const quote = await getDailyQuote();
  const image = await renderQuoteCard(quote, lang, format, shareFooter(), theme);

  image.headers.set(
    "Cache-Control",
    quote.source === "live" ? "public, s-maxage=3600, stale-while-revalidate=86400" : "public, s-maxage=60",
  );
  image.headers.set("Content-Disposition", `inline; filename="daily-stoic-${quote.date}-${lang}-${format}-${theme}.png"`);
  return image;
}
