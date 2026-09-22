# Google Search Console — what the rebrand needs

Date: 2026-09-22
Property: `https://mihir-music.vercel.app/`
Companion doc: [aeo-geo-audit.md](./aeo-geo-audit.md) (answer-engine / AI-citation work)

Search Console is a console. Everything in **§2** has to be clicked by the owner of the Google
account — no code change can do it. **§1** is what the repo now ships so that those clicks have
something correct to act on. **§3** is what to expect afterwards, so a normal state is not
mistaken for a fault.

---

## 1. Done in code (shipped with this change)

| Requirement | Where | State |
|---|---|---|
| Site-verification meta tag | `lib/site.ts` → `analytics.googleSiteVerification` → `app/layout.tsx` | Live: `Rfzb6oBU9_Q9xoaymYXOI0BubWvmLuTtFSOJ6kbLweI` |
| `robots.txt` | `app/robots.ts` | Live, allows Googlebot, points to the sitemap |
| XML sitemap | `app/sitemap.ts` | Live at `/sitemap.xml`, 11 URLs, **all verified 200 on 2026-09-22** |
| Canonical per page | each `page.tsx` `alternates.canonical` | One canonical per route, no page inherits `/` |
| Indexing directives | `app/layout.tsx` `robots` | `index, follow`, `max-snippet:-1`, `max-image-preview:large` |
| Private routes kept out | `app/robots.ts` + per-route `robots: { index: false }` | `/api/`, `/invoice`, `/i/` blocked **and** noindexed |
| Structured data | `lib/schema.ts` | LocalBusiness, WebSite, WebPage, Service ×5, BreadcrumbList, FAQPage |
| OG / Twitter images | `app/opengraph-image.png`, `app/twitter-image.png` | Regenerated for the new brand (2026-09-21) |
| Legacy-URL redirects | `next.config.ts` → `redirects()` | **New.** `/index.html`, `/invoice.html`, `/services.html`, `/contact.html` → 308 to the real route |
| Honest `lastmod` | `app/sitemap.ts` → `CONTENT_UPDATED` | **New.** Bumped `2026-09-19` → `2026-09-21`, the redesign ship date |

### Why `lastmod` mattered here

The sitemap was still telling Google every page last changed on 19 September — before the
rebrand and redesign landed. Google uses `lastmod` to decide recrawl priority, and a stale date
on a page that visibly changed is the fastest way to teach a crawler to ignore the field. The
dates now match the commits that actually changed those pages.

**Maintenance rule:** when you edit `lib/services.ts`, `lib/packages.ts`, `lib/gear.ts` or
`lib/media.ts`, bump the matching constant in `app/sitemap.ts`. That is the whole ritual.

### Why the old URLs got redirects

The previous site was a single static `index.html` on **the same domain**. That is the easy
migration case: the homepage URL did not move, so Google simply recrawls it and replaces the
old snippet. But the old build also shipped `invoice.html` and `invoice/index.html`, and those
now 404. A 404 in the page-indexing report is a lost signal rather than a neutral one, so they
now 308 to the live routes.

The five service URLs (`/services/arena-audio` and friends) are **genuinely new** — they never
existed on the old site. Nothing links to them from outside yet, which is exactly why §2.3
matters.

---

## 2. What you must do in the Search Console UI

### 2.1 Confirm the property and verification

Open <https://search.google.com/search-console> and check that a property exists for
`https://mihir-music.vercel.app/`.

- Use a **URL-prefix** property. A **Domain** property is impossible here: it needs a DNS TXT
  record on `vercel.app`, which Vercel owns, not you.
- Verification method: **HTML tag**. The token is already live in the page head — click
  *Verify* and it passes with no code change.
- If Google shows a *different* token than the one above, it means the property was created
  under another Google account. Paste that token into `lib/site.ts`
  (`analytics.googleSiteVerification`) and redeploy; do not add a second tag.

### 2.2 Submit the sitemap

*Indexing → Sitemaps → Add a new sitemap* → enter `sitemap.xml` → Submit.

Expect "Success · 11 discovered URLs" within a day. If it says *Couldn't fetch*, wait — that is
usually Google not having retried yet, not a real error; the file is confirmed serving.

### 2.3 Request indexing for the six pages that matter

*URL Inspection*, paste each URL, then *Request indexing*. There is a small daily quota, so do
them in this order and spread over two days if it cuts you off:

```
https://mihir-music.vercel.app/
https://mihir-music.vercel.app/services
https://mihir-music.vercel.app/services/arena-audio
https://mihir-music.vercel.app/services/dmx-lighting
https://mihir-music.vercel.app/services/stage-rigging
https://mihir-music.vercel.app/contact
```

