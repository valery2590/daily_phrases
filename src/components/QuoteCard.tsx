"use client";

import { useState } from "react";
import { LANGS, type DailyQuote, type Lang } from "@/lib/quotes/types";

const UI: Record<Lang, { eyebrow: string; locale: string; missing: string; share: string; copy: string; copied: string; download: string; fallback: string; partial: string }> = {
  en: {
    eyebrow: "Daily Stoic",
    locale: "en-GB",
    missing: "Translation unavailable right now. Showing the original.",
    share: "Share image",
    copy: "Copy text",
    copied: "Copied",
    download: "Download",
    fallback: "Offline quote",
    partial: "Some translations unavailable",
  },
  es: {
    eyebrow: "Estoico del día",
    locale: "es-ES",
    missing: "Traducción no disponible ahora mismo. Se muestra el original.",
    share: "Compartir imagen",
    copy: "Copiar texto",
    copied: "Copiado",
    download: "Descargar",
    fallback: "Cita sin conexión",
    partial: "Algunas traducciones no disponibles",
  },
  it: {
    eyebrow: "Stoico del giorno",
    locale: "it-IT",
    missing: "Traduzione non disponibile al momento. Mostro l'originale.",
    share: "Condividi immagine",
    copy: "Copia testo",
    copied: "Copiato",
    download: "Scarica",
    fallback: "Citazione offline",
    partial: "Alcune traduzioni non disponibili",
  },
};

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${date}T00:00:00Z`),
  );
}

/**
 * Renders every language in the same grid cell and fades between them. The cell
 * always takes the size of the longest version, so switching language never
 * makes the card jump; only the visible one is exposed to screen readers.
 */
function Crossfade({
  active,
  render,
  className = "",
}: {
  active: Lang;
  render: (lang: Lang) => React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`grid ${className}`}>
      {LANGS.map((l) => (
        <span
          key={l}
          aria-hidden={l !== active}
          className={`col-start-1 row-start-1 transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none ${
            l === active ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-1 opacity-0"
          }`}
        >
          {render(l)}
        </span>
      ))}
    </span>
  );
}

export function QuoteCard({ quote }: { quote: DailyQuote }) {
  const [lang, setLang] = useState<Lang>("en");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  const t = UI[lang];
  const textFor = (l: Lang) => quote.text[l] ?? quote.text.en ?? "";
  const text = textFor(lang);
  const cardUrl = `/api/quote/card?lang=${lang}&format=story`;
  const fileName = `daily-stoic-${quote.date}-${lang}.png`;

  async function shareImage() {
    setBusy(true);
    try {
      const blob = await fetch(cardUrl).then((r) => {
        if (!r.ok) throw new Error(`card ${r.status}`);
        return r.blob();
      });
      const file = new File([blob], fileName, { type: "image/png" });
      // Mobile: native share sheet (Instagram, WhatsApp, Google Chat…). Desktop: download.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text: `“${text}” — ${quote.author}` });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") console.error(err);
    } finally {
      setBusy(false);
    }
  }

  async function copyText() {
    await navigator.clipboard.writeText(`“${text}”\n— ${quote.author}\n${window.location.origin}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const status =
    quote.source === "fallback" ? t.fallback : quote.translation === "partial" ? t.partial : null;

  return (
    <article className="rounded-3xl border border-line bg-surface p-6 shadow-[0_1px_0_var(--line)] sm:p-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <p className="flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.18em] text-accent">
          <span aria-hidden className="size-2 shrink-0 rounded-full bg-signal" />
          <Crossfade active={lang} render={(l) => `${UI[l].eyebrow} · ${formatDate(quote.date, UI[l].locale)}`} />
        </p>
        <div role="tablist" aria-label="Language" className="flex gap-1 rounded-full border border-line p-1">
          {LANGS.map((l) => (
            <button
              key={l}
              role="tab"
              aria-selected={l === lang}
              onClick={() => setLang(l)}
              className={`rounded-full px-3 py-1 text-xs font-medium uppercase transition-colors duration-300 ${
                l === lang ? "bg-accent text-accent-ink" : "text-muted hover:text-ink"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      <blockquote className="mt-10">
        <span aria-hidden className="block font-display text-7xl leading-[0.6] text-signal">
          “
        </span>
        <Crossfade
          active={lang}
          className="mt-2 text-balance font-display text-2xl font-semibold leading-snug tracking-tight sm:text-3xl"
          render={(l) => (
            <span lang={quote.text[l] === null ? "en" : l} className="block">
              {textFor(l)}
              {quote.text[l] === null && (
                <span className="mt-4 block font-sans text-sm font-normal tracking-normal text-muted">
                  {UI[l].missing}
                </span>
              )}
            </span>
          )}
        />
        <footer className="mt-6 flex items-center gap-3 text-muted">
          <span aria-hidden className="h-1 w-8 rounded-full bg-accent" />
          {quote.author}
        </footer>
      </blockquote>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <button
          onClick={shareImage}
          disabled={busy}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          <Crossfade active={lang} render={(l) => UI[l].share} />
        </button>
        <button
          onClick={copyText}
          className="rounded-full border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-ink"
        >
          <Crossfade active={lang} render={(l) => (copied ? UI[l].copied : UI[l].copy)} />
        </button>
        <a
          href={cardUrl}
          download={fileName}
          className="rounded-full px-3 py-2.5 text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
        >
          <Crossfade active={lang} render={(l) => UI[l].download} />
        </a>
        {status && (
          <span className="ml-auto rounded-full border border-line px-3 py-1 text-xs text-muted">{status}</span>
        )}
      </div>
    </article>
  );
}
