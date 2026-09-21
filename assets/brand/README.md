# MIHIR brand asset kit

Logo system, colours, typography and campaign templates for **MIHIR** - sound & light, event
production, Indore. Everything here is generated from one shared design core
(`scripts/brand/core.mjs`), so the monogram, wordmark, tagline and gold treatment are identical
in every file. Use the assets as they are; do not redraw or re-export them by hand.

Tagline (always this exact text): **SOUND & LIGHT | EVENT | PRODUCTION**

## Folder map

| Folder | What is in it |
| --- | --- |
| `01-primary-logo/` | Stacked primary logo: monogram, wordmark and tagline - the default lockup |
| `02-horizontal-logo/` | Monogram, divider and wordmark side by side with the tagline beneath - for wide headers, website nav, banners |
| `03-stacked-logo/` | Vertical arrangement for narrow or tall spaces (posters, roll-ups, portrait social) |
| `04-icon-mark/` | The "M" monogram alone - favicons, app icons, watermarks, stage screens |
| `05-wordmark/` | "MIHIR" wordmark alone - when the monogram already appears nearby |
| `06-monochrome-logo/` | Flat single-colour black versions - print, engraving, stamps, one-colour merchandise |
| `07-inverse-logo/` | Flat white / negative versions for dark photos and video |
| `08-social-media-avatar/` | Square and circular profile images with the monogram in a ring |
| `09-badge-emblem/` | Circular emblem (monogram, wordmark, tagline inside two rings) - seals, stickers, crew wear |
| `10-responsive-logo/` | The size ladder: full logo, horizontal, wordmark, icon - which version to use at which size |
| `11-festival-variation/` | Ganpati campaign creatives (16:9 banner, 1:1 post, 9:16 story) with the gold Ganesha motif |
| `12-colour-variations/` | Logo on every approved background: gold on black, black on white, white on black, black on gold, gold on navy, white on grey |
| `13-brand-colours-typography/` | Colour and type specimen card, `colours.json`, `colours.css`, and the `fonts/` bundle with licence |
| `14-social-media-templates/` | Ready-to-post templates: `feed-square/` (1080x1080), `feed-portrait/` (1080x1350), `story/` (1080x1920), `covers/` (Facebook, LinkedIn, YouTube, link post), transparent `-overlay.png` frames for your own photos, and a contact sheet. See its own README |
| `board/` | The complete brand board (`mihir-brand-board.svg/.png/.jpg`, 4096 x 2731) with all 13 panels |

### File naming

`<asset>-<colour>-<on-background | transparent>.<svg | png>`

Examples: `primary-logo-gold-on-black.png`, `icon-mark-white-transparent.svg`,
`festival-ganpati-banner-16x9.png`. Always prefer the SVG for print and web; PNGs are supplied
at 4K (4000 px on the long edge) for slides, video and social tools that cannot use SVG.

## Which lockup to use

- **Primary (stacked)** - the default. Use whenever there is room: covers, invoices, posters, backdrops.
- **Horizontal** - wide, short spaces: website header, email signature, banners, vehicle sides.
- **Stacked / vertical** - tall, narrow spaces: portrait posters, roll-up standees, stories.
- **Icon** - small spaces where the name is already present, or brand recognition is established:
  favicon, app icon, social avatar, watermark, LED screen bugs.
- **Wordmark** - when the monogram appears elsewhere on the same layout, or for text-only contexts.
- **Monochrome / inverse** - single-colour reproduction (print, engraving, embroidery) or on
  busy photo backgrounds where the gold gradient would not hold.

## Minimum sizes

| Asset | Minimum |
| --- | --- |
| Icon / monogram | 24 px (or 8 mm in print) |
| Wordmark | 120 px wide (30 mm) |
| Full logo (primary / horizontal) | 200 px wide (50 mm) |

Below these sizes the swashes and the tagline lose definition: step down the ladder in
`10-responsive-logo/` instead of shrinking the full logo.

## Clear space

Keep a margin around every logo at least equal to the **height of the "I" in MIHIR** on that
lockup. Nothing else - text, photos, other logos, panel edges - enters this zone.

