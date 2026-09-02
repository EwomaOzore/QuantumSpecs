import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE, siteJsonLd, siteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const origin = siteUrl();

export const viewport: Viewport = {
  themeColor: "#07090c",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL(origin),
  title: {
    default: `${SITE.name} · Kora operations`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.tagline,
  applicationName: SITE.name,
  authors: [{ name: "QuantumSpecs" }],
  creator: SITE.name,
  publisher: SITE.name,
  keywords: [
    "Kora",
    "payments",
    "operations",
    "Lagos",
    "Africa",
    "checkout",
    "incidents",
    "globe",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: origin,
    siteName: SITE.name,
    title: `${SITE.name} · Kora operations`,
    description: SITE.tagline,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} · Kora operations`,
    description: SITE.tagline,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon" }],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-qs-bg font-sans text-qs-text">
        <JsonLd data={siteJsonLd()} />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
