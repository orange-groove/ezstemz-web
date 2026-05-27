import type { Metadata } from "next";

import { LICENSE_PRICE } from "@/lib/pricing";
import { PLATFORMS_SHORT } from "@/lib/platforms";

/** Canonical marketing site URL — must match NEXT_PUBLIC_SITE_URL in production. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ezstemz.com").replace(/\/$/, "");
}

export const SITE_NAME = "EZStemz";

/**
 * Primary search phrases. Use naturally in titles, H1s, and copy — not stuffed.
 * Google largely ignores the meta keywords tag; these guide our metadata strings.
 */
export const SEO_KEYWORDS = [
  "stem separator",
  "AI stem separation",
  "split song into stems",
  "vocal remover",
  "isolate vocals",
  "drum stem extractor",
  "bass stem separation",
  "guitar stem separation",
  "piano stem separation",
  "local stem separation",
  "offline stem splitter",
  "demucs",
  "stem separation software",
  "macOS stem separator",
  "Windows stem separator",
  "DAW stems export",
] as const;

export const DEFAULT_DESCRIPTION =
  `EZStemz splits songs into drums, bass, vocals, guitar, piano, and other stems on your computer — ` +
  `100% local AI, no cloud upload. ${PLATFORMS_SHORT}. One-time ${LICENSE_PRICE} license.`;

export const OG_IMAGE = {
  url: "/screenshot.png",
  width: 3438,
  height: 1910,
  alt: "EZStemz multitrack stem editor with waveforms and mixer on macOS",
} as const;

/** Shared Open Graph / Twitter defaults for marketing pages. */
export function sharedOpenGraph(title: string, description: string): Metadata["openGraph"] {
  const base = siteUrl();
  return {
    title,
    description,
    url: base,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
    images: [{ ...OG_IMAGE, url: `${base}${OG_IMAGE.url}` }],
  };
}

export function sharedTwitter(title: string, description: string): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title,
    description,
    images: [`${siteUrl()}${OG_IMAGE.url}`],
  };
}

/** License price as a number for schema.org Offer (strip "$"). */
export function licensePriceAmount(): string {
  return LICENSE_PRICE.replace(/[^0-9.]/g, "") || "20";
}
