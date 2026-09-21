import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { GoogleAnalytics } from "@next/third-parties/google";
import { site } from "@/lib/site";
import { localBusinessSchema, websiteSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | Line-Array Sound, DMX Stage Lighting & Truss Rigging in Indore`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  publisher: site.name,
  keywords: [
    "Mihir Sound & Light",
    "event sound system Indore",
    "line array rental Indore",
    "stage lighting Indore",
    "wedding sound and light Indore",
    "DJ setup Indore",
    "concert sound system Madhya Pradesh",
    "stage truss rental Indore",
    "event production company Indore",
    "sound and light company India",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: site.url,
    siteName: site.name,
    title: `${site.name} | Engineered Sound. Choreographed Light.`,
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} | Event Sound & Lighting in Indore`,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  verification: { google: site.analytics.googleSiteVerification },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  category: "Event production",
  other: {
    "geo.region": `IN-${site.address.regionCode}`,
    "geo.placename": `${site.address.locality}, ${site.address.region}`,
    "geo.position": `${site.geo.lat};${site.geo.lng}`,
    ICBM: `${site.geo.lat}, ${site.geo.lng}`,
    "google-adsense-account": site.analytics.adsenseClient,
  },
};

export const viewport: Viewport = {
  themeColor: "#07090d",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Paint under the notch and home indicator; components pad back out with env(safe-area-inset-*).
  viewportFit: "cover",
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`dark ${spaceGrotesk.variable} ${jetbrains.variable}`}>
      <head>
        <JsonLd data={[localBusinessSchema(), websiteSchema()]} />
      </head>
      <body className="min-h-dvh bg-charcoal font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-amber focus:px-4 focus:py-2 focus:text-black">
          Skip to content
        </a>
        {children}
        <GoogleAnalytics gaId={site.analytics.gaId} />
        <Script
          id="adsense"
          strategy="lazyOnload"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${site.analytics.adsenseClient}`}
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
