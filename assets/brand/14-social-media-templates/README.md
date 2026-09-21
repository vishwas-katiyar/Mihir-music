# MIHIR social media templates

Ready-to-post designs built from the brand kit. Every file uses the traced MIHIR monogram and
wordmark, the brand gold and the corrected tagline "SOUND & LIGHT | EVENT | PRODUCTION".
`contact-sheet.png` shows every template at a glance.

## Folders and sizes

| Folder | Size | Use |
|---|---|---|
| `feed-square/` | 1080 x 1080 | Instagram and Facebook feed posts (1:1) |
| `feed-portrait/` | 1080 x 1350 | Instagram feed posts in portrait (4:5), takes more screen in the feed |
| `story/` | 1080 x 1920 | Instagram and WhatsApp stories, reel covers, status updates |
| `covers/` | various | `facebook-cover-1640x924`, `linkedin-cover-1584x396`, `youtube-banner-2560x1440`, `link-post-1200x630` |

Every template ships as a `.png` (post it as is) and a `.svg` master (open in Illustrator, Figma or
Inkscape to change the words).

## Templates

Feed (same eight designs in square and portrait):

| File | Purpose |
|---|---|
| `01-brand-statement` | Logo hero with one call to action. Profile launch, pinned post, "who we are" |
| `02-services-overview` | Bullet list of the five services. Monthly reminder post |
| `03-photo-post` | Your event photo on top, headline and service chips below. Use the `-overlay` file with a real photo |
| `04-event-announcement` | Event name, date, venue, time. Change the copy per show |
| `05-testimonial` | Client quote with five stars. Rotate real client feedback |
| `06-booking-cta` | Phone number large. Season openers, festive booking pushes |
| `07-gear-spotlight` | One piece of gear with four specs and a photo slot |
| `08-festive-greeting` | Diwali greeting. Change the headline for Holi, Navratri, New Year |

Stories: `01-brand-statement-story`, `02-photo-story` (+ overlay), `03-event-tonight-story`,
`04-booking-story`, `05-testimonial-story`, `06-countdown-story`.

## Using the overlay files with your own photos

The `-overlay.png` files are transparent frames. The dark area at the bottom, the logo, the text and
the footer are baked in; the photo area is fully transparent.

1. In Canva, Instagram, CapCut or any editor, place your event photo as the bottom layer and crop it
   to the same size (1080 x 1080, 1080 x 1350 or 1080 x 1920).
2. Add the matching `-overlay.png` as a layer above the photo.
3. Export. The gradient at the bottom of the frame keeps the headline readable over any photo.

## Story safe areas

Instagram draws its own controls over the top 250 px and bottom 300 px of a story. All essential
content in the story templates sits inside the middle band; keep it that way when editing.

## Rules

- Never retype "MIHIR" in a font. The wordmark and monogram are custom lettering; use the files
  from `../04-icon-mark`, `../05-wordmark` or the lockups in `../01`, `../02`, `../03`.
- Keep the tagline exactly "SOUND & LIGHT | EVENT | PRODUCTION".
- Gold on black is the default. Do not recolour the marks outside the palette in
  `../13-brand-colours-typography/colours.json`.
- Headlines in Cinzel or Playfair Display, body copy in Montserrat. All fonts are in
  `../13-brand-colours-typography/fonts/`.

## Changing the sample copy

The words in every template live in `scripts/brand/build-social-feed.mjs` (feed) and
`scripts/brand/build-social-story.mjs` (stories and covers). Edit the strings there and run:

```
node scripts/brand/build-all.mjs
```

That regenerates the whole kit, these templates and the contact sheet in about two minutes.
