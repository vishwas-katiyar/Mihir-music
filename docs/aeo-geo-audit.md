# AEO / GEO audit and implementation - Mihir Sound & Light

Date: 2026-09-19
Scope: `C:\Users\admin\Desktop\Mihir-music\website` (Next.js 15 App Router)
Target surfaces: Google AI Overviews and AI Mode, ChatGPT Search, Perplexity, Gemini, Microsoft Copilot, voice assistants

---

## 1. Executive summary

The site already had an unusually good SEO foundation for a local service business: a single source of truth for business identity, JSON-LD for LocalBusiness / Service / FAQPage / BreadcrumbList / WebSite, a sitemap, a manifest, an llms.txt route, and service pages written with a deliberate one-sentence direct-answer paragraph. That last detail is the single most valuable thing in the codebase and it was already there.

Three things were holding it back, and one of them was a genuine liability.

1. **Self-serving review markup (liability).** The LocalBusiness node carried both an `aggregateRating` and a full `review` array about itself. Google has prohibited self-serving review and rating markup on `LocalBusiness` / `Organization` since 2019. It buys no star rich result and it exposes the whole domain to a structured-data manual action. **Removed.**
2. **Entity thinness.** The schema described what the business sells but not what it *knows*, where it *operates* as a geography rather than a list of strings, or how its concepts map to anything a knowledge graph already recognises. Answer engines resolve entities before they cite them.
3. **Crawler policy was half-written.** `robots.ts` named `GPTBot` and `Google-Extended` (both training-only crawlers) but not `OAI-SearchBot`, `Claude-SearchBot` or `Perplexity-User` - the agents that actually fetch a page in order to cite it. The allow-list was aimed at the wrong half of each vendor's fleet.

All three are fixed. Also added: an llms.txt rewritten to the llmstxt.org spec plus a new `/llms-full.txt`, an IndexNow ping route that no-ops safely without a key, honest `lastmod` handling in the sitemap, image entries for show media, and the FAQ set expanded from 7 to 16 entries covering the money questions (cost, coverage, equipment, safety, effects).

`npx tsc --noEmit` passes clean. All JSON-LD blocks were fetched from the running dev server and verified to parse.

**The single highest-value item is not in this repo.** For a local service business, AI answer engines resolve "sound and light company in Indore" against Google Business Profile, Bing Places and third-party directories far more than against the company's own website. The 30-day checklist in section 6 matters more than anything in section 4.

---

## 2. Research findings

### 2.1 Google AI Overviews and AI Mode: there is no special markup

Google's own AI-features documentation is blunt about this:

> "There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary."

and

> "You don't need to create new machine readable files, AI text files, or markup to appear in these features. There's also no special schema.org structured data that you need to add."

AI Overviews draw from the same index as organic Search and are judged by the same E-E-A-T signals. The page must be indexed and snippet-eligible - which means `nosnippet`, `data-nosnippet` and a restrictive `max-snippet` actively remove you from AI Overview eligibility. This site correctly sets `max-snippet: -1` and `max-image-preview: large` in `app/layout.tsx`.

Structured data still matters, just not as a trigger. The working consensus is that AI Mode reads structured data as a **verification and entity-resolution signal** - confirming that the phone number in the text is the phone number, that the entity is a business in Indore - rather than as something that renders a visual feature.

- https://developers.google.com/search/docs/appearance/ai-features
- https://www.stackmatix.com/blog/google-search-central-ai-overviews-guidance
- https://www.stackmatix.com/blog/structured-data-ai-search

### 2.2 FAQPage: rich result is dead, markup is not

Timeline: August 2023 Google restricted FAQ rich results to well-known authoritative government and health sites. **7 May 2026 Google retired the FAQ rich result entirely**, including for those sites. Google's documentation, updated the same day, says you do not need to remove existing FAQPage markup - unused structured data causes no problem in Search.

HowTo followed the same path earlier (rich results dropped September 2023, documentation removed).

Decision taken here: **keep FAQPage markup.** Reasons, in order of weight:
1. Bingbot still parses it, and Bing's index is what Microsoft Copilot is grounded in.
2. PerplexityBot and other RAG crawlers get clean, pre-chunked question/answer pairs - which is exactly the retrieval unit these systems index against.
3. There is no downside risk. FAQPage has no eligibility gate to violate and nothing is being claimed that is not visible on the page.

Do **not** add HowTo markup - no surface consumes it and the page has no procedural content to justify it.

