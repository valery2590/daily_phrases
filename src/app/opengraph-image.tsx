import { connection } from "next/server";
import { getLatestQuote } from "@/lib/quotes/getDailyQuote";
import { CARD_FORMATS, renderQuoteCard, shareFooter } from "@/lib/share/renderCard";

// The preview Google Chat, WhatsApp, Slack or LinkedIn show when the link is pasted.
export const alt = "Estoico en producción: today's stoic quote and dev lesson";
export const size = CARD_FORMATS.og;
export const contentType = "image/png";

export default async function OpengraphImage() {
  await connection();
  const quote = getLatestQuote();
  return renderQuoteCard(quote, "en", "og", shareFooter());
}
