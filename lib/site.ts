/**
 * Single source of truth for business identity.
 * Every page, schema block and CTA reads from here — change once, propagate everywhere.
 */
export const site = {
  name: "Mihir Sound & Light",
  alternateName: "Mihir Music",
  legalOwner: "Mihir Chouhan",
  tagline: "Engineered sound. Choreographed light.",
  description:
    "Mihir Sound & Light is a live event production company in Indore providing line-array sound systems, intelligent DMX stage lighting, certified truss rigging, DJ setups and show execution for weddings, concerts and corporate events across Madhya Pradesh and India.",
  // Canonical origin. Set NEXT_PUBLIC_SITE_URL on Vercel; change it once when the custom domain moves.
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mihir-sound-light.vercel.app").replace(/\/$/, ""),
  foundingYear: 2012,
  phone: "+917000051042",
  phoneDisplay: "+91 70000 51042",
  whatsapp: "917000051042",
  email: "mihirsoundandlight@gmail.com",
  address: {
    street: "Bajrang Nagar 363",
    locality: "Indore",
    region: "Madhya Pradesh",
    regionCode: "MP",
    postalCode: "452001",
    country: "IN",
  },
  geo: { lat: 22.7196, lng: 75.8577 },
  hours: "Mo,Tu,We,Th,Fr,Sa,Su 09:00-22:00",
  areasServed: ["Indore", "Bhopal", "Ujjain", "Dewas", "Madhya Pradesh", "Pan-India"],
  rating: { value: 4.9, count: 120 },
  social: {
    instagram: "https://www.instagram.com/mihir_sound_and_light_indore/",
    youtube: "https://www.youtube.com/channel/UC-xyzkky_7FrQT4Biw1W66g",
    facebook: "https://www.facebook.com/p/Mihir-Light-Sound-100067908826044/",
    google: "https://share.google/Eb1dYJEUgx5Y9LPMz",
  },
  analytics: {
    gaId: "G-3RG9MZRDT7",
    adsenseClient: "ca-pub-6446471191649823",
    googleSiteVerification: "Rfzb6oBU9_Q9xoaymYXOI0BubWvmLuTtFSOJ6kbLweI",
  },
} as const;

export function whatsappUrl(message: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(message)}`;
}

export const defaultWhatsappMessage =
  "Hi Mihir, I want to book your event production services. Please share availability and pricing.";

export const nav = [
  { label: "Services", href: "/services" },
  { label: "Gear", href: "/gear" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Estimate", href: "/estimate" },
  { label: "Contact", href: "/contact" },
] as const;
