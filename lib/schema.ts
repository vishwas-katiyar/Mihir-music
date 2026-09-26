import type { Metadata } from "next";
import { site } from "./site";
import { services, type Service } from "./services";
import { faqs, type Faq } from "./faqs";
import { packages } from "./packages";

/** Absolute URL. The bare root matches the rendered canonical (`site.url`, no trailing slash). */
const abs = (path: string) => (path === "/" ? site.url : `${site.url}${path}`);

/** Stable node ids so every block on the site references one entity, not many copies. */
export const ID = {
  business: abs("/#business"),
  website: abs("/#website"),
  logo: abs("/#logo"),
} as const;

/**
 * Topics this business demonstrably works in, linked to Wikipedia so knowledge-graph
 * builders (Google, Bing, Perplexity) can resolve the concepts to known entities
 * rather than guessing from free text.
 */
const knowsAbout = [
  { name: "Line array", url: "https://en.wikipedia.org/wiki/Line_array" },
  { name: "Sound reinforcement system", url: "https://en.wikipedia.org/wiki/Sound_reinforcement_system" },
  { name: "Subwoofer", url: "https://en.wikipedia.org/wiki/Subwoofer" },
  { name: "DMX512", url: "https://en.wikipedia.org/wiki/DMX512" },
  { name: "Stage lighting", url: "https://en.wikipedia.org/wiki/Stage_lighting" },
  { name: "Truss", url: "https://en.wikipedia.org/wiki/Truss" },
  { name: "Disc jockey", url: "https://en.wikipedia.org/wiki/Disc_jockey" },
].map((t) => ({ "@type": "Thing", name: t.name, sameAs: t.url }));

/** Indore base plus the districts and states we actually travel to. */
const areaServed = [
  {
    "@type": "GeoCircle",
    name: "Indore metropolitan area",
    geoMidpoint: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    geoRadius: "80000",
  },
  { "@type": "City", name: "Indore", containedInPlace: { "@type": "AdministrativeArea", name: "Madhya Pradesh" } },
  { "@type": "City", name: "Bhopal", containedInPlace: { "@type": "AdministrativeArea", name: "Madhya Pradesh" } },
  { "@type": "City", name: "Ujjain", containedInPlace: { "@type": "AdministrativeArea", name: "Madhya Pradesh" } },
  { "@type": "City", name: "Dewas", containedInPlace: { "@type": "AdministrativeArea", name: "Madhya Pradesh" } },
  { "@type": "AdministrativeArea", name: "Madhya Pradesh" },
  { "@type": "Country", name: "India" },
];

const DAY_NAMES: Record<string, string> = {
  Mo: "Monday",
  Tu: "Tuesday",
  We: "Wednesday",
  Th: "Thursday",
  Fr: "Friday",
  Sa: "Saturday",
  Su: "Sunday",
};

/** site.hours ("Mo,Tu,... 09:00-22:00", the schema.org openingHours format) as an OpeningHoursSpecification. */
function openingHours() {
  const [days, range] = site.hours.split(" ");
  const [opens, closes] = range.split("-");
  return {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: days.split(",").map((d) => DAY_NAMES[d] ?? d),
    opens,
    closes,
  };
}

/**
 * Package offers. Prices in lib/packages.ts are "starting from" figures, so they are
 * expressed as `minPrice` on a PriceSpecification rather than a fixed `price`.
 */
function packageOffers() {
  return packages.map((p) => ({
    "@type": "Offer",
    "@id": abs(`/#offer-${p.id}`),
    name: p.name,
    category: p.label,
    description: p.features.join(". ") + ".",
    url: abs("/estimate"),
    availability: "https://schema.org/InStock",
    priceCurrency: "INR",
    priceSpecification: {
      "@type": "PriceSpecification",
      priceCurrency: "INR",
      minPrice: p.priceValue,
      valueAddedTaxIncluded: false,
      description: "Starting price for this package. The final quote depends on crowd size, venue, date and travel.",
    },
    eligibleRegion: { "@type": "Country", name: "India" },
    seller: { "@id": ID.business },
    areaServed,
  }));
}

/**
 * LocalBusiness + EntertainmentBusiness + ProfessionalService — the canonical entity.
 *
 * Deliberately omits `review` and `aggregateRating`: Google restricts review and rating
 * markup on LocalBusiness/Organization to sites that collect reviews *about other*
 * businesses. Self-serving review markup risks a domain-wide structured data manual
 * action, and no star rich result is granted for LocalBusiness anyway. The real 4.9
 * rating stays as visible on-page copy and in /llms.txt, which is what AI answer
 * engines read, and the Google profile is linked through `sameAs` so the rating is
 * verifiable at its source.
 */
