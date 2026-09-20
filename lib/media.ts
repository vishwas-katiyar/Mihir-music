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
  /** Shown under the card on the home page. Name the venue only if it is public knowledge. */
  venue?: string;
  city?: string;
}

/** Your own photography. Empty until files are added to /public/media. */
export const photos: Photo[] = [];
