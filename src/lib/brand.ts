import type { Lang } from "@/lib/quotes/types";

/** Who signs the page and the share images. Change it here if you fork the project. */
export const BRAND = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Valery Figueroa Huaman",
  url: process.env.NEXT_PUBLIC_BRAND_URL ?? "https://valeryfigueroahuaman.com",
};

export const brandHost = new URL(BRAND.url).host;

/** The app's name. A proper noun: it stays in Spanish in every language. */
export const APP_NAME = "Estoico en producción";

/** Used in file names. */
export const APP_SLUG = "estoico-en-produccion";

export const TAGLINE: Record<Lang, string> = {
  es: "Calma estoica para sistemas que fallan.",
  en: "Stoic calm for systems that fail.",
  it: "Calma stoica per sistemi che falliscono.",
};
