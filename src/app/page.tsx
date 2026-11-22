import { connection } from "next/server";
import { getDailyQuote, remainingDays, utcDateKey } from "@/lib/quotes/getDailyQuote";
import { QuoteCard } from "@/components/QuoteCard";
import { APP_NAME, BRAND, TAGLINE } from "@/lib/brand";
import { VfhSymbol } from "@/components/VfhSymbol";

export default async function Home() {
  // Rendered per request so the quote switches exactly at UTC midnight. It is cheap:
  // the quote comes from the in-repo catalog, with no network calls.
  await connection();
  const now = new Date();
  const quote = getDailyQuote(now);
  const remaining = remainingDays(utcDateKey(now));

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-12 sm:px-6">
      {quote ? <QuoteCard quote={quote} remaining={remaining} /> : <NoQuote />}
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
          {TAGLINE.en} Quotes from public-domain works by Epictetus, Marcus Aurelius and Seneca.
        </span>
      </footer>
    </main>
  );
}

/** Quotes are never repeated: when the catalog runs out, the page says so instead of looping. */
function NoQuote() {
  return (
    <article className="rounded-3xl border border-line bg-surface p-6 sm:p-10">
      <div className="flex items-center gap-3">
        <VfhSymbol className="size-8 shrink-0" />
        <h1 className="text-xs font-medium uppercase tracking-[0.18em] text-accent">{APP_NAME}</h1>
      </div>
      <div className="mt-8 flex flex-col gap-4 font-mono text-sm leading-relaxed">
        <p lang="es">
          <span className="text-muted">{"// "}</span>Hoy no hay cita nueva: las citas no se repiten. Añade entradas al catálogo.
        </p>
        <p lang="en">
          <span className="text-muted">{"// "}</span>No new quote today: quotes are never repeated. Add entries to the catalog.
        </p>
        <p lang="it">
          <span className="text-muted">{"// "}</span>Oggi nessuna citazione nuova: le citazioni non si ripetono. Aggiungi voci al catalogo.
        </p>
      </div>
    </article>
  );
}