- https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/
- https://www.seostrategy.co.uk/learn/faq-schema-deprecation-2026-rich-result-vs-schema/
- https://www.redsharkdigital.com/news/google-how-to-faq-rich-results-update

### 2.3 Self-serving reviews: the one real risk in the old code

Google's 2019 review snippet policy change stopped showing self-serving review stars for `LocalBusiness` and `Organization`. A review about entity A, placed on entity A's own website, in entity A's own markup, is self-serving by definition - whether the review is genuine or not. Google's LocalBusiness documentation states that `aggregateRating` and `review` are recommended properties **"for sites that capture reviews about other local businesses"**.

Violating this can draw a manual action that strips rich results from the entire domain. Google added a further guideline in July 2026 against fake and undisclosed incentivized reviews.

The 4.9 / 120+ rating is real. It just needs to live where it can be verified - on the Google Business Profile, which is linked through `sameAs`, and as visible on-page copy, which is what AI answer engines read anyway.

- https://developers.google.com/search/blog/2019/09/making-review-rich-results-more-helpful
- https://developers.google.com/search/docs/appearance/structured-data/review-snippet
- https://developers.google.com/search/docs/appearance/structured-data/local-business
- https://www.brightlocal.com/learn/review-schema/
- https://jsonschemaapp.com/blog/google-self-serving-reviews-rule/

### 2.4 llms.txt: real spec, negligible adoption, keep it cheap

- Google has said publicly it does not support llms.txt and does not plan to; John Mueller compared it to the keywords meta tag. Google's May 2026 AI guidance states no AI text file is needed.
- No major vendor (OpenAI, Anthropic, Google, Meta, Mistral) has committed to it as a production retrieval signal. OpenAI uses it in the Agents SDK / Agentic Commerce Protocol context, not in ChatGPT Search.
- Measured crawler behaviour: of 500M+ AI bot visits observed over a 90-day window, 408 targeted llms.txt. That is noise.
- Adoption sits around 10% of domains after eighteen months.

Verdict: **keep, but do not invest.** It costs a few kilobytes, it is genuinely useful to user-triggered agents (`Claude-User`, `ChatGPT-User`, `Perplexity-User`) that fetch a page on someone's behalf, and it doubles as a canonical NAP fact sheet generated from the same data the pages render, which prevents drift. It is not a substitute for HTML.

The spec itself (llmstxt.org) is specific: H1 name, blockquote summary, free prose, then H2 sections that are **lists of markdown links with descriptions**, and an optional `## Optional` section for secondary material. The previous file used bare bullets before any H2 and `###` question headings - not spec-shaped. Fixed.

- https://www.getpassionfruit.com/blog/should-i-create-an-llms.txt-file-google-s-2026-guidance-explained
- https://organikpi.com/blog/distribution/llms-txt-adoption-impact/
- https://www.wix.com/studio/ai-search-lab/llms-txt-myths

### 2.5 AI crawlers: training and search are different fleets

This is the most consequential and most misunderstood area.

| Purpose | Agents |
| --- | --- |
| Search / answer (returns citations and traffic) | `OAI-SearchBot`, `ChatGPT-User`, `PerplexityBot`, `Perplexity-User`, `Claude-SearchBot`, `Claude-User`, `Bingbot`, `Googlebot`, `Applebot`, `DuckAssistBot`, `Amazonbot` |
| Training only (returns nothing) | `GPTBot`, `ClaudeBot`, `Google-Extended`, `Applebot-Extended`, `CCBot`, `meta-externalagent`, `Bytespider` |

A robots.txt rule for one no longer covers the other. Blocking `GPTBot` does not remove you from ChatGPT Search; blocking `Google-Extended` does not affect AI Overviews (which run on Googlebot, since AI is built into Search). The old "block all AI bots" advice is now actively harmful to visibility.

The dominant 2026 publisher pattern is "block training, allow answering". **That pattern is wrong for this site** - see the reasoning in section 4.2.

- https://www.digitalapplied.com/blog/ai-crawler-access-control-2026-robots-llms-txt-decision-matrix
- https://technologychecker.io/blog/robots-txt-ai-crawlers-blocking-report
- https://dataimpulse.com/blog/robots-txt-ai-crawlers/

### 2.6 What content actually gets quoted

Repeatedly measured across 2025-2026 studies:

