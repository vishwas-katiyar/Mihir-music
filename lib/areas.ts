/**
 * Local-SEO landing pages for the cities we actually travel to for a show, beyond Indore
 * itself. Indore is deliberately not one of these: the home page and every /services page
 * already own that query, and a fourth page saying the same thing again would be exactly
 * the thin, duplicate content search engines discount. These three exist because "do you
 * come to Bhopal / Ujjain / Dewas" is a real, distinct question (see lib/faqs.ts).
 *
 * Distances are straight-line road distance from Indore, stated approximately on purpose —
 * traffic and route vary, so a fake-precise number would be a claim we can't stand behind.
 */
export interface Area {
  slug: string;
  city: string;
  distanceKm: number;
  driveTime: string;
  /** One honest sentence: what travelling there means in practice, not a sales claim about that city specifically. */
  note: string;
}

export const areas: Area[] = [
  {
    slug: "bhopal",
    city: "Bhopal",
    distanceKm: 195,
    driveTime: "around 3.5 hours by road",
    note: "Far enough that load-in is planned a day ahead, not a same-day round trip.",
  },
  {
    slug: "ujjain",
    city: "Ujjain",
    distanceKm: 55,
    driveTime: "about an hour by road",
    note: "Close enough for same-day load-in and strike on most bookings.",
  },
  {
    slug: "dewas",
    city: "Dewas",
    distanceKm: 35,
    driveTime: "under 45 minutes by road",
    note: "The closest of the three — effectively a local booking with a short drive.",
  },
];

export const getArea = (slug: string) => areas.find((a) => a.slug === slug) ?? null;
