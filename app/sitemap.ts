import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { services } from "@/lib/services";

/**
 * Build-time timestamp. The site is statically generated, so a rebuild genuinely is the
 * moment every page last changed - but stamping "now" on routes that did not change is
 * the noise that makes crawlers stop trusting lastmod. Routes are therefore grouped by
 * how often their underlying data actually moves, and content routes carry a date that
 * only advances when their data file is edited.
 *
 * When you edit lib/services.ts, lib/packages.ts, lib/gear.ts or lib/media.ts, bump the
 * matching constant below. That keeps lastmod honest, which matters: Perplexity and
 * other answer engines weight freshness heavily when choosing sources.
 */
const BUILD_DATE = new Date();

/** Bump when the data behind each area changes. Format: YYYY-MM-DD. */
const CONTENT_UPDATED = {
  home: "2026-09-21",
  services: "2026-09-21",
  gear: "2026-09-21",
  portfolio: "2026-09-21",
  estimate: "2026-09-21",
  contact: "2026-09-21",
} as const;

const d = (iso: string) => {
  const parsed = new Date(`${iso}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? BUILD_DATE : parsed;
};

/** Brand imagery for image search; add /media photos here once they exist. */
const brandImages = [`${site.url}/logo.png`, `${site.url}/opengraph-image.png`];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${site.url}/`,
      lastModified: d(CONTENT_UPDATED.home),
      changeFrequency: "weekly",
      priority: 1,
      images: brandImages,
    },
    { url: `${site.url}/services`, lastModified: d(CONTENT_UPDATED.services), changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/estimate`, lastModified: d(CONTENT_UPDATED.estimate), changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/gear`, lastModified: d(CONTENT_UPDATED.gear), changeFrequency: "monthly", priority: 0.7 },
    {
      url: `${site.url}/portfolio`,
      lastModified: d(CONTENT_UPDATED.portfolio),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${site.url}/contact`, lastModified: d(CONTENT_UPDATED.contact), changeFrequency: "yearly", priority: 0.8 },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${site.url}/services/${s.slug}`,
    lastModified: d(CONTENT_UPDATED.services),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...serviceRoutes];
}