- **44% of LLM citations come from the first 30% of the page.** Lead with the answer; do not build up to it.
- **Lead with a 40-60 word direct answer under a question-shaped heading**, then expand.
- **68.7% of AI-cited pages use a strict heading hierarchy**, versus roughly 40% of uncited pages.
- **Content containing tables is cited about 2.5x more often.** RAG systems chunk by paragraph and heading section; a table is a self-contained, high-density chunk.
- **52.2% of cited passages contained original or owned data** - far above the base rate. Specific equipment models, quantities, load ratings and build times are exactly this kind of owned data, and this site already has them.
- Statistics carry units. "140 dB SPL", "200+ ft of truss", "8 tons", "2-8 hours" restate cleanly; "large", "fast", "premium" do not.

- https://discoveredlabs.com/blog/geo-content-strategy-how-to-write-for-ai-search-and-citations
- https://www.omnibound.ai/blog/generative-engine-optimization-statistics
- https://aeovision.ai/articles/google-ai-overviews-geo-statistics-2026/

### 2.7 Engine-specific source preferences

- **Perplexity** runs staged retrieval: relevance, then freshness, then structural quality, then domain authority, then engagement. Its freshness bias is severe - one March 2026 analysis of 118,000 responses found 82% of cited pages had been updated within 30 days. It cites multiple sources per claim rather than picking one winner, which means a small site can get in.
- **Microsoft Copilot** is grounded in the Bing index, averages ~6.89 citations per answer, and 88% of its citations are unique to Copilot. Bingbot access and indexing speed are the entry ticket - which is what makes IndexNow worth wiring up.
- **Local business reality check:** ChatGPT recommends only about 1.2% of business locations, Perplexity around 7.4%, Gemini roughly 11%. All three lean heavily on Google Business Profile, Bing Places and directory data - not on the business's own site.

- https://www.jumpstartgeo.com/newsroom/how-ai-engines-choose-what-to-cite
- https://whitehat-seo.co.uk/blog/ai-engines-comparison-citations
- https://www.instantpress.co/blog/how-microsoft-copilot-chooses-which-sources-to-cite
- https://www.cheers.tech/geo-academy/ai-search-engine-source-differences

### 2.8 IndexNow

Supported by Bing, Yandex, Naver, Seznam and Yep. **Google has not adopted it.** Requires a key of 8-128 hex characters and a verification file at the domain root named `<key>.txt` containing nothing but the key. The most common failure is HTTP 403 from a missing, misnamed or whitespace-polluted key file.

- https://www.indexnow.org/faq
- https://www.freecodecamp.org/news/how-to-index-nextjs-pages-with-indexnow/

### 2.9 Speakable

Still supported, still beta since 2018, still limited to US-English news content for Google Assistant. Not deprecated, not expanding. Seven years of beta should set expectations. Implemented here as a cheap optional helper, flagged low priority.

- https://developers.google.com/search/docs/appearance/structured-data/speakable
- https://www.margen.net/speakable-schema-voice-search-b2b-2026/

---

## 3. Audit findings

### Strong already

| Item | Note |
| --- | --- |
| `lib/site.ts` | Single source of truth for NAP. This is why the whole site is NAP-consistent by construction - the strongest structural asset in the repo. |
| `services[].definition` | A written one-sentence direct answer per service, rendered as the first paragraph of the page body. This is textbook AEO and it was already here. |
| `app/services/[slug]/page.tsx` | Direct-answer paragraph first, spec table second, deliverables third, FAQ fourth. Correct information order for chunked retrieval. |
| Spec tables | Real models, real quantities, real ratings. Owned data, in table form - the two highest-correlation citation features. |
| `components/seo/JsonLd.tsx` | Server component, escapes `<`, no client JS. Correct. |
| `app/layout.tsx` robots meta | `max-snippet: -1`, `max-image-preview: large`, `max-video-preview: -1`. Required for AI Overview eligibility; correctly set. |
| BreadcrumbList | Present and correct on service pages (verified in rendered HTML - item (e) of the brief). |
| Canonicals | Per-page `alternates.canonical`. Correct. |
| `lang="en-IN"`, `inLanguage` | Locale signals consistent across HTML, OpenGraph and JSON-LD. |

### Risky

| Item | Severity | Resolution |
| --- | --- | --- |
| `review` array on LocalBusiness | **High** - manual action risk, domain-wide | Removed |
| `aggregateRating` on LocalBusiness | **High** - same policy, same rule | Removed from markup; rating retained as visible copy and in llms.txt |
| `priceRange: "₹₹₹"` | Low - meaningless to a machine | Replaced with `"₹85,000 - ₹3,20,000+"`, derived from real package prices |
| Cross-domain image sitemap entries | Low | Added, with the caveat in section 4.4 |

### Missing

