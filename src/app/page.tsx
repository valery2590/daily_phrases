import { connection } from "next/server";
import { getDailyQuote } from "@/lib/quotes/getDailyQuote";
import { QuoteCard } from "@/components/QuoteCard";
import { BRAND } from "@/lib/brand";

export default async function Home() {
  // Rendered per request on purpose: the data is cached (see getDailyQuote), and a
  // build-time prerender would fetch its own random quote and disagree with the API.
  await connection();
  const quote = await getDailyQuote();

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-12 sm:px-6">
      <QuoteCard quote={quote} />
      <footer className="mt-10 flex flex-col gap-3 text-sm text-muted">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span>
            Built by{" "}
            <a className="font-medium text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-accent" href={BRAND.url}>
              {BRAND.name}
            </a>
          </span>
          <a className="font-mono text-xs hover:text-ink" href="/api/quote">
            GET /api/quote
          </a>
        </div>
        <span className="text-xs">
          Quotes: <a className="underline decoration-line underline-offset-4 hover:text-ink" href="https://stoic.tekloon.net">Stoic Quote API</a>
          {" · "}Translation: <a className="underline decoration-line underline-offset-4 hover:text-ink" href="https://mymemory.translated.net">MyMemory</a>
        </span>
      </footer>
    </main>
  );
}
