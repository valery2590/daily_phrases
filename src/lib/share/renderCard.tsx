import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { DailyQuote, Lang } from "@/lib/quotes/types";
import { APP_NAME, brandHost } from "@/lib/brand";

/** Sizes for the places people actually share to. */
export const CARD_FORMATS = {
  story: { width: 1080, height: 1920 }, // Instagram / WhatsApp stories
  post: { width: 1080, height: 1350 }, // Instagram feed (4:5)
  og: { width: 1200, height: 630 }, // link previews: Google Chat, WhatsApp, Slack, LinkedIn
} as const;
export type CardFormat = keyof typeof CARD_FORMATS;

export function isCardFormat(value: unknown): value is CardFormat {
  return typeof value === "string" && value in CARD_FORMATS;
}

// Same palettes as valeryfigueroahuaman.com.
const THEMES = {
  light: {
    bg: "#edeff4",
    ink: "#131826",
    muted: "#5a6277",
    line: "#d8dce6",
    accent: "#3a36e0",
    signal: "#f2762e",
  },
  dark: {
    bg: "#0d1120",
    ink: "#e7eaf3",
    muted: "#98a0b6",
    line: "#262d44",
    accent: "#8d89ff",
    signal: "#ff9a55",
  },
} as const;
export type CardTheme = keyof typeof THEMES;

export function isCardTheme(value: unknown): value is CardTheme {
  return value === "light" || value === "dark";
}

const LABELS: Record<Lang, { eyebrow: string; locale: string }> = {
  en: { eyebrow: APP_NAME, locale: "en-GB" },
  es: { eyebrow: APP_NAME, locale: "es-ES" },
  it: { eyebrow: APP_NAME, locale: "it-IT" },
};

const fontDir = join(process.cwd(), "assets", "fonts");
let fontsPromise: Promise<{ display: Buffer; body: Buffer; bodyMedium: Buffer }> | undefined;
function loadFonts() {
  fontsPromise ??= Promise.all([
    readFile(join(fontDir, "bricolage-grotesque-latin-600-normal.woff")),
    readFile(join(fontDir, "ibm-plex-sans-latin-400-normal.woff")),
    readFile(join(fontDir, "ibm-plex-sans-latin-500-normal.woff")),
  ]).then(([display, body, bodyMedium]) => ({ display, body, bodyMedium }));
  return fontsPromise;
}

/** Long quotes get a smaller type size so they always fit the card. */
function quoteFontSize(text: string, format: CardFormat): number {
  const base = { story: 76, post: 64, og: 46 }[format];
  const len = text.length;
  if (len < 90) return base;
  if (len < 180) return Math.round(base * 0.8);
  if (len < 300) return Math.round(base * 0.64);
  return Math.round(base * 0.52);
}

function formatDate(date: string, lang: Lang): string {
  return new Intl.DateTimeFormat(LABELS[lang].locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export async function renderQuoteCard(
  quote: DailyQuote,
  lang: Lang,
  format: CardFormat,
  footer: string,
  theme: CardTheme = "light",
): Promise<ImageResponse> {
  const C = THEMES[theme];
  const { width, height } = CARD_FORMATS[format];
  const text = quote.text[lang];
  const shownLang = lang;
  const fonts = await loadFonts();

  const pad = format === "og" ? 64 : 96;
  const fontSize = quoteFontSize(text, format);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: C.bg,
          padding: pad,
          fontFamily: "Plex",
          color: C.ink,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: C.signal }} />
          <div
            style={{
              fontSize: format === "og" ? 22 : 30,
              fontWeight: 500,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: C.accent,
            }}
          >
            {`${LABELS[shownLang].eyebrow} · ${formatDate(quote.date, shownLang)}`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: "Bricolage",
              fontSize: fontSize * 2.4,
              lineHeight: 0.8,
              height: fontSize * 1.3,
              color: C.signal,
            }}
          >
            “
          </div>
          <div
            style={{
              fontFamily: "Bricolage",
              fontSize,
              lineHeight: 1.22,
              letterSpacing: -0.5,
            }}
          >
            {text}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: fontSize * 0.8 }}>
            <div style={{ width: 48, height: 4, borderRadius: 2, background: C.accent }} />
            <div style={{ fontSize: Math.max(24, Math.round(fontSize * 0.5)), color: C.muted }}>
              {quote.author[lang]}
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `2px solid ${C.line}`,
            paddingTop: format === "og" ? 20 : 32,
            fontSize: format === "og" ? 20 : 26,
            color: C.muted,
          }}
        >
          <div>{footer}</div>
          <div style={{ display: "flex", gap: 10 }}>
            {(["en", "es", "it"] as const).map((l) => (
              <div
                key={l}
                style={{
                  padding: "4px 12px",
                  borderRadius: 999,
                  border: `2px solid ${l === shownLang ? C.accent : C.line}`,
                  color: l === shownLang ? C.accent : C.muted,
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                {l}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
      fonts: [
        { name: "Bricolage", data: fonts.display, weight: 600, style: "normal" },
        { name: "Plex", data: fonts.body, weight: 400, style: "normal" },
        { name: "Plex", data: fonts.bodyMedium, weight: 500, style: "normal" },
      ],
    },
  );
}

/** Text shown at the bottom of the card: the author's site by default. */
export function shareFooter(): string {
  return process.env.SHARE_FOOTER ?? brandHost;
}
