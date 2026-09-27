# Action required

Everything below needs *you* (or a hired hand) — not more code. Each item says why,
roughly how long it takes, and where the full walkthrough lives if there is one.
Check items off as you go; nothing on this list blocks the site from working today.

<!-- Updated 2026-09-27 -->

## Live Google reviews (Business Profile API setup)

The code is built and shipped — the "What clients say" section still shows the 3
hand-picked reviews until these are done, then switches automatically. Full
step-by-step is in [README.md](README.md) → "Live Google reviews"; condensed here:

- [ ] **1. Request Business Profile API access.** Create/reuse a Google Cloud project,
      then submit the [access form](https://support.google.com/business/contact/api_default)
      as "Application for Basic API Access", signed in as the Google account that
      manages the Mihir Sound & Light Business Profile. **Do this first — approval
      takes days to weeks**, everything else below is quick once it lands.
- [ ] **2. Enable 3 APIs** in that Cloud project (after approval): Google Business
      Profile API, My Business Account Management API, My Business Business
      Information API.
- [ ] **3. Create an OAuth client** (Web application type), redirect URI
      `https://developers.google.com/oauthplayground`.
- [ ] **4. Get a refresh token** via Google's [OAuth Playground](https://developers.google.com/oauthplayground)
      — no coding, just your own credentials + the `business.manage` scope, signed in
      as the business account.
- [ ] **5. Find your account/location IDs** — two GET requests inside the same
      Playground session, detailed in the README.
- [ ] **6. Set 5 env vars** in Vercel *and* `.env.local`: `GBP_CLIENT_ID`,
      `GBP_CLIENT_SECRET`, `GBP_REFRESH_TOKEN`, `GBP_ACCOUNT_ID`, `GBP_LOCATION_ID`.

## Leads: email alerts (optional, quick)

- [ ] Sign up at [resend.com](https://resend.com) (free tier is enough), get an API
      key, set `RESEND_API_KEY` (+ optionally `LEAD_ALERT_EMAIL`, `RESEND_FROM`) in
      Vercel. Without it, leads still land in `/invoice/leads` — you just won't get
      pinged. Details in `.env.example`.

## GA4: turn the new events into conversions

- [ ] In the GA4 admin (analytics.google.com → Admin → Events), mark
      `whatsapp_click`, `phone_click`, `estimate_submit` and `contact_submit` as **key
      events**. The site already fires them (shipped this session) — GA4 just doesn't
      know they matter yet. Five minutes, and it's what makes conversion rate and any
      future ad spend measurable.

## The custom domain

- [ ] Buy `mihirsoundandlight.in` (or `.com`), point it at the Vercel project, set
      `NEXT_PUBLIC_SITE_URL`, keep redirects. You said you'd do this yourself — flagging
      it again because Search Console / directory-citation work below should happen
      *after* the domain is final, not before.

## Business-side moves (ranked by actual impact, no code involved)

1. [ ] **Google Business Profile checklist** — category, hours, photos, services with
      prices, Q&A filled from `lib/faqs.ts`. Still the single highest-leverage thing
      for local search, full stop.
2. [ ] **WhatsApp Business app** — catalog (your 3 packages as browsable products),
      greeting message, quick replies, labels. 30 minutes, outsized effect since
      WhatsApp is your actual front door.
3. [ ] **Real photography/video from the next 2–3 shows** — load-in, FOH mid-show, a
      crowd wide shot. Unlocks the portfolio page, GBP photos, Instagram, and any
      future ad creative all at once. Nobody else can do this step.
4. [ ] **Directory citations**, identical NAP everywhere — Justdial, Sulekha,
      IndiaMART, WeddingWire India, WedMeGood, ShaadiSaga, Bing Places, Apple Business
      Connect.
5. [ ] **Review cadence** — day-after WhatsApp ask, worded around the specific service
      ("sangeet at [venue], 400 guests, line array and 12 movers"). The invoice tool
      now nudges this automatically on full payment; informal/non-invoiced bookings
      still need a manual ask.
6. [ ] **Hindi copy for the site** — needs a real translator, not machine translation,
      for a live business. Infra (routing) is easy once you have accurate copy; I'm
      not generating the copy itself.
7. [ ] **Meta Pixel / Google Ads conversion tracking** — only worth doing once you're
      actually planning to run ads. Say the word and I'll wire it in; no pixel exists
      today.

## Repo housekeeping (small, your call)

- [ ] `.env.example` isn't tracked in git — `.gitignore`'s `.env*` pattern catches it
      too, so the setup instructions written into it (Resend, GBP, etc.) only exist on
      this machine, not for anyone else who clones the repo. Worth a narrow
      `.gitignore` exception (`!.env.example`) if anyone else ever works on this
      codebase.