export function localBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "EntertainmentBusiness", "ProfessionalService"],
    "@id": ID.business,
    name: site.name,
    alternateName: [site.alternateName, "Mihir Light Sound"],
    legalName: site.name,
    description: site.description,
    slogan: site.tagline,
    disambiguatingDescription:
      "Live event production company in Indore, Madhya Pradesh, renting and operating line-array sound systems, intelligent DMX stage lighting and certified aluminium truss rigging since 2012.",
    url: site.url,
    logo: { "@type": "ImageObject", "@id": ID.logo, url: abs("/logo.png"), contentUrl: abs("/logo.png") },
    image: [abs("/logo.png"), abs("/opengraph-image.png")],
    telephone: site.phone,
    email: site.email,
    foundingDate: String(site.foundingYear),
    foundingLocation: {
      "@type": "Place",
      name: `${site.address.locality}, ${site.address.region}, India`,
      address: {
        "@type": "PostalAddress",
        addressLocality: site.address.locality,
        addressRegion: site.address.region,
        addressCountry: site.address.country,
      },
    },
    founder: { "@type": "Person", name: site.legalOwner, jobTitle: "Founder and Production Head" },
    employee: { "@type": "Person", name: site.legalOwner },
    knowsAbout,
    knowsLanguage: ["en", "hi"],
    priceRange: "₹85,000 - ₹3,20,000+",
    currenciesAccepted: "INR",
    paymentAccepted: "Cash, UPI, Bank Transfer",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    hasMap: site.social.google,
    areaServed,
    serviceArea: areaServed[0],
    openingHours: site.hours,
    openingHoursSpecification: openingHours(),
    sameAs: [
      `https://wa.me/${site.whatsapp}`,
      site.social.instagram,
      site.social.youtube,
      site.social.facebook,
      site.social.google,
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: site.phone,
        email: site.email,
        contactType: "sales",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
        hoursAvailable: openingHours(),
      },
      {
        "@type": "ContactPoint",
        telephone: site.phone,
        contactType: "customer support",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi"],
      },
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Event production packages",
      itemListElement: packageOffers(),
    },
    makesOffer: services.map((s) => ({
      "@type": "Offer",
      name: s.name,
      category: "Event production",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: abs(`/services/${s.slug}`),
      areaServed,
      itemOffered: { "@id": abs(`/services/${s.slug}#service`) },
    })),
    keywords: services.flatMap((s) => s.keywords).join(", "),
    isicV4: "9000",
  };
}

/** The `@id` of a service's node, referenced from the business, its siblings and its WebPage. */
export const serviceId = (slug: string) => abs(`/services/${slug}#service`);

/** Service node for each /services/[slug] page. */
export function serviceSchema(s: Service) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": serviceId(s.slug),
    name: s.name,
    alternateName: s.shortName,
    serviceType: s.shortName,
    category: "Event production",
    description: s.definition,
    disambiguatingDescription: s.summary,
    provider: { "@id": ID.business },
    providerMobility: "dynamic",
    brand: { "@id": ID.business },
    areaServed,
    url: abs(`/services/${s.slug}`),
    serviceOutput: {
      "@type": "Thing",
      name: `${s.shortName} designed, installed, tuned and operated on site for the full event`,
    },
    audience: {
      "@type": "Audience",
      audienceType: s.idealFor.join(", "),
      geographicArea: { "@type": "AdministrativeArea", name: "Madhya Pradesh" },
    },
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: abs("/estimate"),
      servicePhone: { "@type": "ContactPoint", telephone: site.phone, contactType: "sales" },
      serviceLocation: { "@id": ID.business },
      availableLanguage: ["English", "Hindi"],
    },
    /**
     * No `price` here on purpose: lib/packages.ts prices are multi-service bundles, so
     * attaching one to a single service would misstate it. Currency and channel are
     * stated; the estimator gives the event-specific figure.
     */
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: abs("/estimate"),
      seller: { "@id": ID.business },
      areaServed,
      eligibleRegion: { "@type": "Country", name: "India" },
      description:
        "Quoted per event. Use the instant estimator or WhatsApp for a figure based on crowd size, venue and date.",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${s.shortName} deliverables`,
      itemListElement: s.deliverables.map((d) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: d, provider: { "@id": ID.business } },
      })),
    },
    additionalProperty: s.specs.map((sp) => ({ "@type": "PropertyValue", name: sp.label, value: sp.value })),
    isRelatedTo: services
      .filter((x) => x.slug !== s.slug)
      .map((x) => ({ "@id": abs(`/services/${x.slug}#service`) })),
  };
}

