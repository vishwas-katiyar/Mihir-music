# Mihir Sound & Light — website

Next.js 15 (App Router, React 19, TypeScript) rebuild of mihir-music.vercel.app.
3D via React Three Fiber, styling via Tailwind v4, motion via `motion` (Framer Motion).

## Run

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build (also typechecks + lints)
```

## Deploy to Vercel

The app is the repository root and is git-connected to the `mihir-music` Vercel project
(`vercel.json` pins the Next.js preset). Pushing to `main` deploys production.

Required environment variables (Project → Settings → Environment Variables):
`POSTGRES_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `KV_REST_API_READ_ONLY_TOKEN`,
`ADMIN_TOKEN`, `INDEXNOW_KEY`, `NEXT_PUBLIC_SITE_URL`. Optional: `INVOICE_PASSWORD`
(overrides the daily date password for /invoice), `INVOICE_SESSION_SECRET`, `RESEND_API_KEY`
+ `LEAD_ALERT_EMAIL` (email alert on every new lead — see `.env.example`).

## Local dev database

**Local dev and production currently share one Postgres.** Every `npm run dev`,
`db:migrate` or `db:seed` on your machine reads and writes the real, live database — the
same one the deployed site uses. `lib/db/index.ts` prints the host it connected to once
per process (`[db] connected to ...`) specifically so this is never invisible; if that
line ever names a host you don't recognise as your dev branch, stop before running
anything that writes.

To stop sharing it (recommended, free on both providers):

1. **Neon** — open the project → Branches → "Create branch" from `main`. Copy that
   branch's connection string into a *separate* `.env.local` (do not touch the Vercel
   production env vars). Neon branches are copy-on-write, so this is instant and costs
   nothing until you write divergent data.
2. **Supabase** — same idea via a second (free-tier) project, or Supabase's branching
   feature if your plan includes it.
3. Run `npm run db:migrate` against the new branch, then `npm run db:seed` to load
   `lib/gear.ts` into it.
4. Keep `.env.local` (dev branch) and Vercel's env vars (production) permanently
   different connection strings from here on.

Until that split happens, treat every local write as a production write: no bulk deletes,
no destructive migrations tested "just to see", and double-check the `[db] connected to`
line before anything that isn't routine editing.

## Invoices (admin)

- `/invoice` is the admin area. Password = today's date in IST as `DDMMYYYY` unless
  `INVOICE_PASSWORD` is set. Sessions are HttpOnly cookies, 12 hours.
- Invoices are stored in Postgres (`invoices` table, money in paise). Numbers are
  `MSL-YYYY-NNNN`. Each invoice has an unguessable share token.
- Clients open `/i/<token>` (never indexed) to view, pay the balance by UPI QR, and
  download the PDF from `/api/i/<token>/pdf` (rendered server-side with @react-pdf).
- Payments are a history on the invoice (date, amount, method, reference). "Received" and
  "Balance due" derive from it, and status becomes Partially paid / Paid automatically.
  Record the second payment on the same invoice; the same client link and PDF update.
- Admin can edit, change status, duplicate, rotate the share link, or delete. Delete is a
  soft delete: the invoice moves to the "Deleted" filter and can be restored.
- The PDF (`components/invoice/InvoicePdf.tsx`) is a classic structured invoice: reference
  block, bill-to and event panels, items table, amount in words, payments received, UPI QR,
  totals with balance due, terms and signature. It embeds Inter and Space Grotesk from
  `public/fonts` (fetch with `node scripts/fetch-fonts.mjs`). Add `?inline=1` to the PDF URL
  to view it in the browser instead of downloading. The share page mirrors the same layout.
- The local dev server and production share the same database. Do not bulk-delete rows
  (see "Local dev database" above).

## Leads (admin)

- `/invoice/leads` lists every enquiry from the 3D estimator and the contact form, newest
  first — filterable by status, searchable by name/phone/city.
- Every submission optionally sends an email alert (`RESEND_API_KEY` in `.env.example`);
  without it, leads still land in this table, they just don't page anyone.
- Status (`New → Contacted → Quoted → Won/Lost`) is set from a dropdown on each row; the
  summary strip above the table shows total, new-this-week and win rate once some leads
  are decided.
- "Invoice" on a row opens `/invoice/new?leadId=<id>` with client name, phone, venue,
  event date and a first line item pre-filled from the estimate.
- `GET /api/quote` (Bearer `ADMIN_TOKEN`) still works for scripted exports; the admin UI
  uses `/api/leads` (same cookie session as `/invoice`) instead.

## Live Google reviews

The "What clients say" marquee (`components/sections/Testimonials.tsx`) shows real Google
reviews, fetched server-side via the official **Business Profile API** and cached 24 hours
(`lib/reviews/business-profile.ts`). It's free (no per-call billing, unlike the Places API
alternative), but the setup is a one-time manual process because Google gates access and
requires OAuth rather than a simple API key. Without every env var below set, or if the
call ever fails, the section falls back to the three hand-picked reviews in
`lib/reviews.ts` — never empty, never invented either way.