| Gap | Impact |
| --- | --- |
| `OAI-SearchBot`, `Claude-SearchBot`, `Perplexity-User`, `Applebot`, `DuckAssistBot` absent from robots.txt | The citation-producing crawlers were not named while the training-only ones were |
| No `knowsAbout`, `slogan`, `foundingLocation`, `hasMap` | Entity too thin for confident resolution |
| `areaServed` as bare `Place` strings | "Pan-India" as a `Place` name is not a resolvable geography |
| Package prices absent from `Offer` price specifications | The most cited fact about a local service business is its price, and it was not machine-readable |
| No `serviceOutput`, `audience`, `availableChannel` on Service | Missing the "what do I actually get" and "how do I buy" edges |
| llms.txt not spec-shaped | Bare bullets before any H2; `###` headings where links were required |
| No `llms-full.txt` | Agents had to crawl 11 pages to assemble the full picture |
| No IndexNow | Bing / Copilot indexing latency left on the table |
| Sitemap `lastModified: new Date()` on every route | Stamps "changed now" on everything at every build. Crawlers discount `lastmod` that is always fresh - and Perplexity weights freshness heavily, so the signal was being wasted |
| FAQ set thin (7 entries) | No answer for equipment, coverage capacity, rigging safety, effects, package comparison, or contact hours |

---

## 4. What was changed, file by file

### 4.1 `lib/schema.ts` (rewritten)

**Removed**
- The `review` array and `aggregateRating` from the LocalBusiness node, with an in-file comment explaining why so nobody re-adds them. The `reviews` import is gone; `lib/reviews.ts` is untouched and still feeds the visible testimonials component.

**Added to the business node**
- `ID` export with stable `@id` constants (`#business`, `#website`, `#logo`) so every node references one entity.
- `slogan`, `legalName`, `disambiguatingDescription`, extra `alternateName` ("Mihir Light Sound", which matches the Facebook page name and is a real alias people search).
- `knowsAbout` as seven `Thing` nodes with `sameAs` links to Wikipedia (Line array, Sound reinforcement system, Subwoofer, DMX512, Stage lighting, Truss, Disc jockey). This is knowledge-graph linking: it anchors the business to concepts the graph already knows rather than to free text.
- `foundingLocation` as a `Place` with a `PostalAddress`.
- `hasMap` pointing at the Google Business Profile link.
- `areaServed` rebuilt as a real geography: an 80 km `GeoCircle` around the Indore coordinates, four `City` nodes each `containedInPlace` Madhya Pradesh, the `AdministrativeArea`, and the `Country`. "Pan-India" as a string became `Country: India`.
- `hasOfferCatalog` with real prices: each package is an `Offer` with `priceCurrency: "INR"` and a `PriceSpecification` carrying `minPrice`, `valueAddedTaxIncluded: false`, plus `availability`, `eligibleRegion`, `seller` and `areaServed`.
- `makesOffer` upgraded from bare `@id` references to real `Offer` nodes with `url`, `availability` and `areaServed`.
- `contactPoint` as an array with `hoursAvailable`, `knowsLanguage`, `employee`, `keywords`, `isicV4: "9000"` (ISIC Rev.4 - creative, arts and entertainment activities).
- `priceRange` now `"₹85,000 - ₹3,20,000+"`, derived from the packages.

**Why `minPrice` and not `price`:** `lib/packages.ts` figures are starting prices. `Offer.price` asserts a fixed price. `PriceSpecification.minPrice` asserts a floor, which is what is true. Each specification also carries a `description` saying the final quote depends on crowd size, venue, date and travel.

**`serviceSchema()`**
- Added `serviceOutput`, `audience` (with `geographicArea`), `availableChannel` (`ServiceChannel` with `serviceUrl`, `servicePhone`, `serviceLocation`, `availableLanguage`), `category`, `brand`, `providerMobility: "dynamic"` (true - the crew travels to the venue), `disambiguatingDescription`, and `isRelatedTo` cross-links between the five services.
- `offers` carries `priceCurrency: "INR"`, `availability`, `seller`, `areaServed`, `eligibleRegion` and a description - **but deliberately no `price`**. Package prices are multi-service bundles; attaching ₹85,000 to "Stage Rigging" alone would be a false claim. This was the brief's item (b), and the honest answer is that the mapping does not exist. Prices live on the packages, where they are true.

**`faqSchema()`** - kept (rationale in 2.2), plus `inLanguage: "en-IN"` and `about` pointing at the business node.

