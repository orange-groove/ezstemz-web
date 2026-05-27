import { JsonLd } from "@/components/seo/json-ld";
import { LICENSE_PRICE } from "@/lib/pricing";
import { PLATFORMS_SHORT } from "@/lib/platforms";
import {
  DEFAULT_DESCRIPTION,
  licensePriceAmount,
  SITE_NAME,
  siteUrl,
} from "@/lib/seo";

const base = siteUrl();

/** Site-wide structured data for rich results (SoftwareApplication + WebSite). */
export function SiteSchemas() {
  return (
    <JsonLd
      data={[
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: base,
          description: DEFAULT_DESCRIPTION,
        },
        {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: SITE_NAME,
          applicationCategory: "MultimediaApplication",
          operatingSystem: "macOS, Windows",
          description: DEFAULT_DESCRIPTION,
          url: base,
          image: `${base}/screenshot.png`,
          offers: {
            "@type": "Offer",
            price: licensePriceAmount(),
            priceCurrency: "USD",
            description: `One-time license — ${LICENSE_PRICE}`,
            url: `${base}/pricing`,
          },
          featureList: [
            "6-stem AI separation (drums, bass, vocals, guitar, piano, other)",
            "100% offline processing on your CPU",
            "Built-in mixer and 44.1 kHz WAV export",
            PLATFORMS_SHORT,
          ],
        },
      ]}
    />
  );
}

type FaqEntry = { q: string; a: string };

export function FaqSchema({ entries }: { entries: FaqEntry[] }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: entries.map((entry) => ({
          "@type": "Question",
          name: entry.q,
          acceptedAnswer: {
            "@type": "Answer",
            text: entry.a,
          },
        })),
      }}
    />
  );
}
