import { connection } from "next/server";
import { getDailyQuote } from "@/lib/quotes/getDailyQuote";
import { CARD_FORMATS, renderQuoteCard, shareFooter } from "@/lib/share/renderCard";

// The preview Google Chat, WhatsApp, Slack or LinkedIn show when the link is pasted.
export const alt = "Today's stoic quote";
export const size = CARD_FORMATS.og;
export const contentType = "image/png";

export default async function OpengraphImage() {
  await connection();
  const quote = getDailyQuote();
  return renderQuoteCard(quote, "en", "og", shareFooter());
}