/**
 * FAQPage markup.
 *
 * Google retired FAQ rich results entirely on 7 May 2026, and its documentation says
 * unused structured data causes no problem in Search. We keep the markup because it is
 * still consumed by Bingbot (and so Microsoft Copilot), by PerplexityBot and by other
 * retrieval crawlers, and because it gives AI answer engines clean question/answer
 * chunks to quote. There is no rich-result risk: nothing is being claimed that is not
 * on the page.
 */
export function faqSchema(items: Faq[] = faqs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en-IN",
    about: { "@id": ID.business },
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** The `@id` a page's BreadcrumbList carries, so its WebPage node can point at it. */
export const breadcrumbId = (path: string) => abs(`${path}#breadcrumb`);

/** Pass the trail root-first; the last item is the current page and names the list's `@id`. */
export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": breadcrumbId(items[items.length - 1].path),
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": ID.website,
    url: site.url,
    name: site.name,
    alternateName: site.alternateName,
    description: site.description,
    publisher: { "@id": ID.business },
    inLanguage: "en-IN",
    copyrightHolder: { "@id": ID.business },
  };
}

/**
 * WebPage node with `speakable`. Optional, and low priority: Google's speakable support
 * is still beta and limited to US-English news, so treat this as a cheap hint for voice
 * assistants rather than a ranking lever. Pass CSS selectors that wrap the one-sentence
 * direct answer on the page.
 */
export function webPageSchema(opts: {
  name: string;
  description: string;
  path: string;
  /** schema.org WebPage subtype: CollectionPage for listings, ContactPage for /contact. */
  type?: "WebPage" | "CollectionPage" | "ContactPage";
  /** The thing the page is about, by `@id` or as an inline node (an ItemList, a Service). */
  mainEntity?: Record<string, unknown>;
  /** Set false on a page that emits no BreadcrumbList; the home page never links one. */
  breadcrumb?: boolean;
  speakableSelectors?: string[];
  datePublished?: string;
  dateModified?: string;
}) {
  const selectors = opts.speakableSelectors ?? ["h1", "[data-speakable]"];
  const hasBreadcrumb = opts.path !== "/" && opts.breadcrumb !== false;
  return {
    "@context": "https://schema.org",
    "@type": opts.type ?? "WebPage",
    "@id": abs(`${opts.path}#webpage`),
    url: abs(opts.path),
    name: opts.name,
    description: opts.description,
    inLanguage: "en-IN",
    isPartOf: { "@id": ID.website },
    about: { "@id": ID.business },
    publisher: { "@id": ID.business },
    primaryImageOfPage: { "@id": ID.logo },
    ...(hasBreadcrumb ? { breadcrumb: { "@id": breadcrumbId(opts.path) } } : {}),
    ...(opts.mainEntity ? { mainEntity: opts.mainEntity } : {}),
    ...(opts.datePublished ? { datePublished: opts.datePublished } : {}),
    ...(opts.dateModified ? { dateModified: opts.dateModified } : {}),
    speakable: { "@type": "SpeakableSpecification", cssSelector: selectors },
  };
}

/**
 * Open Graph and Twitter card fields for one page.
 *
 * Next.js replaces, rather than merges, a parent's `openGraph` / `twitter` object when a
 * page defines its own, and that also drops the images the app/opengraph-image.png and
 * app/twitter-image.png file conventions inject. So every field a share card needs is
 * restated here, image included. Titles are given in full: neither object applies the
 * root layout's title template.
 */
export function shareMeta(opts: { title: string; description: string; path: string }): Pick<Metadata, "openGraph" | "twitter"> {
  const title = opts.title.includes(site.name) ? opts.title : `${opts.title} | ${site.name}`;
  const alt = `${site.name} - Sound & Light | Event | Production`;
  return {
    openGraph: {
      type: "website",
      locale: "en_IN",
      siteName: site.name,
      url: abs(opts.path),
      title,
      description: opts.description,
      images: [{ url: "/opengraph-image.png", width: 1200, height: 630, type: "image/png", alt }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: opts.description,
      images: [{ url: "/twitter-image.png", width: 1200, height: 630, type: "image/png", alt }],
    },
  };
}

/**
 * Convenience wrapper: emit several nodes as one connected @graph instead of many
 * loose blocks. Useful if the page engineer wants a single script tag per page.
 */
export function graph(nodes: Record<string, unknown>[]) {
  return {
    "@context": "https://schema.org",
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- strip per-node @context inside a graph
    "@graph": nodes.map(({ "@context": _ctx, ...rest }) => rest),
  };
}
