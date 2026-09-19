/**
 * Show formats: the four production templates we deliver, each with the rig that goes
 * with it. Shared by the home page digest and the /portfolio page so the two never drift.
 * Photos and reels of the shows themselves live on Instagram (lib/media.ts).
 */
export interface ShowFormat {
  slug: string;
  title: string;
  /** Short label for the home page, where the full title is too long for a row. */
  shortTitle: string;
  audience: string;
  rig: string[];
}

export const formats: ShowFormat[] = [
  {
    slug: "wedding",
    title: "Wedding sangeet & reception stage",
    shortTitle: "Wedding sangeet",
    audience: "300 to 1,200 guests",
    rig: [
      "Flown line array 6 a side with 3 subs a side",
      "16 to 24 Sharpy beams, pixel bars, haze",
      "12 m truss, 14 × 6 m deck with entry ramp",
      "Show caller for entries, varmala and first dance",
    ],
  },
  {
    slug: "concert",
    title: "Open-ground concert / festival mainstage",
    shortTitle: "Concert mainstage",
    audience: "3,000 to 10,000 crowd",
    rig: [
      "Flown arrays 10 to 12 a side with 6 subs a side",
      "36 to 48 movers, strobes, blinders, lasers",
      "20 m front truss and back truss, 8 t flown",
      "FOH and monitor engineers, comms network",
    ],
  },
  {
    slug: "corporate",
    title: "Corporate summit & award night",
    shortTitle: "Corporate summit",
    audience: "200 to 800 delegates",
    rig: [
      "Compact array with delays for even speech coverage",
      "Key, fill and back lighting, gobo washes, 12 movers",
      "Modular riser stage, lectern, confidence monitors",
      "Cue-called AV with a backup console",
    ],
  },
  {
    slug: "club",
    title: "Club night & rooftop party",
    shortTitle: "Club night",
    audience: "150 to 600 guests",
    rig: [
      "Dance-floor PA with dual 18\" subs",
      "8 to 12 movers, strobes, haze, pixel effects",
      "DJ booth with monitors and an MC mic",
      "DJ, sound and light operators",
    ],
  },
];
