---
name: Mihir Sound & Light
description: Console glow on black glass; one gold, engineered and premium.
colors:
  stage-gold: "#d4af37"
  gold-soft: "#f6e27a"
  stage-black: "#07090d"
  stage-2: "#0d1118"
  charcoal: "#0b0c10"
  panel: "#111827"
  panel-soft: "#171f2d"
  ink: "#f8fafc"
  muted: "#a6b0c3"
  hairline: "rgb(255 255 255 / 0.10)"
  hairline-strong: "rgb(255 255 255 / 0.12)"
  cyan-status: "#4de5ff"
  pink-alert: "#ff4ecd"
typography:
  display:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 1.5rem + 5.5vw, 5rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.05em"
    textTransform: "uppercase"
  headline:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.5rem + 2vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 0.92
    letterSpacing: "-0.05em"
    textTransform: "uppercase"
  title:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  ui:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  caption:
    fontFamily: "Space Grotesk, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.33
    letterSpacing: "normal"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.22em"
    textTransform: "uppercase"
rounded:
  control: "0.75rem"
  card: "1rem"
  card-lg: "1.5rem"
  panel: "2rem"
  sheet: "2.25rem"
  pill: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1.25rem"
  lg: "2rem"
  xl: "3rem"
  section: "6rem"
  section-lg: "8rem"
components:
  button-primary:
    backgroundColor: "{colors.stage-gold}"
    textColor: "{colors.charcoal}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 1.75rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.gold-soft}"
    textColor: "{colors.charcoal}"
  button-glass:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 1.75rem"
    height: "3rem"
  chip:
    backgroundColor: "{colors.stage-black}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.375rem 0.75rem"
  chip-selected:
    backgroundColor: "{colors.stage-gold}"
    textColor: "{colors.charcoal}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.375rem 0.75rem"
  input:
    backgroundColor: "{colors.stage-black}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1rem"
  card-glass:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card-lg}"
    padding: "1.25rem"
  nav-pill:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.5rem 0.75rem"
---

# Design System: Mihir Sound & Light

## Overview

**Creative North Star: "The FOH Desk at Night"**

The site is the front-of-house position after the house lights drop: a black room, black glass, and the warm glow of a console. Everything sits on a near-black charcoal ground (`stage-black`), surfaces are frosted panels that let the stage bleed through, and a single metal, Stage Gold, does every job an accent can do: the primary button, the lit indicator on a selected chip, a quantity readout, a star. The 3D rig in the hero is the show itself; the interface is the crew around it, precise and unhurried.

The personality is **engineered and premium**. Engineered means every element could be signed off by the rigger who reads the load plan: type is set like case labels (uppercase, tight), numbers sit in mono, facts appear in rows and hairline-divided lists rather than in equal cards. Premium means restraint: large type with room around it, hairlines instead of boxes, one gold instead of a palette, motion that is slow and physical (a spring-damped sheet, a turntable rig, a 700 ms exponential ease) rather than fast and busy. It is dark by use scene, not by category: the visitor is planning a night show and the FOH desk is where that night is run.

Confirmed rejections: template hero-metric blocks, per-word blur-stagger headlines, kicker labels above section headings, gradient text, stock people presented as crew, and any interaction that fights the phone's own scrolling.

**Key Characteristics:**
- One accent, Stage Gold, used where a beam would land; never as a wash.
- Charcoal ground with frosted glass panels for anything interactive.
- Uppercase Space Grotesk display at -0.05em tracking; JetBrains Mono for labels and readouts.
- Hairline dividers (1px, white at 10%) do the structural work that borders and cards do elsewhere.
- Motion is one authored moment per surface, exponential ease-out, physical springs for sheets and gestures.
- Live 3D as backdrop and configurator, always inert to touch.

## Colors

A black-glass palette with a single warm metal; everything cool in it is a status light, not a brand colour.

