/**
 * Media sources.
 *
 * Instagram is where the business posts, so the work section embeds the latest public
 * reels straight from the profile. Update `instagramReels` with new shortcodes (the part
 * after /reel/ in a post URL) whenever you post; the first six are shown.
 *
 * TO ADD YOUR OWN PHOTOS: drop JPGs into /public/media and add entries to `photos`.
 */

export const instagramHandle = "mihir_sound_and_light_indore";
export const instagramUrl = `https://www.instagram.com/${instagramHandle}/`;

/** Public reel shortcodes from the profile, newest first. */
export const instagramReels: string[] = [
  "DbgcyqSO7iM",
  "C6RQS2diBPh",
  "Dda5VqLOSVF",
  "DciJO6uOmms",
  "DcQ12YQu3O3",
  "Dbxk14Xugno",
  "DbKmO2zOdcQ",
  "DbFSIFpIwP2",
  "Da7lu5AoCcB",
  "Da4jzMlIQ0v",
  "Dao5034IDTZ",
  "CGAWRC1giRn",
];

export const instagramReelUrl = (code: string) => `https://www.instagram.com/reel/${code}/`;
export const instagramEmbedUrl = (code: string) => `https://www.instagram.com/reel/${code}/embed/`;

export interface Photo {
  src: string; // e.g. "/media/wedding-stage-01.jpg"
  alt: string;
  category: "concert" | "wedding" | "corporate" | "club";
  /**
   * "own" is the business's photography of its shows. "stock" is a licensed reference photo
   * of someone else's event, credited on the card so it is never mistaken for our work.
   */
  kind: "own" | "stock";
  /** Shown under the card on the home page for own photos. Name the venue only if it is public knowledge. */
  venue?: string;
  city?: string;
  /** Required for stock: photographer and the photo's source page. */
  credit?: { name: string; url: string };
}

/**
 * Card photos, first match per category wins, so put own photos ABOVE the stock ones and the
 * stock photo drops out of the card automatically. Stock photos are from Unsplash under the
 * Unsplash License (free for commercial use, no attribution required, credited anyway).
 */
export const photos: Photo[] = [
  {
    src: "/media/show-wedding-stage.jpg",
    alt: "Wedding reception stage with draped ceiling, floral backdrop and warm stage lighting",
    category: "wedding",
    kind: "stock",
    credit: { name: "Prottoy Hasan", url: "https://unsplash.com/photos/t417pRhcBbU" },
  },
  {
    src: "/media/show-concert-ground.jpg",
    alt: "Open-air concert crowd facing a stage lit by amber beams and haze",
    category: "concert",
    kind: "stock",
    credit: { name: "Yvette de Wit", url: "https://unsplash.com/photos/NYrVisodQ2M" },
  },
  {
    src: "/media/show-corporate-hall.jpg",
    alt: "Corporate conference hall with truss-mounted moving heads, LED screens and a seated audience",
    category: "corporate",
    kind: "stock",
    credit: { name: "Tyler Witkin", url: "https://unsplash.com/photos/ojiceL6CWRQ" },
  },
  {
    src: "/media/show-club-night.jpg",
    alt: "Club night crowd with hands up under truss-mounted red LED fixtures",
    category: "club",
    kind: "stock",
    credit: { name: "Long Truong", url: "https://unsplash.com/photos/Y5PXVs1LpY4" },
  },
];

/**
 * Crew photo for the About section on the home page. Null until the business supplies one
 * (the section renders text-only rather than a placeholder box). Drop the JPG into
 * /public/media and fill this in: a landscape or 4:5 frame of the crew rigging or at
 * soundcheck reads best.
 */
export const crewPhoto: { src: string; alt: string; caption?: string } | null = null;