## Don'ts

- Do not stretch, squash, rotate or skew any mark.
- Do not recolour outside the palette below, add outlines, drop shadows or glows.
- Do not place the gold gradient logo on gold, light-yellow or busy backgrounds; use the
  black or white flat versions there.
- Do not retype the wordmark or tagline in a live font; always use the supplied artwork.
- Do not use the old tagline "SOUND & LIGHT | MIHIR | EVENTS". The tagline is
  **SOUND & LIGHT | EVENT | PRODUCTION**.
- Do not separate the swash from the monogram or wordmark.

## Colours

| Name | Hex | Role |
| --- | --- | --- |
| Gold | `#D4AF37` | Primary brand colour - logo, accents, rules |
| Black | `#000000` | Primary background |
| Charcoal | `#1A1A1A` | Secondary dark surface, cards, panels |
| White | `#F5F5F5` | Light background, inverse logo |
| Gold Light | `#F6E27A` | Highlights, calls to action on dark |
| Gold Deep | `#8E6A14` | Shadow tone of the gradient, gold on light |
| Navy | `#0B1A3A` | Alternative dark background |
| Grey | `#3A3A3A` | Neutral background for the white logo |

Gold gradient (vertical, top to bottom): `#F9E9A0 → #E4C160 → #F3D77B → #C9A23A → #8E6A14`.
Tokens are in `13-brand-colours-typography/colours.json` and `colours.css`
(`--brand-gold`, `--brand-black`, ..., `--brand-gold-gradient`).

## Typography

| Face | Use |
| --- | --- |
| Custom calligraphic lettering (traced vector, `scripts/brand/traced/*.json`) | Wordmark and monogram - always use the supplied SVG/PNG, never retype "MIHIR" in a font |
| Montserrat SemiBold (600) | Tagline, labels, spaced-caps lines (letter-spacing ~9 %) |
| Cinzel (400 / 700) | Guide headings and secondary labels |
| Playfair Display (400 / 700 / italics) | Editorial and body display copy |

All fonts are Google Fonts under the SIL Open Font License 1.1 - see
`13-brand-colours-typography/fonts/` (TTFs, `fonts-README.md`, `OFL-LICENSE.txt`).

## Site export

`npm run brand:site` (or `node scripts/brand/export-site.mjs`) regenerates the files the website uses
from the kit masters: `public/logo.png`, `logo-mark.png`, `logo-mark-black.png`, `wordmark.svg`,
`logo-horizontal.svg/.png`, `logo-primary.png`, `favicon.svg`, `apple-touch-icon.png`, `icon-192/512.png`,
`app/favicon.ico` and the static share cards `app/opengraph-image.png` / `app/twitter-image.png`.
Run it after every `brand:build`.

## Source artwork and tracing

`_source/` holds the original reference images supplied by MIHIR. The monogram and wordmark are
traced from the primary-logo panel of the board into vector paths with:

```
node scripts/brand/trace.mjs "assets/brand/_source/reference-board.jpeg" monogram --crop 130,44,290,163 --mask "195,150,95,13" --threshold 0.30 --blur 1.2 --upscale 3300
node scripts/brand/trace.mjs "assets/brand/_source/reference-board.jpeg" wordmark --crop 90,186,350,124 --mask "0,0,255,22" --threshold 0.30 --blur 1.2 --upscale 3500
```

The results live in `scripts/brand/traced/monogram.json` and `wordmark.json`; `core.mjs` picks them up
automatically and every lockup, variation and the board are composed from those two paths. Re-run
the trace with a sharper source (or a supplied vector) and rebuild to upgrade the whole kit at once.

## Rebuilding the kit

Requires Node 24 (`sharp` and `opentype.js` are project dependencies).

```
node scripts/brand/build-all.mjs
```

Individual parts: `build-festival.mjs` (folder 11), `build-guide.mjs` (folder 13),
`build-board.mjs` (board). The design core - marks, lockups, colours, gradient - lives in
`scripts/brand/core.mjs`; change it there and rebuild so every asset stays in sync.
