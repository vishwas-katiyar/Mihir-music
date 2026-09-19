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
(overrides the daily date password for /invoice), `INVOICE_SESSION_SECRET`.

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
- The local dev server and production share the same database. Do not bulk-delete rows.

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
