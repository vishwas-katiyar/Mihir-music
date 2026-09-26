# Search Console research brief — mihir-music.vercel.app

Date: 2026-09-26. Companion to `docs/search-console.md` (which already covers verification, sitemap, request-indexing order, the black-screenshot artifact, GBP/Bing, and the custom-domain migration; nothing below repeats those).

**Live check done today (curl as Googlebot):** `/`, `/services`, `/sitemap.xml`, `/robots.txt` and `/favicon.ico` all return 200 with **no `X-Robots-Tag` header**; `<meta name="robots" content="index, follow">` and a self-canonical are in the HTML. Vercel only injects `X-Robots-Tag: noindex` on preview deployments and on *superseded* production deployments, not on the live production `*.vercel.app` URL ([Vercel KB](https://vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines)). So nothing on the server side is blocking indexing; the empty reports are a timing problem, not a configuration one.

---

## A. Page indexing report (2026)

Source for all definitions: [Page indexing report help](https://support.google.com/webmasters/answer/7440203). Google also says: "If your site has fewer than 500 pages, you probably don't need to use this report" — for 11 URLs, URL Inspection per page is the better tool.

| Status | Meaning (Google's words) | Correct action for this site |
|---|---|---|
| Discovered – currently not indexed | "found by Google, but not crawled yet"; Google deferred the crawl | None. Not a crawl-budget issue at 11 URLs — Google says sites without "a large number of pages that change rapidly" need not think about crawl budget ([crawl budget doc](https://developers.google.com/search/docs/crawling-indexing/large-site-managing-crawl-budget)). Wait; earn links (§C). |
| Crawled – currently not indexed | "crawled by Google but not indexed… no need to resubmit this URL" | None. Google's July 2026 comments tie *mass* occurrences to site-wide quality doubts; for 5 thin-ish service pages, make each page substantively different (own gear list, own FAQ, own photos). |
| Duplicate without user-selected canonical | Google picked a different URL as canonical | Should not occur: every route self-canonicalises. If it appears, the "Google-selected canonical" in URL Inspection tells you which two URLs collided. |
| Alternate page with proper canonical tag | "correctly points to the canonical page, which is indexed, so there is nothing you need to do" | None. |
| Page with redirect | "non-canonical URL that redirects… will not be indexed" | Expected for the four legacy `.html` URLs. |
| Excluded by 'noindex' tag | Google honoured your noindex | Expected for `/invoice*`, `/i/*`. |
| Blocked by robots.txt | Blocked from crawling; Google notes it may still index the URL without content and recommends noindex if the goal is de-indexing | Expected for `/api/*`. |
| Not found (404) | 404 returned; Google "may continue crawling periodically" | Only real 404s should remain. If one is a moved page, 301/308 it (done for the legacy URLs). |
| Soft 404 | "user-friendly 'not found' message but not a 404 HTTP response code" | Ensure `not-found.tsx` really returns HTTP 404 (Next does by default). Also triggered by pages Google renders as *empty* — the hero/`svh` render issue in the runbook §2.4 is worth watching for exactly this; if it ever appears, cap the hero height for that viewport. |

**Realistic timeline for a new ~11-URL site.** Google's own line is "It can take a few weeks for Google to notice a new site, or any changes" ([Get on Google](https://developers.google.com/search/docs/basics/get-on-google)). After Request indexing, the URL Inspection doc says "Indexing typically takes only a day or so, but can take much longer in some cases" and "Submitting a request does not guarantee that the page will appear" ([URL Inspection](https://support.google.com/webmasters/answer/9012289)). Practical expectation: homepage indexed within days; the five new `/services/*` pages 2–6 weeks, and they may sit in "Crawled – not indexed" until something external links to them. Mueller has said quality-driven reassessments take "a couple of months… sometimes longer" — that is the worst case, not the norm for a clean site.

**Request indexing quota.** Google only documents "a daily limit" without a number. Widely observed: ~10–12 manual requests/property/day, button greys out for 24 h (unverified; [community thread](https://support.google.com/webmasters/thread/404879366)). It queues a crawl; it does not guarantee indexing, and re-requesting an already-crawled page does nothing extra.

**"Validate fix".** Only meaningful for *issues* (errors/warnings) in the "Why pages aren't indexed" table. It is pointless for "Crawled/Discovered – currently not indexed" (nothing to validate) and for the intentional noindex/robots/redirect rows. Validation "typically takes up to about two weeks, but in some cases can take much longer" and Google says "Do not click Validate fix again until validation has succeeded or failed" ([doc](https://support.google.com/webmasters/answer/7440203#validation)).

**`*.vercel.app` and the Public Suffix List.** `vercel.app` is on the PSL, so browsers and (per Mueller) Google treat each subdomain as an independent site; the site earns nothing from vercel.app and vercel.app earns nothing from it. Mueller's documented downside (Jan 2026): free-subdomain hosts "attract a lot of spam & low-effort content", which "makes it harder for search engines & co to understand the overall value of the site" — the "neighbourhood" signal still leaks through the PSL boundary ([SEJ, 2026-01-19](https://www.searchenginejournal.com/googles-mueller-free-subdomain-hosting-makes-seo-harder/565249/)). No Search Central doc names the PSL explicitly (unverified beyond Mueller's statements). Conclusion matches the runbook §4: a custom `.in` domain remains the single biggest lever.

---

## B. The Links report

Source: [Links report help](https://support.google.com/webmasters/answer/9049606).

| Section | What it shows |
|---|---|
| External → Top linked pages | Your pages with the most links from other sites, grouped by canonical |
| External → Top linking sites | Domains linking to you most |
| External → Top linking text | Most common anchor text pointing at you |
| Internal → Top linked pages | Which of your own pages receive the most internal links |

Facts that explain the empty report:

- The report "shows a sample of internal and external links" and "Some URLs might be omitted… such as non-indexed pages or deduped URLs." Internal links only count once the *linking* pages are crawled and processed; with most pages still "Discovered/Crawled – not indexed", there is nothing to tabulate. There is no documented minimum count.
- External links appear only after Google has crawled the *linking* page on the other site. With zero links today (the service pages are brand-new), empty is the correct value, not a bug.
- The report does not flag nofollow: Google's doc says data "doesn't specify if links are marked as nofollow", so directory citations will show up here regardless of attribute.
- **Refresh cadence: Google publishes none.** Community reports in 2026 describe batched, not real-time, updates (unverified). Treat it as a monthly check, not a daily one.

Practical reading: internal links will populate within a few weeks of the pages indexing; the first external rows will appear 2–8 weeks after the citations in §C go live and get crawled.

---

## C. Off-site, India-specific citation and link plan

Google's local-ranking doc defines *prominence* partly as "how many websites link to your business and how many reviews you have" and says "Businesses with complete and accurate info are more likely to show up" ([GBP ranking factors](https://support.google.com/business/answer/7091)). Since 2019 Google treats `nofollow` as a hint rather than a directive ([qualify outbound links](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links)), so a nofollow citation is still a valid entity signal — the NAP match matters more than the attribute.

**Rule for every listing:** copy name, address line, PIN and phone **byte-for-byte** from `lib/site.ts` (same "Sound & Light" vs "Sound and Light", same "+91" formatting, same suite/floor wording). Website field = `https://mihir-music.vercel.app` exactly (no trailing path); update all of them the day a custom domain ships.

| Platform | Why | Link attribute | Notes |
|---|---|---|---|
| Google Business Profile (website + Posts) | The local pack; GBP website link is the citation Google trusts most | Widely reported nofollow (unverified) | Link must go to "a dedicated landing page for your business", no shorteners, no social URLs ([GBP link policy](https://support.google.com/business/answer/13769188)). Posts carry an action button with a link and stay live ~6 months ([Posts](https://support.google.com/business/answer/7662907)) — post each major show with a link to the matching service page. |
| Instagram / YouTube / Facebook profile fields | Brand entity, `sameAs` targets in schema | All nofollow/redirected (unverified, widely reported) | Put the URL in YouTube "Links", Instagram bio, Facebook Page "Website". Add all three to `sameAs`. |
| Justdial | Highest-traffic Indian local directory; category "Sound System On Hire", "Lighting Equipment On Hire" | Unverified (site blocks crawlers; treat as nofollow/JS) | Free listing, OTP-verified phone. |
| Sulekha | Has "Sound System Rental", "Audio Mixer Rentals", event decorator categories ([list your business](https://www.sulekha.com/list-your-business)) | Unverified | Free; mobile-number sign-up. |
| IndiaMART | Business profile has a "Website address" field ([help](https://help.indiamart.com/knowledge-base/what-is-a-business-profile/)); B2B enquiries for AV hire | Unverified | Free seller registration. Skews product; still worth one clean profile. |
| WeddingWire India | Categories "Wedding DJs", "Wedding Music", "Wedding Entertainment", "Wedding Decorators" ([weddingwire.in](https://www.weddingwire.in/)) | Unverified | "Are you a vendor?" → business portal. Free tier exists (unverified). |
| WedMeGood | Indore vendor pages exist ("Wedding Entertainment" category, e.g. a competing Indore sound/light vendor is already listed) ([vendors/indore](https://www.wedmegood.com/vendors/indore/)) | Unverified | Vendor signup at `/vendor-signup`; reviews carry weight here. |
| ShaadiSaga | **Skip.** Acquired by Matrimony.com in 2021 and folded into WeddingBazaar; the domain now serves a matrimony.com certificate ([Business Standard](https://www.business-standard.com/article/companies/matrimony-com-to-buy-wedding-planning-firm-shaadisaga-for-rs-11-cr-121070700790_1.html)). List on **WeddingBazaar.com** instead if it has an Indore vendor flow. |
| UrbanPro | **Skip.** Tutoring/education only in 2026 ([urbanpro.com](https://www.urbanpro.com/)). |
| Eventective | **Skip.** US/Canada-centric; no meaningful India coverage (unverified). |
| **EESA — Event Equipment Services Association** | The Indian trade body for audio/lighting/video/rigging rental companies; pan-India since 2020, "open to all companies having invested in their own equipment"; runs a searchable member directory ([eesa.in](https://eesa.in/), [EventFAQs 2020](https://in.eventfaqs.com/2020/06/29/event-equipment-services-association-goes-national-to-bring-together-companies-in-the-event-industry/)) | Unverified | The most on-brand citation available. Register at `eesa.in/register`; fees not published. Also the credential to put on the About page. |
| EEMA members list | Event industry association; "Associate" tier needs Rs 50 lakh turnover in one FY ([membership](https://www.eemaindia.com/be-an-eema-member)) | Unverified | Only if turnover qualifies; public [members list](https://www.eemaindia.com/members-lists). |
| EventFAQs (in.eventfaqs.com) | Industry news; runs vendor/equipment stories | Editorial (followed) | Pitch a story when a notable Indore show ships (no paid listing needed). |
| Indore local | No chamber with a crawlable public directory was found (AIMP, Indore Management Association have member rosters but not link directories — unverified). Skip "Indore business directory" clones; they are the spammy tier. | — | Better local links: venue partners (marriage gardens, hotels) crediting you on their "vendors" page; Indore event-management agencies' partner pages; college fest sponsor pages. These are followed editorial links and fill *Top linking sites*. |

Order of effort: GBP → EESA → Justdial/Sulekha → WedMeGood/WeddingWire → social fields → venue/agency partner pages. Ten clean citations beat fifty sloppy ones; a single mismatched phone number across listings is the classic local-pack suppressor.

---

## D. "Best look in Google" checklist, 2026

| Feature | Current rules | What to do here |
|---|---|---|
| **Sitelinks** | Fully automated: "Our systems analyze the link structure of your site to find shortcuts"; shown only when useful, typically on brand/navigational queries. Best practice: informative, compact titles/headings; logical structure; important pages linked from other relevant pages; "concise and relevant" anchor text; avoid repetition ([sitelinks doc](https://developers.google.com/search/docs/appearance/sitelinks)). Sitelinks *search box* retired Nov 2024. Up to ~6 shown (unverified). | Nav + footer must link every top route with plain anchors ("Services", "Gear", "Portfolio", "Estimate", "Contact"); no icon-only links. Expect sitelinks only once "mihir sound and light" queries have clicks. |
| **Breadcrumbs** | `BreadcrumbList` with ≥2 `ListItem`, each `name`+`position`, `item` URL required for all but optionally the last; reflect the user path, not the URL. **Desktop only since Jan 2025** ([breadcrumb doc](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb), [updates](https://developers.google.com/search/updates)). | Already shipped. Confirm in *Enhancements → Breadcrumbs* after indexing; do not expect them on phone results. |
| **LocalBusiness** | Required `name`, `address`. Recommended `telephone`, `url`, `openingHoursSpecification`, `geo` (≥5 decimals), `priceRange`, `image`. `review`/`aggregateRating` "only recommended for sites that capture reviews about other local businesses" ([LocalBusiness](https://developers.google.com/search/docs/appearance/structured-data/local-business)). Self-serving: pages "that use LocalBusiness or any other type of Organization structured data are ineligible for star review feature" if the entity controls its own reviews ([review snippet](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)). | Keep aggregateRating out (runbook already does). Make sure `geo` has ≥5 decimals, `openingHoursSpecification` is present, `image` is a real photo of the rig/warehouse. |
| **Organization `logo`** | "The image must be 112x112px, at minimum", "must be crawlable and indexable", format supported by Google Images; make sure it reads on a white background ([Organization](https://developers.google.com/search/docs/appearance/structured-data/organization)). `sameAs` → social/review profiles. | Gold-on-black logo: supply a variant with a solid background for `logo`; a transparent gold mark on white may vanish in the knowledge panel. Add every §C profile URL to `sameAs`. |
| **Title link** | Google rewrites when the title is stuffed, boilerplate across pages, incomplete (`| Site Name`), stale, in the wrong language, or when multiple headings compete; replacements are drawn from the visible title, `<h1>`, and anchor text ([title link doc](https://developers.google.com/search/docs/appearance/title-link)). | Current home title is ~85 chars with three services + city + brand; expect truncation, possibly rewriting to the H1. Keep each page's `<title>` and `<h1>` saying the same thing, one service per page, brand once at the end. |
| **Meta description** | Google "sometimes uses the meta description" when it describes the page better than body text; make each unique, factual ("key bits of information"), no keyword lists; no hard length limit, truncated to device width ([snippet doc](https://developers.google.com/search/docs/appearance/snippet)). | One sentence with concrete facts per page (e.g. "24 Sharpy heads, 8 t certified rigging, line-array audio; Indore and MP; call +91…"). |
| **FAQ rich results** | **Gone.** Restricted to government/health sites 14 Sep 2023; stopped appearing for everyone 7 May 2026; removed from Search Console reports and Rich Results Test June 2026; API support removed Aug 2026. Markup "can stay in place… won't cause problems" ([SEJ 2026-05-10](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/), [Google updates](https://developers.google.com/search/updates)). | Runbook is correct. Keep `FAQPage` for Bing/AI engines; expect no Google report. |
| **GBP ↔ website** | GBP website link must be a dedicated landing page, not social/shortener ([policy](https://support.google.com/business/answer/13769188)); LocalBusiness markup does not feed Maps — the profile does. | GBP link → homepage; schema `url` = homepage; NAP identical in all three places (GBP, visible footer, JSON-LD). |

---

## E. What to click in Search Console this week (in order)

Assumes favicon/metadata/internal-link fixes deploy today.

1. **Day 0, after deploy** — *URL Inspection* → paste the homepage → **Test live URL** → *View tested page* → **HTML** tab. Search the HTML for `rel="icon"` and confirm the new `href`, and for the new `<title>`. This is the only way to "see" the favicon in GSC: **URL Inspection cannot be used on the `.ico` file itself** — Mueller: "The Inspect URL tool is only useful for webpages, so if you inspect images, CSS, JS, etc — then the results there wouldn't be as useful" ([SEJ](https://www.searchenginejournal.com/google-search-consoles-inspect-url-tool-is-only-useful-for-webpages/292607/)). The *More info → Page resources* tab on the same panel will list whether the icon was fetched during render. Then click **Request indexing** on the homepage. Google's favicon doc: "Googlebot-Image must be able to crawl the favicon file and Googlebot must be able to crawl the home page" and "crawling can take anywhere from several days to several weeks" ([favicon doc](https://developers.google.com/search/docs/appearance/favicon-in-search)). Honest expectation: the result icon updates when the homepage is *re-indexed*, not when the request is queued — days to a few weeks. Check with a `site:mihir-music.vercel.app` search, not the Pages report.
2. **Day 0** — Request indexing for `/services` and the three priority service pages (quota permitting; the rest tomorrow).
3. **Day 0** — *Indexing → Sitemaps*: confirm `sitemap.xml` shows *Success* and today's `lastmod`s. If the entry is stale, delete and re-add it to force a refetch.
4. **Day 1** — Do the §C listings: GBP website + first Post, EESA register, Justdial, Sulekha. Update social profile URLs.
5. **Day 3** — *Pages* report: expect the homepage under *Indexed*; service pages moving from *Discovered* to *Crawled – not indexed*. Do **not** click *Validate fix* on those rows.
6. **Day 7** — *Enhancements → Breadcrumbs* should list the indexed inner pages. *Links → Internal* may start showing rows. *Links → External* will still be empty.
7. **Day 14** — Re-check *Pages*; re-request only pages still in *Discovered* (re-requesting *Crawled – not indexed* does nothing). Check `site:` for the icon and rewritten titles.
8. **Day 30** — *Links → External* should show the first citations; *Performance* should show branded impressions. If service pages are still unindexed at day 45, the fix is more external links and more differentiated content, not more requests.

Honest summary: nothing found today is misconfigured. The three symptoms (few indexed pages, stale icon, empty Links) are the normal state of a site that is four days past a redesign on a shared-suffix host; the calendar above and the citations in §C are the levers, and a custom domain remains the largest single one.
