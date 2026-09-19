import { NextResponse } from "next/server";
import { site } from "@/lib/site";
import { services } from "@/lib/services";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * IndexNow ping endpoint.
 *
 * IndexNow pushes "this URL changed" straight to Bing, Yandex, Naver, Seznam and
 * Yep instead of waiting to be recrawled. Google has not adopted it, so this is not a
 * Google play - it is a Bing play, and Bing's index is what Microsoft Copilot is
 * grounded in, which is exactly the kind of citation surface this site is chasing.
 *
 * SETUP (one time)
 *  1. Generate a key: 8-128 hex characters, e.g. `openssl rand -hex 16`.
 *  2. Put the key in the environment as INDEXNOW_KEY (Vercel: Project Settings ->
 *     Environment Variables, all environments).
 *  3. Publish the key file so IndexNow can verify domain ownership. Either:
 *       a. create `public/<key>.txt` containing nothing but the key, or
 *       b. set INDEXNOW_KEY_LOCATION to a full URL that serves the key as plain text.
 *     The file must be reachable at `https://mihir-music.vercel.app/<key>.txt` and must
 *     contain the exact key with no whitespace, or submissions fail with HTTP 403.
 *  4. Call this route after a deploy: `curl -X POST https://mihir-music.vercel.app/api/indexnow \
 *       -H "x-indexnow-token: $INDEXNOW_KEY"`
 *
 * Without INDEXNOW_KEY set, every request is a no-op that returns 200 with
 * `{ skipped: true }`, so wiring it into a deploy hook is safe before the key exists.
 *
 * The route is disallowed in robots.txt: it is for the operator, not for crawlers.
 */

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/IndexNow";

/** Every indexable URL on the site, kept in step with app/sitemap.ts. */
function allUrls(): string[] {
  const staticPaths = ["/", "/services", "/estimate", "/gear", "/portfolio", "/contact"];
  return [...staticPaths, ...services.map((s) => `/services/${s.slug}`)].map((p) => `${site.url}${p}`);
}

function host(): string {
  return new URL(site.url).host;
}

interface SubmitResult {
  ok: boolean;
  status: number;
  submitted: number;
  body: string;
}

async function submit(key: string, urlList: string[]): Promise<SubmitResult> {
  const payload: Record<string, unknown> = {
    host: host(),
    key,
    urlList,
  };
  const keyLocation = process.env.INDEXNOW_KEY_LOCATION;
  if (keyLocation) payload.keyLocation = keyLocation;

  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  return {
    ok: res.ok,
    status: res.status,
    submitted: urlList.length,
    body: (await res.text().catch(() => "")).slice(0, 500),
  };
}

/** Guard: without a shared-secret header, anyone could spam the quota. */
function authorised(request: Request, key: string): boolean {
  const header = request.headers.get("x-indexnow-token");
  const query = new URL(request.url).searchParams.get("token");
  return header === key || query === key;
}

function parseUrls(input: unknown): string[] | null {
  if (!Array.isArray(input)) return null;
  const cleaned = input
    .filter((u): u is string => typeof u === "string")
    .map((u) => (u.startsWith("http") ? u : `${site.url}${u.startsWith("/") ? u : `/${u}`}`))
    .filter((u) => {
      try {
        return new URL(u).host === host();
      } catch {
        return false;
      }
    });
  return cleaned.length ? cleaned : null;
}

export async function POST(request: Request) {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return NextResponse.json(
      { skipped: true, reason: "INDEXNOW_KEY is not set; nothing submitted." },
      { status: 200 },
    );
  }
  if (!authorised(request, key)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  let urlList = allUrls();
  try {
    const body: unknown = await request.json();
    if (body && typeof body === "object" && "urls" in body) {
      const parsed = parseUrls((body as { urls: unknown }).urls);
      if (parsed) urlList = parsed;
    }
  } catch {
    // No body, or not JSON: submit the full URL set.
  }

  // IndexNow accepts up to 10,000 URLs per request; this site is nowhere near that.
  const result = await submit(key, urlList.slice(0, 10000));
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

/** GET does the same thing for a full-site ping, so a deploy hook can use a plain URL. */
export async function GET(request: Request) {
  const key = process.env.INDEXNOW_KEY;
  if (!key) {
    return NextResponse.json(
      { skipped: true, reason: "INDEXNOW_KEY is not set; nothing submitted." },
      { status: 200 },
    );
  }
  if (!authorised(request, key)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  const result = await submit(key, allUrls());
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}
