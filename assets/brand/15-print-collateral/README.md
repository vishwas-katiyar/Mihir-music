# MIHIR print collateral

Print-ready templates built from the brand kit. Every piece uses the traced MIHIR
monogram and wordmark, the brand gold and the corrected tagline
"SOUND & LIGHT | EVENT | PRODUCTION". `contact-sheet.png` shows every piece at a glance.

## What's here

| Folder | Piece | Finished size |
|---|---|---|
| `business-card/` | Front and back | 90 x 54mm (India standard), 3mm bleed |
| `letterhead/` | A4 header/footer template | 210 x 297mm, no bleed |
| `rate-card/` | Front (hero) and back (packages) | A5, 148 x 210mm, 3mm bleed |
| `large-format/` | Roll-up standee | 850 x 2000mm, no bleed, 150 DPI |
| `large-format/` | Stage/photo backdrop | 6 x 3 ft (1828.8 x 914.4mm), no bleed, 150 DPI |

Each piece ships as:
- an **SVG master** (true-to-size in millimetres — open in Illustrator, Inkscape, CorelDRAW or Canva)
- a **PNG proof** at print resolution (300 DPI for the card, letterhead and rate card; 150 DPI for the two large-format pieces, which are viewed from a distance)
- a **`-guides` version** (business card and rate card only) with the bleed line (red), trim line (gold dash) and safe area (grey dash) drawn on top, for checking layout before sending to press — never send the `-guides` file to a printer

## Handing files to a printer

- Give the printer the plain file (no `-guides` suffix).
- These files are sRGB, screen-accurate proofs. Most local presses convert to CMYK at
  the RIP; if your printer asks for CMYK specifically, open the SVG in Illustrator or
  CorelDRAW and let it convert, or ask the printer to convert from the SVG - converting
  from the PNG loses quality, converting from the SVG does not.
- Business card and rate card already include bleed; hand them over as is; a small
  local press will usually just say "3mm bleed, trim to size" and it is baked in.
- The letterhead has no bleed by design (office printers cut nothing).
- The standee and backdrop are rendered at 150 DPI, which is standard for large-format
  print viewed from a couple of metres away; do not try to print them at close-reading
  resolution, the file sizes would be enormous for no visible gain.

## Editing the copy

- **Business card**: name, title, phone, email, address in `scripts/brand/build-print-card.mjs` (`BUSINESS` object lives in `scripts/brand/print-core.mjs`, shared by every piece).
- **Rate card packages**: `PACKAGES` array in `scripts/brand/build-print-ratecard.mjs`. This mirrors `lib/packages.ts` (the site's estimator data) — update both if pricing changes, they are not linked automatically.
- **Standee headline and services**: `scripts/brand/build-print-standee.mjs`.
- **Letterhead footer line**: `scripts/brand/build-print-letterhead.mjs`.

After editing, rebuild everything with:

```
node scripts/brand/build-all.mjs
```

or just the print pieces:

```
node scripts/brand/build-print-card.mjs
node scripts/brand/build-print-letterhead.mjs
node scripts/brand/build-print-ratecard.mjs
node scripts/brand/build-print-standee.mjs
node scripts/brand/build-print-sheet.mjs
```

## QR codes

The business card back and the standee carry a QR code that opens a WhatsApp chat
(`wa.me/917000051042` with a pre-filled message). Regenerated fresh from
`scripts/brand/print-core.mjs`'s `qr()` helper on every build — change the target URL
in `BUSINESS.whatsapp` in the same file if the number changes.

## Rules

- Never retype "MIHIR" in a font. The wordmark and monogram are custom traced
  lettering; every piece here pulls them from the shared kit.
- Keep the tagline exactly "SOUND & LIGHT | EVENT | PRODUCTION".
- Gold on black is the default. Don't recolour the marks outside the palette in
  `../13-brand-colours-typography/colours.json`.
