import type { Metadata } from "next";

import { Provider } from "@/components/ui/provider";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "EZStemz — local AI stem separation for your music",
    template: "%s · EZStemz",
  },
  description:
    "EZStemz is a native macOS and Windows app that splits any song into its drums, bass, vocals, guitar, piano, and 'other' stems — locally, on your own CPU. No accounts, no cloud, no upload.",
  openGraph: {
    title: "EZStemz — local AI stem separation",
    description:
      "Drop in an MP3 and get clean drums/bass/vocals/guitar/piano/other stems in minutes. Runs entirely on your machine.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EZStemz",
    description: "Local AI stem separation for macOS + Windows.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider defaultTheme="dark" enableSystem={false}>
          {children}
        </Provider>
      </body>
    </html>
  );
}
