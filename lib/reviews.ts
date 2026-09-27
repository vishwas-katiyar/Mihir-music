export interface Review {
  name: string;
  /** Static curated reviews carry a role ("Wedding client"); live Google ones carry a relative time instead. */
  role?: string;
  relativeTime?: string;
  text: string;
  rating: 1 | 2 | 3 | 4 | 5;
  /** Only set for reviews pulled live from Google — author photo and profile link, both required by Google's attribution rules for displaying its review data. */
  avatarUrl?: string;
  authorUrl?: string;
}

/**
 * Fallback set: three real, hand-picked testimonials (never invented, per PRODUCT.md).
 * components/sections/Testimonials.tsx shows these whenever the live Google feed
 * (lib/reviews/google.ts) isn't configured or the API call fails, so the section never
 * goes empty and never shows anything that isn't genuinely real either way.
 */
export const curatedReviews: Review[] = [
  {
    name: "Raj & Neha",
    role: "Wedding client",
    rating: 5,
    text: "Mihir Sound & Light delivered crystal-clear audio and lighting that matched the mood perfectly for our wedding. The team was punctual, professional and very easy to work with.",
  },
  {
    name: "Aman Verma",
    role: "Corporate event",
    rating: 5,
    text: "For our live event, they handled sound, lighting and stage setup with total confidence. The production quality felt premium and the team managed every cue smoothly.",
  },
  {
    name: "Priya Shah",
    role: "Private party",
    rating: 5,
    text: "Professional, creative and highly reliable. From the DJ setup to the final lighting cues, everything felt polished and well planned. We would book them again without hesitation.",
  },
];
