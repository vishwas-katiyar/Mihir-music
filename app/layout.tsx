import type { Metadata, Viewport } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
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
  // Fallback only: every public page sets its own <=160-char description. This one reaches the 404 page.
  description:
    "Line-array sound, DMX stage lighting, certified truss rigging and show crew for weddings, concerts and corporate events in Indore and across Madhya Pradesh.",
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
  // Google Search only shows favicons in ICO/PNG/JPEG/GIF/BMP (never SVG) and may ignore every rel=icon if one
  // fails its guidelines, so favicon.svg stays off this list. favicon.ico lives in public/ (not app/) so its URL is
  // stable: app/favicon.ico gets a content-hash query string from Next, and Google wants a hash-free, crawlable URL.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-gold focus:px-4 focus:py-2 focus:text-black">
          Skip to content
        </a>
        {children}
        <GoogleAnalytics gaId={site.analytics.gaId} />
      </body>
    </html>
  );
}