**1. Request API access** (only Google can do this; expect days to weeks, not instant):
- You need a Google Cloud project first — [console.cloud.google.com](https://console.cloud.google.com) → create one (or reuse the one this project's other Google keys live in) → note its **Project number** on the dashboard.
- Submit the [Business Profile API contact form](https://support.google.com/business/contact/api_default), choosing **"Application for Basic API Access"**. Use the Google account that's an owner/manager on the Mihir Sound & Light Business Profile — Google checks the profile has been verified and active 60+ days and that it lists this website.
- You'll get an email when approved. Until then the project's quota for these APIs is 0.

**2. Enable the APIs** (after approval), in that Cloud project's API Library:
- **Google Business Profile API** (serves the reviews)
- **My Business Account Management API** (used once, to look up your account ID below)
- **My Business Business Information API** (used once, to look up your location ID below)

**3. Create OAuth credentials:**
- Cloud Console → APIs & Services → Credentials → Create Credentials → OAuth client ID → type **Web application**.
- Under Authorized redirect URIs, add `https://developers.google.com/oauthplayground` (needed for step 4).
- Note the **Client ID** and **Client secret** → these are `GBP_CLIENT_ID` / `GBP_CLIENT_SECRET`.
- If prompted, configure the OAuth consent screen first (External, or Internal if this is a Google Workspace account) — app name/support email is enough, no verification needed for your own use.

**4. Get a refresh token**, using Google's own [OAuth Playground](https://developers.google.com/oauthplayground) (no code to write):
- Gear icon (top right) → check **"Use your own OAuth credentials"** → paste the Client ID/secret from step 3.
- Step 1: in the scope input, paste `https://www.googleapis.com/auth/business.manage` → Authorize APIs → sign in as the **same Google account that manages the Business Profile**.
- Step 2: **Exchange authorization code for tokens** → copy the **Refresh token** shown → this is `GBP_REFRESH_TOKEN`. (The access token shown alongside it expires in about an hour and isn't needed — the app fetches its own.)

**5. Find your account and location IDs**, still in the Playground, using the access token from step 4 in the **"Step 3: Configure request to API"** panel (enter the URL, method GET, and hit "Send the request"):
- `https://mybusinessaccountmanagement.googleapis.com/v1/accounts` → the response's `accounts[].name` looks like `accounts/1234567890123456789` — the number after the slash is `GBP_ACCOUNT_ID`.
- `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/<that number>/locations?readMask=name,title` → find the entry whose `title` matches the business, take the number after `locations/` in its `name` — that's `GBP_LOCATION_ID`.

**6. Set all five env vars** in Vercel (Project → Settings → Environment Variables) and in `.env.local` for local dev: `GBP_CLIENT_ID`, `GBP_CLIENT_SECRET`, `GBP_REFRESH_TOKEN`, `GBP_ACCOUNT_ID`, `GBP_LOCATION_ID`. Redeploy — reviews should appear within the 24h cache window (or immediately on the next build).

Notes: the API can return more than the old 5-review cap, so the code keeps the freshest
8; anonymous reviewers don't come with a name or photo (Google withholds both), so those
fall back to "Google user" with no avatar. The 4.9/120+ figure quoted everywhere else on
the site (footer, FAQ, JSON-LD `sameAs`) stays a manually-maintained fact in `lib/site.ts`
on purpose, so it never drifts out of sync with itself across pages — only the review
cards themselves are live.

## Where things live

```
app/
  layout.tsx            fonts, global metadata, LocalBusiness + WebSite JSON-LD, nav/footer, GA
  page.tsx              home: HeroCalm → ProofBand → WorkReel → ServicesList → Estimator → PackagesTabs → Testimonials → FAQ → ClosingCTA
  api/quote, api/availability   Postgres + KV backed lead capture (see .env.example)
  services/             hub + /services/[slug] (arena-audio, dmx-lighting, stage-rigging, dj-setup, show-execution)
  estimate/             full-page 3D estimator
  gear/  portfolio/  contact/  not-found.tsx
  sitemap.ts  robots.ts  manifest.ts  opengraph-image.tsx  llms.txt/route.ts
components/
  motion-primitives/  vendored from motion-primitives.com via `npx motion-primitives@latest add <name>`;
                      files marked "Owner edit" carry local patches, so do not re-run the CLI over them
  3d/        CanvasGate (device/viewport gating), AudioMesh*, Estimator*, Truss, MovingHead, Haze, Speakers, materials
  sections/  one file per page section (HeroCalm, ProofBand, WorkReel, ServicesList, PackagesTabs, Testimonials, FAQ, ...)
  ui/        Button, ReelDialog + ReelFrame (real YouTube footage), TiltCard (Tilt+Spotlight), Reveal (InView), Container, SocialIcons
lib/media.ts   real media manifest: reels from the YouTube channel + a `photos` slot for your own JPGs in /public/media
  layout/    Navbar, Footer, FloatingCTA
  seo/       JsonLd
lib/
  site.ts        business identity — edit phone/address/socials here only
  services.ts    service copy, specs, per-service FAQ
  estimator.ts   pricing model → drives the 3D preview AND the WhatsApp payload
  schema.ts      JSON-LD generators
  gear.ts  packages.ts  faqs.ts  reviews.ts  utils.ts
```

## Editing content

Everything textual is data in `lib/`. Prices → `lib/packages.ts` + `lib/estimator.ts` base rates.
Contact details → `lib/site.ts`. Adding a service = one object in `lib/services.ts`; the route,
sitemap entry, footer link, JSON-LD and card are generated from it.

## Performance model

- WebGL only mounts on devices that pass `detectQuality()` (WebGL present, no reduced-motion,
  no data-saver). Low-end / mobile get a lighter scene (`quality="low"`); others get haze,
  sparkles and a second truss.
- Each canvas mounts when near the viewport and stops its frameloop when scrolled away.
- Static CSS "poster" fallback renders for everyone else and during hydration.
- All continuous motion (tilt cards, beams, camera) runs in motion values / `useFrame` — no React re-renders per frame.