**New: `webPageSchema()`** - `WebPage` with `speakable`, `isPartOf`, `about`, `publisher`, `primaryImageOfPage`, optional dates. Not wired into any page, because pages are off-limits in this pass. Wiring instructions in section 5.3. Low priority per 2.9.

**New: `graph()`** - folds several nodes into one `@graph` block, stripping the inner `@context`. Available if the page engineer prefers one script tag per page.

`breadcrumbSchema()` and `websiteSchema()` retained; `websiteSchema()` gained `description`, `alternateName` and `copyrightHolder`.

### 4.2 `app/robots.ts` (rewritten)

Two named lists - `ANSWER_CRAWLERS` (13 agents) and `TRAINING_CRAWLERS` (12 agents) - both allowed, both disallowed from `/api/`.

**The recommendation, stated plainly: allow both, including training crawlers.** This is a deliberate departure from the dominant 2026 "block training, allow answering" pattern, and here is why.

That pattern exists for publishers whose product *is* the text. For them a training crawl is uncompensated extraction that sends nothing back. Mihir Sound & Light is the opposite case: it is a small local service business whose entire problem is that the models do not know it exists. Being in the training corpus means an assistant can name the business in response to "who does concert sound in Indore" **with no live retrieval at all** - which is the most durable form of the visibility this project is chasing. There is no article inventory to cannibalise. The asymmetry is total: the upside is real, the downside is theoretical.

The lists are named constants precisely so that decision is reversible in one edit. If the owner ever changes their mind, flip `TRAINING_CRAWLERS` from `allow` to `disallow`; answer-engine citation eligibility is unaffected, because those are different agents.

Also added: `Disallow: /api/` for all agents. The IndexNow route is an operator tool, not crawler content.

### 4.3 `app/llms.txt/route.ts` (rewritten) and `app/llms-full.txt/route.ts` (new)

`/llms.txt` restructured to the llmstxt.org spec: H1, blockquote summary, three prose paragraphs carrying identity / service area / full NAP, then `## Services`, `## Packages`, `## Equipment`, `## Answers` and `## Key pages` as link lists with descriptions, then `## Optional` for social profiles and the full-text link. Every entry is now a markdown link, as the spec requires.

`/llms-full.txt` is new: business facts as a table, a package comparison table with `toLocaleString("en-IN")` formatting, every service with its full spec table and deliverables, the complete equipment inventory as four tables, and all 16 answers. One fetch, whole picture. Both are `force-static` and generated from the same data files the pages render, so they cannot drift from the HTML.

The file header comments state the llms.txt adoption reality (2.4) so the next engineer does not over-invest in it.

### 4.4 `app/sitemap.ts` (rewritten)

- `lastModified` moved from `new Date()` on every route to a `CONTENT_UPDATED` constant map with per-area ISO dates, plus a `d()` helper that falls back to build date on a malformed string. **Bump the relevant key when you edit `lib/services.ts`, `lib/packages.ts`, `lib/gear.ts` or `lib/media.ts`.** Honest `lastmod` is worth maintaining specifically because of Perplexity's freshness weighting (2.7).
- Image entries added for `/` (2 thumbnails) and `/portfolio` (all 4), using `ytThumb()` from `lib/media.ts`.

**Caveat on the image entries, stated honestly:** these point at `i.ytimg.com`, not at this domain. Google generally only attributes sitemap images on domains you control or have cross-submission-verified. The entries are harmless and may help associate the media with the brand, but they will not pay off properly until real photography lands in `/public/media` - `lib/media.ts` already has an empty `photos: Photo[]` array waiting for it. When those files exist, swap `reelImages` to point at them. That is a meaningfully higher-value change than the thumbnails.

### 4.5 `app/api/indexnow/route.ts` (new)

`GET` and `POST`, both no-ops returning HTTP 200 `{ skipped: true }` when `INDEXNOW_KEY` is unset - so it can be wired into a deploy hook before the key exists. With a key set, both require a shared secret (`x-indexnow-token` header or `?token=`) to stop quota abuse. `POST` accepts an optional `{ "urls": [...] }` body for targeted submission, validating that every URL is on this host and normalising bare paths; without a body it submits all 11 site URLs. `keyLocation` is emitted only when `INDEXNOW_KEY_LOCATION` is set. Response bodies are truncated to 500 characters.

Full setup instructions are in the file header and repeated in the checklist below.

**On `public/`:** no key file was created, because the key does not exist yet and a placeholder file would fail verification with a 403 - worse than no file. Create `public/<key>.txt` by hand once the key is generated; see 6.3.

### 4.6 `lib/faqs.ts` (expanded, 7 → 16)