### Primary
- **Stage Gold** (`stage-gold`, #d4af37): the only brand accent. Primary buttons, selected chips, the mono quantity readouts in the gear list, review stars, the deck edge in the 3D scenes, hover colour for links and icon rings. It reads as the beam colour of the fixtures the company owns.
- **Gold Soft** (`gold-soft`, #f6e27a): primary button hover, and the "moderate demand" availability note. Never used as a fill on its own.

### Secondary
- **Cyan Status** (`cyan-status`, #4de5ff): the cool secondary light. The second stage light in the 3D scenes and the "date looks open" availability note. It is a status colour, not a second brand accent; it never appears on a button or heading.

### Tertiary
- **Pink Alert** (`pink-alert`, #ff4ecd): the "high demand" availability warning only.

### Neutral
- **Stage Black** (`stage-black`, #07090d): the page ground and the fill behind inputs and chips (at 60 to 70% over glass).
- **Stage 2** (`stage-2`, #0d1118): the footer ground (at 60%) and the well behind the estimator's 3D preview.
- **Charcoal** (`charcoal`, #0b0c10): `body` background, text on gold, the review marquee's fade.
- **Panel / Panel Soft** (`panel` #111827, `panel-soft` #171f2d): the glass gradient stops and the tinted band behind the gear section (`panel` at 30%).
- **Ink** (`ink`, #f8fafc): headings and primary text. Body copy sits at 80 to 90% ink; secondary copy uses Muted.
- **Muted** (`muted`, #a6b0c3): leads, captions, labels at rest, footer text, placeholders (at 60%).
- **Hairline** (`hairline`, white at 10%; `hairline-strong`, white at 12% on controls): every divider, section border and card outline. The 15% and 30% steps appear only on hover.

### Named Rules
**The One Beam Rule.** Stage Gold is a source, not a wash. It appears as a solid pill, a hairline turning gold on hover, a lit indicator, a mono readout or a star; it never tints a background above 10% (`gold/10` on a selected package card is the ceiling) and never appears in gradient text.

**The Status Light Rule.** Cyan and pink exist to report state (availability, the second stage light). If a colour is not reporting something, it is gold or a neutral.

**The Hairline Rule.** Structure is drawn with 1px lines at white/10, not with filled boxes. A border stronger than 12% is a hover or selected state, not a resting one.

## Typography

**Display Font:** Space Grotesk (with ui-sans-serif, system-ui)
**Body Font:** Space Grotesk (with ui-sans-serif, system-ui)
**Label/Mono Font:** JetBrains Mono (with ui-monospace)

**Character:** One geometric grotesk carries both voices: shouted in uppercase, tight and heavy for headings, and calm at regular weight for copy. The mono face is the console readout: tiny, tracked wide, uppercase, reserved for labels, quantities and prices in tables.

### Hierarchy
- **Display** (700, clamp(2.75rem, 1.5rem + 5.5vw, 5rem), 0.92, -0.05em, uppercase): the hero headline only, balanced (`text-wrap: balance`).
- **Headline** (700, 2.25rem → 3rem → 3.75rem across sm/lg, 0.92, -0.05em, uppercase): every section heading. Constrained to 14 to 16ch so it wraps into two or three heavy lines instead of one long one.
- **Title** (600, 1.125rem to 1.5rem, 1.3, -0.02em): row titles in the services accordion, gear group names, work-card titles, FAQ questions, step titles at 1.5rem to 1.875rem uppercase in the display face.
- **Body** (400, 1rem to 1.125rem, 1.625): copy at 80 to 90% ink; leads at Muted. Measure capped between 40ch (step bodies) and 60ch (leads). Review quotes sit here too.
- **UI** (600, 0.875rem): button labels, inline links, table and list values — anything inside a control or a dense row.
- **Caption** (400, 0.75rem): photo credits, availability notes, package names, footnotes under a figure.
- **Label** (400, 10px, 1.5, 0.22em, uppercase, JetBrains Mono): the `eyebrow` utility. Form field labels, nav items, footer column heads, the estimator's readout captions and preview chips. Mono also sets quantities in the gear list (`xs`, gold) and prices in tables.

### Named Rules
**The Case Label Rule.** Headings are uppercase, 700, and tracked to -0.05em; nothing else on the page is uppercase except mono labels. Emphasis inside copy comes from ink versus muted, never from weight changes or colour.

**The Heading Speaks Rule.** Section headings stand alone. No kicker or eyebrow above them; the mono label is a form and chrome device, not a heading ornament. (Incumbent drift: `SectionHeading`'s `eyebrow` prop and the estimator section still carry one; retire on next touch.)

**The Readout Rule.** Any number that is a fact (a quantity, a price in a table, a rating) is set in JetBrains Mono or in the display face with `tabular-nums`; prices that animate use the display face at 700, -0.04em.

**The Five Steps Rule.** Type sizes come from the five roles above (10 / 12 / 14 / 16 / 18px and the two display clamps). A literal `text-[13px]` is drift: pick the nearest step, or add a step here on purpose.

## Layout

A single centred container (`max-w-7xl`, 80rem) with 1rem gutters on phones, 1.5rem from 640px and 2rem from 1024px. Sections stack with 6rem vertical padding (8rem from 640px), separated by a hairline top or bottom border when they change ground tone; the estimator section runs a step larger (7rem / 9rem). Inside a section, the heading block comes first at a constrained measure, then a 3rem to 3.5rem gap, then the content.

Content grids are asymmetric by default: a 12-column split with the heading on 7 to 8 columns and the action on 4 (closing CTA, about), a `22rem | 1fr` split for a short intro beside a dense list (gear), a 2×2 of plain text blocks separated by space (how it works, FAQ), and a featured-plus-three work grid where the first card spans two columns and two rows. Rows in lists are hairline-divided (`divide-y` or per-item `border-t`) rather than boxed.

The hero is the one full-bleed surface: `min-height: 100svh`, 3D canvas behind, a bottom-up scrim on phones with copy anchored to the bottom (padded by the home-indicator inset), a left-to-right scrim on desktop with copy on the left third and the rig on the right two thirds.

Breakpoints in use: 640px (`sm`, most changes), 768px (`md`, two-column lists), 1024px (`lg`, split layouts, desktop nav), 1280px (`xl`, rare). Phone first: every layout is designed at 375px and widened, never the reverse. Fixed chrome (nav pill, floating WhatsApp) is padded by `env(safe-area-inset-*)`.

## Elevation & Depth

Depth is a hybrid of tonal layering and frosted glass, and by decision (2026-09-21) glass is the default surface for anything that is a card, panel or control cluster, not just the tools. The page ground is Stage Black; a glass surface sits on it as a slightly lighter, translucent panel (gradient from `panel` at 86% to `stage-2` at 78%, 14px backdrop blur, 1px white/9 outline) carrying one soft ambient shadow. Nothing is lifted with hard shadows, and nothing casts a coloured halo except the primary button's glow.

### Shadow Vocabulary
- **Panel ambient** (`box-shadow: 0 22px 60px rgb(2 6 23 / 0.45), inset 0 1px 0 rgb(255 255 255 / 0.05)`): every glass surface. The inset hairline is the light catching the top edge.
- **Sheet ambient** (`box-shadow: 0 30px 80px rgb(0 0 0 / 0.5), inset 0 1px 0 rgb(255 255 255 / 0.18), inset 0 -1px 0 rgb(255 255 255 / 0.04)`): the estimator sheet (`glass-specular`), which also carries an 18px blur, 140% saturation and a moving 1px sheen along its top edge.
- **Floating control** (`box-shadow: 0 12px 40px rgb(0 0 0 / 0.45)`): the fixed WhatsApp button.
- **Gold glow** (`box-shadow: 0 0 32px rgb(212 175 55 / 0.35)`): primary CTA only, as part of the tactile treatment; never on cards or text. It is Stage Gold's own light, not a warmer orange standing in for it.

### Named Rules
**The Glass Is a Surface Rule.** Glass is used for what the visitor touches or reads as a unit: cards, panels, the nav pill, the sheet. It is not decoration on a heading or an image. (Incumbent drift: review cards, package cards and the readout well are plain `panel/40` or `stage/60` fills with a hairline; migrate them to the glass utility on next touch.)

**The One Glow Rule.** The only coloured shadow on the page is the gold glow under a primary button. Depth elsewhere is black and soft.

## Shapes

Two silhouettes: the pill and the softened slab. Anything that is a single action or a single label is a full pill (`rounded-full`): buttons, chips, the nav bar, icon buttons, the drag handle. Anything that holds content is a slab with a generous radius that scales with the surface: controls and small cards at 0.75rem, review cards at 1rem, work-card images and about-photo frames at 1.5rem, the estimator panels at 2rem, the bottom sheet at 2.25rem (top corners only). The `GlassCard` double bezel keeps concentric radii (outer 1.75rem, inner 1.375rem with 0.375rem padding). Borders are 1px hairlines; there are no thick or coloured edges except a gold hairline on a selected control. Images are clipped by their frames (`overflow: hidden`) and scale 3% on hover over 700 ms.

## Components

Controls are **tactile and confident**: a visible 0.97 press, a 2px hover lift on primary actions, a gold glow under the primary button, and springs (stiffness 400, damping 22) rather than linear transitions.

### Buttons
- **Shape:** full pill (9999px), 3rem minimum height, 1.75rem horizontal padding; gap 0.75rem to a 1rem icon.
- **Voice:** sentence case, Space Grotesk 600 at 0.875rem. "Call us now", "WhatsApp", "Estimate with this system". Mono uppercase belongs to labels and chips, never to a button.
- **Primary:** Stage Gold fill, Charcoal text, gold glow. Hover: `brightness(1.05)`, translateY(-2px) on a spring. Press: scale 0.97. One per surface.
- **Glass:** the glass surface as a pill (panel gradient, 1px white/9, panel ambient shadow), Ink text; hover raises the outline to white/25.
- **Ghost / Icon:** 1px white/12 outline on white/5, Muted or Ink glyph, 2.75rem square for icon buttons (close, menu, footer socials); hover turns the outline and glyph gold.
- **Disabled:** white/8 fill, Muted text, `cursor: not-allowed`, no glow; the label says what is missing ("Fill the required fields to send").
- **Focus:** a 2px Stage Gold ring at 2px offset, set globally on buttons, links and radios in `globals.css`. Fields override it with their own bloom.

### Chips (segmented options)
- **Style:** mono label (0.75rem, 0.14em) in a 2.75rem-tall pill, 1px white/12 outline on Stage Black at 70% with backdrop blur, Ink at 80%.
- **Selected:** Stage Gold fill (or the show format's accent in the estimator), Charcoal text, no outline. Selection changes on a spring; an `AnimatePresence` swap slides the label 6px.

### Cards / Containers
- **Corner Style:** 1rem for review cards, 1.5rem for image frames, 2rem for panels.
- **Background:** the glass surface (rule); Stage Black at 60% for a well inside a glass panel (the estimator readout).
- **Shadow Strategy:** panel ambient on glass; none on wells or image frames.
- **Border:** 1px white/10 (white/8 on 2rem panels).
- **Internal Padding:** 1.25rem on cards, 1.5rem to 2rem on panels.
- **Selected card (package radio):** 1px Stage Gold outline on gold/10, price in gold; unselected white/12 on white/5, hover white/30.

### Inputs / Fields
- **Style:** 0.75rem radius, 1px white/12 outline, Stage Black at 70%, 0.75rem × 1rem padding, Ink text at 0.875rem (1rem on phones so iOS never zooms), Muted placeholder at 60%. Label above in the mono label style, Muted, 0.5rem gap.
- **Focus:** outline shifts to gold/60 and a 4px gold/10 ring blooms around the field.
- **Error / Disabled:** no dedicated error style exists (incumbent gap); validation is expressed by the disabled submit button's label. Availability notes under the date field use the status colours at 11px.

### Navigation
- **Style:** a detached island pill, full width to `max-w-7xl`, 0.5rem × 0.75rem padding, transparent at the top of the page and becoming the glass surface after 24px of scroll (500 ms, stage ease). Logo mark 2.75rem at left, wordmark from 640px.
- **Items:** mono label, Ink at 75%, hover Ink, active `bg-white/8` and Stage Gold text in a small pill.
- **Mobile:** a 2.75rem hamburger disc (white/5 on white/12) whose two hairlines rotate into an X; the menu is a full-screen sheet on `stage/92` with a 2xl blur, items in the display face at 3rem uppercase, entering with a 60 ms stagger.
- **Floating actions:** a column of two 3.25rem discs, fixed bottom-right above the safe-area inset, phones and tablets only — WhatsApp on the glass surface, then the call in Stage Gold closest to the thumb, mirroring the hero pair. They spring in (0.9 → 1, 40ms apart) only once the first viewport has scrolled past, so they never cover the surface's own buttons.

### Estimator Sheet (signature)
A bottom sheet (`glass-specular`, top corners 2.25rem, `max-height: 94dvh`) that slides up on a spring (stiffness 190, damping 26) over a `charcoal/70` blurred scrim, with a 3.5rem × 0.375rem drag handle at white/20. Drag past 140px or flick faster than 800px/s to dismiss; Escape closes. Inside, the 3D rig preview (2rem well on Stage 2) sits beside a glass control panel of segmented chips, an animated price range in the display face, mono captions and the primary WhatsApp button.

### Live 3D (signature)
Two React Three Fiber scenes, the hero rig and the estimator rig, on a `#0b0d12` clear colour with a Stage Gold key light and a cyan secondary. On mice: slow auto-orbit with drag-to-look. On touch: no controls and `pointer-events: none`; a turntable camera orbits on its own so the canvas is a moving picture the page scrolls past. Devices without WebGL, with data-saver or reduced motion get the CSS `StagePoster` (angled gold and cyan beam gradients over a faint 36px grid).

### Disclosure (services list)
Rows expand by collapsing a grid row (`grid-template-rows: 0fr → 1fr`, 300ms stage ease) rather than animating height, so the browser never animates a layout property and an interrupted toggle retargets instead of restarting. The panel's copy stays in the HTML at all times — every specification is crawlable — and `inert` keeps the collapsed rows out of the tab order and the accessibility tree.

### Motion vocabulary
- **Stage ease** `cubic-bezier(0.32, 0.72, 0, 1)`: hover colour, nav transforms, image scale, disclosure, scroll reveals (700ms fade and 28px rise; transform and opacity only, no filter).
- **Strong ease-out** `cubic-bezier(0.23, 1, 0.32, 1)`: the hero entrance (`animate-enter`, 700 ms, 16px rise, 100 ms stagger between headline, sentence and actions), pure CSS so it runs before hydration.
- **Springs:** controls 400/22, sheet 190/26, tilt cards 160/18, animated numbers 60 to 90 stiffness. Marquees are linear (40 to 65 s), pause on hover.
- **Reduced motion:** posters instead of canvases, fades instead of rises, no loops, static cards.

## Do's and Don'ts

### Do:
- **Do** set every section heading in the display face: uppercase, 700, -0.05em, 0.92 line height, capped at 14 to 16ch.
- **Do** draw structure with 1px white/10 hairlines and space; group tightly, separate generously, more space above a heading than below.
- **Do** put content that the visitor reads or touches as a unit on the glass surface (panel gradient, 14px blur, panel ambient shadow).
- **Do** give every control a press (scale 0.97), a hover on a spring, and a 2px Stage Gold focus ring at 2px offset.
- **Do** keep numbers that are facts in JetBrains Mono or tabular display figures, and animate a price when it changes.
- **Do** write primary actions in sentence case in Space Grotesk 600 ("Get an estimate"), and keep mono uppercase for labels.
- **Do** keep 3D canvases inert to touch (`pointer-events: none`, turntable camera) and provide the CSS poster fallback.
- **Do** pad fixed chrome and bottom-anchored copy by `env(safe-area-inset-*)`, keep inputs at 16px on phones, and use `100svh` for the hero.

### Don't:
- **Don't** use a second accent. Cyan and pink report status only; the `amber`, `violet` and `electric` tokens have been removed and must not come back.
- **Don't** wash gold over an area: no gold backgrounds above 10% opacity, no gradient text, no gold glow except under the primary button.
- **Don't** put a kicker or mono eyebrow above a heading, or a "big number, small label" metric block as a section's structure.
- **Don't** animate a headline per word or per character, and don't animate a filter or a layout property (`height`, `width`, `top`) to reveal something; one authored entrance per surface, on transform and opacity.
- **Don't** mount OrbitControls or any pointer handler on a canvas that the page scrolls past on a phone.
- **Don't** use same-size icon-heading-text cards as a page structure, or nest cards inside cards.
- **Don't** present stock photography as the company's own work; credit it on the card or use the poster.
- **Don't** ship a hover state that is not gated by `(hover: hover)` (Tailwind v4 does this for you; hand-written CSS must too).
