import type { Metadata } from "next";

import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { SiteSchemas } from "@/components/seo/site-schemas";
import { Provider } from "@/components/ui/provider";
import {
  DEFAULT_DESCRIPTION,
  SEO_KEYWORDS,
  sharedOpenGraph,
  sharedTwitter,
  SITE_NAME,
  siteUrl,
} from "@/lib/seo";

const defaultTitle = `${SITE_NAME} — local AI stem separation for your music`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: defaultTitle,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [...SEO_KEYWORDS],
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: sharedOpenGraph(defaultTitle, DEFAULT_DESCRIPTION),
  twitter: sharedTwitter(defaultTitle, DEFAULT_DESCRIPTION),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SiteSchemas />
        <Provider defaultTheme="dark" enableSystem={false}>
          {children}
        </Provider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
