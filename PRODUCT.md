# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Three audiences, confirmed as equal priority with no lead:

- **Families booking a wedding.** Sangeet and reception decision-makers, often a sibling or a hired planner, usually on a phone, arriving from Instagram or a referral and comparing two or three vendors over WhatsApp.
- **Corporate and agency organisers.** Event managers and agency producers on a laptop who need specs, capacity, a written quote and an invoice more than atmosphere.
- **Concert and festival promoters.** Book the large-format rigs; care about flown load, array counts, crew depth and reliability at scale.

Shared situation: most first contact happens over WhatsApp (+91 70000 51042), in English or Hindi, 09:00 to 22:00, seven days.

## Product Purpose

The public website of Mihir Sound & Light (alternate name Mihir Music), a live event production company in Indore founded by Mihir Chouhan in 2012. It sells line-array sound, intelligent DMX lighting, certified truss rigging, DJ setups and show execution for weddings, concerts and corporate events across Madhya Pradesh and pan-India. Success is a qualified enquiry: a WhatsApp conversation or a submitted estimate with the event type, crowd and venue already attached.

A private admin area (`/invoice`) issues invoices with share links (`/i/<token>`), UPI payment and PDF download; it shares one Postgres database between local development and production.

## Positioning

**Engineering credentials.** Insured rigging crew with a written load plan for every flown build; an FOH engineer tunes every system on site; certified Tomcat and Prolyte truss rated to 8 t flown. Competing outfits in Indore cannot truthfully say this. The "same people quote, rig and mix the show" claim in the About section is true and may be kept, but the engineering record is the lead.

## Operating Context

- Instagram (`@mihir_sound_and_light_indore`) is where the business publishes its work; the site embeds public reels from it (`lib/media.ts`). YouTube and Facebook profiles exist.
- Enquiries route to WhatsApp with a prefilled message, or to `/api/quote` (Postgres + KV) from the estimator and contact form.
- Four production templates (`lib/formats.ts`): wedding sangeet & reception stage (300 to 1,200 guests), open-ground concert / festival mainstage (3,000 to 10,000), corporate summit & award night, club night & rooftop party.
- Five service lines (`lib/services.ts`): arena audio, DMX lighting, stage rigging, DJ setup, show calling & live production crew.
- Three named packages (`lib/packages.ts`) with confirmed real starting prices: Club / House ₹85,000; Wedding Luxe ₹1.6 lakh; Arena Fest ₹3.2 lakh. Final quotes depend on crowd, venue, date and travel.
- Areas served: Indore, Bhopal, Ujjain, Dewas, Madhya Pradesh, pan-India.

## Capabilities and Constraints

- Next.js 15 App Router, React 19, TypeScript, Tailwind v4, `motion`, React Three Fiber; deployed on Vercel from `main`. `lib/site.ts` is the single source of business identity; every page and schema block reads from it.
- 3D scenes (hero rig, estimator) must never take touch input on phones: canvases are `pointer-events: none` with a turntable camera on coarse pointers; OrbitControls is desktop-only. Devices without WebGL, with reduced motion or data-saver get the CSS poster.
- Heavy SEO / AEO investment: JSON-LD (LocalBusiness, WebSite, FAQ, WebPage with `data-speakable`), sitemap, IndexNow, `llms.txt`. Copy changes must keep schema claims and page copy in agreement.
- Google Analytics and AdSense are wired; `/i/<token>` and `/invoice` are never indexed.
- Terminology: FOH, line array, subs "a side", movers / Sharpy beams, flown load, truss, deck, show caller, load plan, sangeet, varmala.
- Open: no Hindi-language version of the site (the business operates in English and Hindi); no confirmed crew photo yet (`crewPhoto` in `lib/media.ts` is empty, and the About section is text-only until one exists).

## Brand Commitments

- Name: **MIHIR** / Mihir Sound & Light. Tagline on brand assets: "SOUND & LIGHT | EVENT | PRODUCTION" (exact wording, from the brand kit). Site tagline: "Engineered sound. Choreographed light."
- Logo system generated from `scripts/brand/core.mjs` into `assets/brand` (primary, horizontal, stacked, mark, wordmark, monochrome, inverse, avatar, badge, responsive); site copies in `public/`. Gold on black.
- Voice: the company speaking plainly about what it rigs and who turns up. No invented quotes, no stock people presented as crew, every figure traceable to `lib/site.ts`, `lib/gear.ts` or `lib/faqs.ts`.
- The owner's standing instruction: no template "AI slop" patterns on the site.

## Evidence on Hand

- Google Business profile: 4.9 out of 5 from 120+ reviews (confirmed live; `lib/site.ts`).
- Three genuine client testimonials (`lib/reviews.ts`): Raj & Neha (wedding), Aman Verma (corporate), Priya Shah (private party). No other testimonials may be invented.
- Inventory figures are real and owned: 24 Clay Paky Sharpy moving heads, 8 t certified flown load on Tomcat/Prolyte truss, flown arrays 6 a side (wedding) to 10 to 12 a side (concert). Brands: JBL, RCF, Clay Paky, Avolites, Soundcraft, Yamaha, Tomcat, Prolyte.
- Company age: since 2012, computed live from `site.foundingYear`.
- Work footage: public Instagram reels (embedded). Work-card photographs in `public/media` are **licensed Unsplash stand-ins of other people's events**, credited on the card; they must never be presented as Mihir's shows. Own photography is absent and must not be fabricated or implied.
- Rig still renders: `scripts/render-rig-stills.mjs` + `/dev/rig-still` produce images of the actual configured rig.

## Product Principles

1. **Proof before promise.** Lead with the engineering record (load plans, FOH engineer, certified truss, real inventory) and verifiable numbers; never a claim the crew cannot stand behind on site.
2. **Three doors, one desk.** Weddings, corporate and concerts each find their format, rig and starting price quickly, and all of them end at the same WhatsApp / estimate desk.
3. **Phone first, laptop complete.** The wedding buyer decides on a phone; the organiser needs specs and paperwork on a laptop. Neither experience is a cut-down version of the other.
4. **Real or absent.** No stock people as crew, no invented reviews or clients; when an asset does not exist the section says less rather than pretending.
5. **The show is the spectacle, the site is the crew.** Motion and 3D illustrate the rig; they never get in the way of scrolling, reading or tapping "Get an estimate".

## Accessibility & Inclusion

Reduced-motion users get static posters and fade-only entrances; zoom is never disabled; inputs stay 16px on phones; bilingual (English/Hindi) enquiry handling is a business fact even though the site copy is English.
