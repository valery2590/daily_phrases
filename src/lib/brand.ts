/** Who signs the page and the share images. Change it here if you fork the project. */
export const BRAND = {
  name: process.env.NEXT_PUBLIC_BRAND_NAME ?? "Valery Figueroa Huaman",
  url: process.env.NEXT_PUBLIC_BRAND_URL ?? "https://valeryfigueroahuaman.com",
};

export const brandHost = new URL(BRAND.url).host;
