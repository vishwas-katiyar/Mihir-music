import { unstable_cache } from "next/cache";
import { site } from "@/lib/site";
import type { Review } from "@/lib/reviews";

/**
 * Live reviews from the official Google Business Profile API — free, no per-call
 * billing (unlike the Places API this replaced). Needs, one-time, from the Google
 * account that manages the GBP listing: an OAuth client + refresh token, plus the
 * numeric account/location IDs. Full walkthrough in README "Live Google reviews".
 * Also needs Google's Business Profile API access approval first (their own gate,
 * typically days to weeks) — see .env.example.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";

interface GbpReviewer {
  displayName?: string;
  profilePhotoUrl?: string;
  isAnonymous?: boolean;
}
interface GbpReview {
  reviewer?: GbpReviewer;
  starRating?: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime?: string;
}
interface GbpReviewsResponse {
  reviews?: GbpReview[];
  averageRating?: number;
  totalReviewCount?: number;
}

const STAR_VALUE: Record<NonNullable<GbpReview["starRating"]>, Review["rating"]> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

function relativeTime(iso?: string): string | undefined {
  if (!iso) return undefined;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days < 1) return "today";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

/** Access tokens last about an hour; a fresh one is fetched each time this whole result is recomputed (see revalidate below), not per page view. */
async function getAccessToken(): Promise<string | null> {
  const clientId = process.env.GBP_CLIENT_ID;
  const clientSecret = process.env.GBP_CLIENT_SECRET;
  const refreshToken = process.env.GBP_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) return null;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
  });
  if (!res.ok) {
    console.error("getAccessToken: refresh failed", res.status, await res.text().catch(() => ""));
    return null;
  }
  return ((await res.json()) as { access_token?: string }).access_token ?? null;
}

export interface GoogleReviewsResult {
  reviews: Review[];
  rating: number;
  count: number;
  profileUrl: string;
}

export const isGoogleReviewsConfigured = Boolean(
  process.env.GBP_CLIENT_ID && process.env.GBP_CLIENT_SECRET && process.env.GBP_REFRESH_TOKEN && process.env.GBP_ACCOUNT_ID && process.env.GBP_LOCATION_ID,
);

async function fetchGoogleReviews(): Promise<GoogleReviewsResult | null> {
  const accountId = process.env.GBP_ACCOUNT_ID;
  const locationId = process.env.GBP_LOCATION_ID;
  if (!accountId || !locationId) return null;

  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  try {
    const res = await fetch(`https://mybusiness.googleapis.com/v4/accounts/${accountId}/locations/${locationId}/reviews`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      console.error("getGoogleReviews: Business Profile API returned", res.status, await res.text().catch(() => ""));
      return null;
    }
    const data = (await res.json()) as GbpReviewsResponse;

    const reviews: Review[] = (data.reviews ?? [])
      .filter((r) => r.comment && r.comment.trim())
      .map((r) => ({
        name: r.reviewer?.displayName || "Google user",
        relativeTime: relativeTime(r.createTime),
        text: r.comment!.trim(),
        rating: STAR_VALUE[r.starRating ?? "FIVE"],
        // Google doesn't return a profile photo for reviewers who opted to stay anonymous.
        avatarUrl: r.reviewer?.isAnonymous ? undefined : r.reviewer?.profilePhotoUrl,
      }))
      .slice(0, 8); // this endpoint can return more than the old Places API's 5; keep the marquee readable

    if (reviews.length === 0) return null;

    return {
      reviews,
      rating: data.averageRating ?? site.rating.value,
      count: data.totalReviewCount ?? site.rating.count,
      profileUrl: site.social.google,
    };
  } catch (e) {
    console.error("getGoogleReviews failed", e);
    return null;
  }
}

/**
 * Cached as one unit for a day. This API has no per-call charge, but a fresh access
 * token plus a network round trip on every single page view is still wasteful — and
 * `unstable_cache` (unlike a plain `fetch` cache) covers the token exchange too, not
 * just the reviews request.
 */
export const getGoogleReviews = unstable_cache(fetchGoogleReviews, ["google-business-profile-reviews"], {
  revalidate: 60 * 60 * 24,
  tags: ["google-reviews"],
});
