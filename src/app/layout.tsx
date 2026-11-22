import type { Metadata } from "next";
import { Bricolage_Grotesque, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { APP_NAME, BRAND, TAGLINE } from "@/lib/brand";

const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const plex = IBM_Plex_Sans({ variable: "--font-plex", subsets: ["latin"], weight: ["400", "500", "600"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: APP_NAME,
  description: `${TAGLINE.en} One stoic quote a day and what it means for developers, in English, Spanish and Italian.`,
  openGraph: { title: APP_NAME, description: TAGLINE.en, siteName: APP_NAME, type: "website" },
  twitter: { card: "summary_large_image", title: APP_NAME, description: TAGLINE.en },
  authors: [{ name: BRAND.name, url: BRAND.url }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${bricolage.variable} ${plex.variable} ${jetbrains.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
