import { connection } from "next/server";
import { getDailyQuote } from "@/lib/quotes/getDailyQuote";
import { QuoteCard } from "@/components/QuoteCard";
import { BRAND } from "@/lib/brand";

export default async function Home() {
  // Rendered per request so the quote switches exactly at UTC midnight. It is cheap:
  // the quote comes from the in-repo catalog, with no network calls.
  await connection();
  const quote = getDailyQuote();

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
          Quotes from public-domain works by Epictetus, Marcus Aurelius and Seneca.
        </span>
      </footer>
    </main>
  );
}