Added nine entries, all question-shaped and direct-answer-first, every fact traceable to `lib/site.ts`, `lib/services.ts`, `lib/packages.ts` or `lib/gear.ts`:

- What does a sound and light setup cost in Indore? (all three starting prices in one answer)
- What is the difference between your three production packages? (the comparison answer, with prices and what each tier adds)
- How big a crowd can your sound system cover? (200-20,000; 5,000+ open ground; 140 dB SPL)
- What sound and lighting equipment do you own? (models and quantities straight from `lib/gear.ts`)
- Do you supply an engineer, or only the equipment?
- Is your truss rigging insured and load-rated? (8 tons, secondary safeties, 30 ft, 2-6 ft risers)
- Do you provide LED video walls, cold sparks or haze? (P3/P4 on request, 8 cold-spark units, 4 haze machines)
- Can the lighting be synced to a specific song or moment?
- What are your working hours and how do I reach you? (full NAP restated in answer form - the shape a voice assistant needs)

A comment block at the top states the writing rules for anything added later: entity named in the first sentence, numbers carry units, every fact traceable to a data file, plain hyphens only. No prices, awards, client names, lead times, deposit terms or cancellation policies were invented - where the data did not exist, no question was written.

---

## 5. Recommendations for the page engineer

These require edits to components and pages, which were out of scope for this pass.

### 5.1 Question-shaped H2s (highest value, lowest effort)

Section headings are currently statements or labels. AI retrieval chunks by heading, and the heading is what gets matched against the user's query. Rewrite headings to match the query, then answer immediately underneath in 40-60 words.

On `/services/[slug]`, the card headings `Technical specification`, `What's included` and `Ideal for` are labels. Suggested replacements, driven from the service data:

- `Technical specification` → `What equipment is in the {shortName} rig?`
- `What's included` → `What do you get with {shortName}?`
- `Ideal for` → `What events is {shortName} used for?`
- `Pairs with` → `What else do you need alongside {shortName}?`

On the home page, the same move for the services, packages and estimator sections. `PackagesTabs` in particular should sit under something like `How much does sound and lighting cost in Indore?`.

### 5.2 A visible package comparison table

Content with tables is cited roughly 2.5x more often (2.6), and the packages are currently rendered as tabs - which means only one tier is in the DOM text at a time and no single chunk contains the comparison. Add a real `<table>` below the tabs, with all three tiers side by side, units in the header cells:

| Package | Starting price (INR) | Crowd | Moving lights | Sound | Crew |
| --- | --- | --- | --- | --- | --- |
| Club / House | ₹85,000 | Club and house parties | 8-12 with haze | Compact line array, dual subs, stage wedges | Crew and deck setup |
| Wedding Luxe | ₹1,60,000 | Sangeet, reception, varmala | Full DMX pixel scene design | Premium line array, cardioid subs | Show caller, live audio engineer |
| Arena Fest | ₹3,20,000 | Open-ground and festival | Lasers, strobes, blinders, haze | High-SPL flown arrays, festival subs | Show calling, comms, strike crew |

The crowd column should be filled from whatever the estimator already uses; do not invent head counts. Every cell above is drawn from `lib/packages.ts`.

Add a caption: `Starting prices in Indian rupees. Final quote depends on crowd size, venue, date and travel.` Captions are retrieved with the table and prevent a model quoting the price as fixed.

### 5.3 Wire `webPageSchema()` and mark the speakable block

In `app/services/[slug]/page.tsx`, add to the `JsonLd` array:

```tsx
webPageSchema({
  name: `${s.name} in Indore & Madhya Pradesh`,
  description: s.definition,
  path: `/services/${s.slug}`,
  speakableSelectors: ["h1", "[data-speakable]"],
})
```

and put `data-speakable` on the direct-answer paragraph that already renders `{s.definition}` (line 74). Same on the home page for the hero's one-sentence answer. Low priority (2.9), but it costs one attribute.

### 5.4 Put the rating back as visible copy

Now that `aggregateRating` is out of the markup, the 4.9 / 120+ figure must be plainly visible in text and linked to the Google profile - that is both the compliant way to make the claim and the form AI engines actually read. Suggested copy for `ProofBand` or `Testimonials`:

