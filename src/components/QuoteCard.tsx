"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LANGS, type DailyQuote, type Lang } from "@/lib/quotes/types";

type Strings = {
  eyebrow: string;
  locale: string;
  missing: string;
  save: string;
  copy: string;
  copied: string;
  story: string;
  post: string;
  light: string;
  dark: string;
  hintShare: string;
  hintDownload: string;
  preview: string;
  fallback: string;
  partial: string;
};

const UI: Record<Lang, Strings> = {
  en: {
    eyebrow: "Daily Stoic",
    locale: "en-GB",
    missing: "Translation unavailable right now. Showing the original.",
    save: "Save image",
    copy: "Copy text",
    copied: "Copied",
    story: "Story",
    post: "Post",
    light: "Light",
    dark: "Dark",
    hintShare: "Choose “Save Image” and post it from Instagram. You can also long-press the preview.",
    hintDownload: "The image is saved to your downloads.",
    preview: "Preview of the image to share",
    fallback: "Offline quote",
    partial: "Some translations unavailable",
  },
  es: {
    eyebrow: "Estoico del día",
    locale: "es-ES",
    missing: "Traducción no disponible ahora mismo. Se muestra el original.",
    save: "Guardar imagen",
    copy: "Copiar texto",
    copied: "Copiado",
    story: "Historia",
    post: "Post",
    light: "Claro",
    dark: "Oscuro",
    hintShare: "Elige «Guardar imagen» y súbela desde Instagram. También puedes mantener pulsada la vista previa.",
    hintDownload: "La imagen se guarda en tus descargas.",
    preview: "Vista previa de la imagen para compartir",
    fallback: "Cita sin conexión",
    partial: "Algunas traducciones no disponibles",
  },
  it: {
    eyebrow: "Stoico del giorno",
    locale: "it-IT",
    missing: "Traduzione non disponibile al momento. Mostro l'originale.",
    save: "Salva immagine",
    copy: "Copia testo",
    copied: "Copiato",
    story: "Storia",
    post: "Post",
    light: "Chiaro",
    dark: "Scuro",
    hintShare: "Scegli «Salva immagine» e pubblicala da Instagram. Puoi anche tenere premuta l'anteprima.",
    hintDownload: "L'immagine viene salvata nei download.",
    preview: "Anteprima dell'immagine da condividere",
    fallback: "Citazione offline",
    partial: "Alcune traduzioni non disponibili",
  },
};

type Format = "story" | "post";
type Theme = "light" | "dark";

/** Small segmented control (pill buttons), used for format and theme. */
function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: React.ReactNode }[];
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full border border-line p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={o.value === value}
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-300 ${
            o.value === value ? "bg-ink text-surface" : "text-muted hover:text-ink"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Whether this browser can hand a file to the native share sheet (iOS, Android). */
function useCanShareFiles() {
  return useSyncExternalStore(
    () => () => {},
    () => {
      try {
        const probe = new File([new Blob()], "probe.png", { type: "image/png" });
        return Boolean(navigator.canShare?.({ files: [probe] }));
      } catch {
        return false;
      }
    },
    () => false,
  );
}

function usePrefersDark() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
    () => false,
  );
}

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
  const [format, setFormat] = useState<Format>("story");
  // Starts with the visitor's theme; they can switch before saving.
  const prefersDark = usePrefersDark();
  const [themeChoice, setThemeChoice] = useState<Theme | null>(null);
  const theme: Theme = themeChoice ?? (prefersDark ? "dark" : "light");
  const canShareFiles = useCanShareFiles();
  const [preview, setPreview] = useState<string | null>(null);

  const t = UI[lang];
  const textFor = (l: Lang) => quote.text[l] ?? quote.text.en ?? "";
  const text = textFor(lang);
  const cardUrl = `/api/quote/card?lang=${lang}&format=${format}&theme=${theme}`;
  const fileName = `daily-stoic-${quote.date}-${lang}-${format}.png`;

  // Download the image ahead of the tap. iOS only opens the share sheet while the
  // tap is "fresh"; awaiting a network request first can make the share fail.
  const images = useRef(new Map<string, Promise<Blob>>());
  const loadImage = (url: string) => {
    let pending = images.current.get(url);
    if (!pending) {
      pending = fetch(url).then((r) => {
        if (!r.ok) throw new Error(`card ${r.status}`);
        return r.blob();
      });
      pending.catch(() => images.current.delete(url));
      images.current.set(url, pending);
    }
    return pending;
  };
  useEffect(() => {
    let cancelled = false;
    loadImage(cardUrl)
      .then((blob) => {
        if (cancelled) return;
        // Swap in the new preview only once it is ready, so it never flashes empty.
        const next = URL.createObjectURL(blob);
        setPreview((prev) => {
          if (prev) URL.revokeObjectURL(prev);
          return next;
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [cardUrl]);

  async function shareImage() {
    setBusy(true);
    try {
      const blob = await loadImage(cardUrl);
      const file = new File([blob], fileName, { type: "image/png" });
      // Mobile: native share sheet, where "Save Image" puts it in Photos for Instagram
      // (iOS has no other way to save to Photos from the web). Desktop: download.
      // Only the file is shared: when apps like Instagram also receive text, they
      // may keep the text and drop the image. The quote is already in the image.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
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

      <section className="mt-10 border-t border-line pt-6" aria-label={t.save}>
        <div className="flex gap-4 sm:gap-6">
          <div
            className={`relative shrink-0 overflow-hidden rounded-xl border border-line bg-bg transition-[width,aspect-ratio] duration-300 ${
              format === "story" ? "aspect-[9/16] w-24 sm:w-28" : "aspect-[4/5] w-28 sm:w-32"
            }`}
          >
            {preview ? (
              // Blob URL of the exact file that will be saved; long-press saves it on mobile.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt={t.preview} className="size-full object-cover" />
            ) : (
              <div className="size-full animate-pulse bg-line/60" />
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <Segmented<Format>
              label="Format"
              value={format}
              onChange={setFormat}
              options={[
                { value: "story", label: <Crossfade active={lang} render={(l) => UI[l].story} /> },
                { value: "post", label: <Crossfade active={lang} render={(l) => UI[l].post} /> },
              ]}
            />
            <Segmented<Theme>
              label="Theme"
              value={theme}
              onChange={setThemeChoice}
              options={[
                { value: "light", label: <Crossfade active={lang} render={(l) => UI[l].light} /> },
                { value: "dark", label: <Crossfade active={lang} render={(l) => UI[l].dark} /> },
              ]}
            />
            <button
              onClick={shareImage}
              disabled={busy}
              className="mt-auto rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-ink transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              <Crossfade active={lang} render={(l) => UI[l].save} />
            </button>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          <Crossfade active={lang} render={(l) => (canShareFiles ? UI[l].hintShare : UI[l].hintDownload)} />
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            onClick={copyText}
            className="rounded-full border border-line px-4 py-2 text-xs font-medium transition-colors hover:border-ink"
          >
            <Crossfade active={lang} render={(l) => (copied ? UI[l].copied : UI[l].copy)} />
          </button>
          {status && (
            <span className="ml-auto rounded-full border border-line px-3 py-1 text-xs text-muted">{status}</span>
          )}
        </div>
      </section>
    </article>
  );
}