The homepage is the one that clears the **old brand** out of the index — the URL is unchanged,
so the only way the old title, description and cached text get replaced is a recrawl.

Do **not** use *Removals → Outdated content* for this. That tool is for pages that are gone or
whose content no longer matches the live page; here the live page is already correct and
requesting indexing is the right lever.

### 2.4 Check the rendered page, not just the HTML

Still in URL Inspection: *Test live URL → View tested page → Screenshot*. The homepage hero is a
3D canvas. Confirm the screenshot shows the headline and the phone CTA — if Googlebot sees an
empty black rectangle, the text it indexes is whatever is in the static HTML, and the hero copy
must be real DOM text rather than something the canvas draws. (It is, today; this is a check,
not a known fault.)

### 2.5 Wire up the two things GSC does not cover

1. **Google Business Profile.** For "sound and light company in Indore", the local pack outranks
   everything Search Console reports on. Claim/refresh the profile at
   <https://business.google.com>, and make the name, address, phone and hours byte-identical to
   `lib/site.ts` — Google cross-checks the two, and a mismatch costs more than any on-page fix
   gains. Current profile link: `site.social.google`.
2. **Bing Webmaster Tools.** <https://www.bing.com/webmasters> — it can import the verified
   property straight from Search Console. Submit the same sitemap. This feeds Microsoft Copilot.
   IndexNow is already wired (key file live at `/1fcf8dd4a9e3df76448dcf26619d5e13.txt`); ping it
   after a content deploy:

```bash
curl -X GET "https://mihir-music.vercel.app/api/indexnow?token=$INDEXNOW_KEY"
```

---

## 3. Reading the reports without panicking

**Pages (indexing).** For a site this new and this small, these states are normal, not bugs:

- *Crawled — currently not indexed* — Google fetched it and is deciding. Time and links fix it.
- *Discovered — currently not indexed* — queued. Same answer.
- *Excluded by 'noindex' tag* on `/invoice*` and `/i/*` — **intended**. Those are admin and
  client invoice pages.
- *Blocked by robots.txt* on `/api/*` — **intended**.
- *Page with redirect* on the four `.html` legacy URLs — **intended**, that is §1 working.

**Enhancements → Breadcrumbs.** Should appear for `/services`, `/gear`, `/portfolio`,
`/estimate`, `/contact` and the five service pages. The homepage has no breadcrumb by design.

**No review-snippet or star report will ever appear, and that is deliberate.** Google forbids
self-serving `aggregateRating` / `review` markup on `LocalBusiness`, so `lib/schema.ts` omits it.
The real 4.9 rating lives in on-page copy and on the linked Google profile, where it is
verifiable. Adding it to the markup buys no stars and risks a domain-wide manual action.

**No FAQ report will appear either.** Google retired the FAQ rich result on 7 May 2026. The
`FAQPage` markup is kept because Bing, Copilot and Perplexity still read it.

**Core Web Vitals and Page Experience will read "no data" for a while.** Those reports need ~28
days of real Chrome field data and a minimum traffic threshold. Use PageSpeed Insights lab data
in the meantime.

**Performance report.** Expect near-zero impressions for the first two to four weeks. The useful
first signal is not clicks, it is whether the queries you appear for are *event/sound/light in
Indore* queries or noise.

---

## 4. The one structural limit worth naming

`mihir-music.vercel.app` is a subdomain of a shared, Public-Suffix-listed domain. It works, it
indexes, and everything above applies — but it accrues no domain-level authority of its own, it
cannot have a Domain property, and it reads as a staging URL to a customer who sees it in a
result. A custom domain (e.g. `mihirsoundandlight.in`) is the single highest-value SEO change
left, and it is cheap.

When that happens, in this order:

1. Add the domain in Vercel, point DNS, confirm HTTPS.
2. Set `NEXT_PUBLIC_SITE_URL` to the new origin on Vercel (all environments) and redeploy —
   `lib/site.ts` propagates it to canonicals, sitemap, robots, schema and OG tags automatically.
3. Create a **Domain** property in Search Console (DNS TXT — now possible) and verify.
4. Search Console → *Settings → Change of address*, old property → new.
5. Re-submit `sitemap.xml` on the new property.
6. Generate a fresh IndexNow key, set `INDEXNOW_KEY`, and add the matching
   `public/<key>.txt`; the old key file is tied to the old host.
7. Update the website URL on the Google Business Profile and on Instagram, YouTube and Facebook.

Keep the Vercel domain live and redirecting for at least six months.