> Rated 4.9 out of 5 across 120+ Google reviews. [Read them on Google](https://share.google/Eb1dYJEUgx5Y9LPMz)

The outbound link to the profile is the point: it makes the claim verifiable at its source, which is exactly the E-E-A-T signal the markup was never going to provide.

### 5.5 Add a dateModified line to service pages

Perplexity's freshness bias is severe - 82% of its cited pages were updated within 30 days (2.7). A visible `Updated September 2026` line near the H1, kept in step with the sitemap's `CONTENT_UPDATED` map, is a cheap freshness signal that both crawlers and readers can see.

### 5.6 Smaller items

- **First-sentence discipline on every page.** `/gear`, `/portfolio`, `/estimate` and `/contact` should each open with a one-sentence direct answer naming the business and the city, the way the service pages already do. 44% of citations come from the first 30% of the page.
- **Entity consistency.** Use the full string "Mihir Sound & Light" on first mention on every page, not "we" or "Mihir". Models resolve entities by repeated exact strings.
- **NAP in the footer as text, not an image or an icon-only link.** Full address, phone, hours. It is likely already text - confirm.
- **`alt` text on show media** should describe the build: "Two-tier truss with moving heads at an open-ground concert in Indore", not "concert". `lib/media.ts` captions are already this good; make sure they reach the `alt` attributes.
- **Do not add HowTo markup** (2.2).

---

## 6. 30-day checklist

Ordered by expected impact. Items 1-3 outweigh everything in this repo.

### Week 1 - the things that actually decide local AI citations

1. **Google Business Profile.** Claim and fully complete it. Category `Audio visual equipment rental service`, secondary `Event planner` / `Stage lighting equipment supplier`. NAP must match `lib/site.ts` character for character: `Bajrang Nagar 363, Indore, Madhya Pradesh 452001` and `+91 70000 51042`. Add hours 09:00-22:00 all seven days, the website URL, services with the package price floors, and 20+ photos. Fill the Q&A section with the same questions now in `lib/faqs.ts` - Google's own Q&A is a direct AI Overview input for local queries.
2. **Bing Places for Business.** Same data, same strings. This is Copilot's grounding source and it is routinely skipped. 88% of Copilot citations are unique to Copilot (2.7) - it is a separate audience, not a subset of Google's.
3. **Apple Business Connect.** Feeds Apple Maps and Siri. Free, ten minutes, and almost nobody in this vertical has done it.

### Week 2 - verification and indexing

4. **Google Search Console.** The verification token is already in `app/layout.tsx`; confirm the property is verified, submit `https://mihir-music.vercel.app/sitemap.xml`, then check Rich Results / Enhancements for structured-data errors after this deploy ships.
5. **Bing Webmaster Tools.** Verify (can import from GSC), submit the sitemap.
6. **IndexNow key.**
   - Generate: `openssl rand -hex 16` (32 hex characters).
   - Add `INDEXNOW_KEY` to Vercel project environment variables, all environments.
   - Create `public/<key>.txt` containing **only** the key - no trailing newline, no whitespace, no BOM. Commit it.
   - Deploy, then confirm `https://mihir-music.vercel.app/<key>.txt` returns the bare key as `text/plain`.
   - Test: `curl -X POST https://mihir-music.vercel.app/api/indexnow -H "x-indexnow-token: $INDEXNOW_KEY"`. Expect `{"ok":true,"status":200,...}`. A 403 in the response body means the key file is wrong - re-check for whitespace first, it is the usual culprit.
   - Optionally add a Vercel deploy hook to call the route after each production deploy.
7. **Validate the new markup.** Run `/` and `/services/arena-audio` through the Schema.org validator (validator.schema.org) and Google's Rich Results Test. Expect no errors. Expect *no* review or rating output - that is the intended outcome of section 4.1, not a regression.

### Week 3 - citations, NAP and reviews

8. **Directory citations, NAP identical everywhere.** Justdial, Sulekha, IndiaMART, WeddingWire India, WedMeGood, ShaadiSaga, UrbanClap/Urban Company, Google Maps, Bing Places, Apple Maps, Facebook, Instagram bio. Perplexity and Gemini lean on aggregated directory data for local queries far more than on the business's own site. One character of drift in the address or phone splits the entity.
9. **Review acquisition.** The 4.9 / 120+ is strong; the risk is staleness, since recency is weighted. Target 4-8 new Google reviews per month, requested by WhatsApp within 24 hours of a show while the client is still pleased. Ask for specifics - "sangeet at [venue], 400 guests, line array and 12 movers" - because review text containing the service and the city is itself a retrievable local signal. **Never incentivize reviews**; Google added an explicit guideline against undisclosed incentivized reviews in July 2026. Reply to every review, positive and negative.
10. **YouTube.** The channel is real and underused. Full descriptions naming the venue, city, equipment and event type; link back to the matching service page. YouTube is a first-class citation source for Gemini and appears in AI Overviews.

### Week 4 - measurement and content

11. **Baseline AI visibility.** Manually run the four target queries in Google AI Mode, ChatGPT Search, Perplexity, Gemini and Copilot. Record who gets cited today. Repeat monthly - there is no Search Console for AI citations, so a manual log is the measurement.
12. **Server-log check for AI crawlers.** In Vercel logs, filter for `OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`, `Bingbot`. If they are not arriving within 30 days of this deploy, the problem is discovery (links and citations), not markup.
13. **Apply section 5.** Question-shaped H2s and the visible package comparison table are the two highest-value content changes.
14. **Own photography.** Drop JPGs into `/public/media`, populate `photos` in `lib/media.ts`, then switch the sitemap image entries from YouTube thumbnails to first-party images (4.4).
15. **Local links.** Indore venues, wedding planners, decorators, DJs, college fest pages. Domain authority and referring domains remain among the top five citation drivers (2.6), and for a local business these are the realistic sources.

---

## 7. Risks and things deliberately not done

| Risk / decision | Assessment |
| --- | --- |
| **Removing `aggregateRating` loses a signal** | Real but small, and the trade is clearly worth it. No star rich result was available for LocalBusiness anyway. The rating stays in visible copy and `/llms.txt`, which is what answer engines read, and `sameAs` points to the Google profile where it is verifiable. The removed risk - a domain-wide structured-data manual action - is far larger than the removed benefit. |
| **Allowing training crawlers** | A judgement call, argued in 4.2. Reversible in one edit. The argument would invert if this site ever became a content publisher. |
| **Keeping FAQPage after full deprecation** | No downside. Google says unused structured data causes no problem; Bing and the RAG crawlers still parse it. |
| **`services[].offers` has no `price`** | Intentional. The brief asked for prices "where mapping is honest" and the mapping is not honest - packages are bundles. Prices are machine-readable on the package offers, where they are true. |
| **Cross-domain image sitemap entries** | Low value until first-party photos exist (4.4). Harmless meanwhile. |
| **llms.txt may never be read by anything** | Accepted and documented in-file so nobody over-invests. Cost is kilobytes. |
| **`priceRange` is now specific** | `"₹85,000 - ₹3,20,000+"` is derived from `lib/packages.ts`. If those prices change, this string is generated from the same data - but the `disambiguatingDescription` and the FAQ answers are hand-written. Grep for `85,000` and `3.2 lakh` when repricing. |
| **`CONTENT_UPDATED` will rot** | The sitemap dates are manual. If nobody bumps them they will be stale, which is still better than the previous always-now, but it needs an owner. Consider deriving them from git commit times for the relevant data files later. |
| **Not verified** | `foundingYear: 2012`, the 4.9 / 120 rating, the gear quantities, the 8-ton load rating and the insurance claim were all taken as given from the existing data files. They are asserted in schema and in FAQ answers. If any is not accurate, it should be corrected in `lib/site.ts` / `lib/gear.ts` / `lib/services.ts` - the claim about insured, load-rated rigging is the one with real-world liability attached, not just SEO consequences. |
| **`app/llms-full.txt/route.ts` is a new route** | Outside the originally listed editable files, but explicitly sanctioned by brief item (g). Adds one static route. |

---

## 8. Verification

```
$ npx tsc --noEmit
(no output - clean)
```

Rendered output checked against the running dev server:

| Route | Result |
| --- | --- |
| `/` | 3 JSON-LD blocks, all parse: `["LocalBusiness","EntertainmentBusiness","ProfessionalService"]`, `WebSite`, `FAQPage` |
| `/services/arena-audio` | 5 JSON-LD blocks, all parse: business, `WebSite`, `Service`, `FAQPage`, `BreadcrumbList` |
| `/robots.txt` | 3 rule groups, 25 named agents, `Disallow: /api/`, sitemap and host present |
| `/sitemap.xml` | 11 URLs, image namespace declared, per-area `lastmod`, thumbnails on `/` and `/portfolio` |
| `/llms.txt` | llmstxt.org shape confirmed: H1, blockquote, prose, six H2 link sections, `## Optional` |
| `/llms-full.txt` | Renders business table, package comparison, five service sections with spec tables, four gear tables, 16 answers |
| `/api/indexnow` | `{"skipped":true,"reason":"INDEXNOW_KEY is not set; nothing submitted."}` - correct no-op |

No components, pages, CSS or other lib files were modified.
