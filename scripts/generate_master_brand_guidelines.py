import json
import re
import hashlib
from datetime import datetime, timezone
from pathlib import Path
from collections import Counter, defaultdict
from colorsys import rgb_to_hls

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Image,
    Table,
    TableStyle,
    PageBreak,
)

ROOT = Path('/home/runner/work/Mihir-music/Mihir-music')
ASSETS = ROOT / 'assets' / 'brand'
OUT = ROOT / 'MASTER_BRAND_CREATIVE_GUIDELINES.pdf'


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding='utf-8', errors='ignore')
    except Exception:
        return ''


def parse_svg_size(path: Path):
    text = read_text(path)
    vb = re.search(r'viewBox="([^"]+)"', text)
    if vb:
        vals = vb.group(1).replace(',', ' ').split()
        if len(vals) == 4:
            try:
                return float(vals[2]), float(vals[3])
            except ValueError:
                pass
    wm = re.search(r'width="([0-9.]+)', text)
    hm = re.search(r'height="([0-9.]+)', text)
    if wm and hm:
        try:
            return float(wm.group(1)), float(hm.group(1))
        except ValueError:
            return None
    return None


def parse_png_size(path: Path):
    with path.open('rb') as f:
        b = f.read(24)
    if b[:8] != b'\x89PNG\r\n\x1a\n':
        return None
    w = int.from_bytes(b[16:20], 'big')
    h = int.from_bytes(b[20:24], 'big')
    return w, h


def parse_jpg_size(path: Path):
    data = path.read_bytes()
    i = 0
    while i < len(data) - 9:
        if data[i] == 0xFF and data[i + 1] in [0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF]:
            h = int.from_bytes(data[i + 5:i + 7], 'big')
            w = int.from_bytes(data[i + 7:i + 9], 'big')
            return w, h
        if data[i] == 0xFF and data[i + 1] not in (0x00, 0xD8, 0xD9):
            seg = int.from_bytes(data[i + 2:i + 4], 'big')
            i += seg + 2
        else:
            i += 1
    return None


def get_dims(path: Path):
    s = path.suffix.lower()
    if s == '.png':
        return parse_png_size(path)
    if s in ('.jpg', '.jpeg'):
        return parse_jpg_size(path)
    if s == '.svg':
        return parse_svg_size(path)
    return None


def hex_to_rgb(hex_color: str):
    hex_color = hex_color.strip('#')
    return tuple(int(hex_color[i:i + 2], 16) for i in (0, 2, 4))


def rgb_to_cmyk(r, g, b):
    if (r, g, b) == (0, 0, 0):
        return 0, 0, 0, 100
    c = 1 - r / 255
    m = 1 - g / 255
    y = 1 - b / 255
    k = min(c, m, y)
    c = (c - k) / (1 - k)
    m = (m - k) / (1 - k)
    y = (y - k) / (1 - k)
    return round(c * 100), round(m * 100), round(y * 100), round(k * 100)


def rgb_to_hsl_str(r, g, b):
    h, l, s = rgb_to_hls(r / 255, g / 255, b / 255)
    return f"{round(h * 360)}°, {round(s * 100)}%, {round(l * 100)}%"


def hash_file(path: Path):
    h = hashlib.sha256()
    with path.open('rb') as f:
        for chunk in iter(lambda: f.read(65536), b''):
            h.update(chunk)
    return h.hexdigest()


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(colors.HexColor('#666666'))
    canvas.drawString(18 * mm, 10 * mm, 'MASTER BRAND & CREATIVE GUIDELINES | MIHIR')
    canvas.drawRightString(A4[0] - 18 * mm, 10 * mm, f'Page {canvas.getPageNumber()}')
    canvas.restoreState()


def p(text, style):
    return Paragraph(text, style)


def add_img(story, path: Path, caption: str, max_w=170 * mm, max_h=95 * mm):
    if not path.exists():
        story.append(p(f"<i>Preview not available:</i> {path.name}", styles['BodyText']))
        return
    try:
        img = Image(str(path))
        iw, ih = img.imageWidth, img.imageHeight
        scale = min(max_w / iw, max_h / ih)
        img.drawWidth = iw * scale
        img.drawHeight = ih * scale
        story.append(img)
        story.append(p(f"<font size=8 color='#666666'>{caption}</font>", styles['BodyText']))
        story.append(Spacer(1, 3 * mm))
    except Exception:
        story.append(p(f"<i>Preview could not be rendered:</i> {path.name}", styles['BodyText']))


files = sorted([f for f in ASSETS.rglob('*') if f.is_file()])
ext_counts = Counter(f.suffix.lower() for f in files)
folder_counts = Counter(str(f.relative_to(ASSETS)).split('/')[0] for f in files)

dims = {str(f.relative_to(ASSETS)): get_dims(f) for f in files}

hash_map = defaultdict(list)
for f in files:
    hash_map[hash_file(f)].append(f)
exact_duplicates = [v for v in hash_map.values() if len(v) > 1]

colours_json = json.loads(read_text(ASSETS / '13-brand-colours-typography' / 'colours.json'))
palette = colours_json.get('palette', [])

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='H1', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=18, textColor=colors.HexColor('#111111'), spaceAfter=8))
styles.add(ParagraphStyle(name='H2', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=14, textColor=colors.HexColor('#1f1f1f'), spaceBefore=8, spaceAfter=4))
styles.add(ParagraphStyle(name='Small', parent=styles['BodyText'], fontSize=8, leading=10, textColor=colors.HexColor('#333333')))
styles['BodyText'].fontSize = 10
styles['BodyText'].leading = 14

story = []

# 1. Cover
story.append(Spacer(1, 20 * mm))
story.append(p("MIHIR", styles['H1']))
story.append(p("SOUND & LIGHT | EVENT | PRODUCTION", styles['H2']))
story.append(Spacer(1, 5 * mm))
story.append(p("MASTER BRAND & CREATIVE GUIDELINES", ParagraphStyle('cover', parent=styles['Title'], fontSize=22, leading=28, textColor=colors.HexColor('#111111'))))
story.append(Spacer(1, 5 * mm))
story.append(p("Version: 1.0", styles['BodyText']))
story.append(p(f"Date: {datetime.now(timezone.utc).strftime('%Y-%m-%d')} UTC", styles['BodyText']))
story.append(p("Source: Project assets folder (`assets/brand`)", styles['BodyText']))
story.append(Spacer(1, 8 * mm))
add_img(story, ASSETS / '01-primary-logo' / 'primary-logo-gold-on-black.png', 'Primary logo preview | 01-primary-logo/primary-logo-gold-on-black.png', max_h=65 * mm)
story.append(PageBreak())

# TOC
story.append(p("Table of Contents", styles['H1']))
sections = [
    '1. Cover Page', '2. Brand Overview', '3. Brand Positioning & Communication', '4. Logo System',
    '5. Brand Colors', '6. Typography', '7. Imagery & Visual Style', '8. Design Language',
    '9. Existing Creative Library', '10. Products & Services', '11. Contact & Digital Presence',
    '12. Brand Asset Directory', '13. AI Image Generation Reference', '14. Occasion/Campaign Creative Guidance',
    '15. Ready-to-use AI Context', '16. AI Creative Prompt Template',
    '17. Files That Require Attention', '18. Source & Verification Notes',
]
for idx, s in enumerate(sections, 1):
    story.append(p(f"{idx}. {s}", styles['BodyText']))
story.append(PageBreak())

# 2
story.append(p("2. BRAND OVERVIEW", styles['H1']))
overview_points = [
    ("Business/Brand Name", "MIHIR"),
    ("Legal/Registered Name", "Not specified in provided assets."),
    ("Tagline", "SOUND & LIGHT | EVENT | PRODUCTION"),
    ("Business Category", "Sound & Light / Event Production"),
    ("Industry", "Events, live production, sound and lighting services (from asset documentation)."),
    ("Short Description", "Brand asset kit for an event production business in Indore."),
    ("Detailed Description", "Observed from README files: the brand provides sound, lighting, and event production services, supported by social templates, festival creatives, and print collateral."),
    ("Main Products/Services", "Sound & light support, event production, booking/CTA creatives, event announcements, gear highlights (observed from existing creative materials)."),
    ("Target Audience", "Not explicitly specified; requires verification."),
    ("Locations Served", "Indore is referenced; full service geography requires verification."),
    ("Physical Address", "Not specified in provided assets."),
    ("Website", "Not specified in provided assets."),
    ("Email", "Not specified in provided assets."),
    ("Phone", "Not explicitly listed as plain text in assets; WhatsApp destination provides one number."),
]
t = Table([[p('<b>Field</b>', styles['BodyText']), p('<b>Details</b>', styles['BodyText'])]] + [[p(a, styles['BodyText']), p(b, styles['BodyText'])] for a, b in overview_points], colWidths=[52 * mm, 128 * mm])
t.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EFEFEF')),
    ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
]))
story.append(t)
story.append(Spacer(1, 4 * mm))
add_img(story, ASSETS / 'board' / 'mihir-brand-board.png', 'Brand board | board/mihir-brand-board.png')

# 3
story.append(p("3. BRAND POSITIONING & COMMUNICATION", styles['H1']))
story.append(p("<b>Explicitly present in assets</b>", styles['H2']))
for line in [
    "Brand name and identity: MIHIR.",
    "Tagline fixed as: SOUND & LIGHT | EVENT | PRODUCTION.",
    "Default visual positioning: premium gold-on-black treatment.",
    "Use cases include events, social media creatives, festival campaigns, and print collateral.",
]:
    story.append(p(f"• {line}", styles['BodyText']))
story.append(p("<b>Observed from existing brand materials</b>", styles['H2']))
for line in [
    "Personality appears premium, formal, and performance-focused.",
    "Communication style appears concise with action-oriented booking/event language.",
    "Common messaging themes from template names: brand statement, services overview, event announcement, testimonials, booking CTA, gear spotlight, festive greetings.",
    "Customer-facing tone appears confident and service-led.",
]:
    story.append(p(f"• {line}", styles['BodyText']))
story.append(p("Any specific USP claims beyond the above are not explicitly stated and require verification.", styles['BodyText']))

# 4 Logo system
story.append(PageBreak())
story.append(p("4. LOGO SYSTEM", styles['H1']))
logo_rows = [[p('<b>Variation</b>', styles['BodyText']), p('<b>Representative file</b>', styles['BodyText']), p('<b>Type</b>', styles['BodyText']), p('<b>Recommended use (from asset docs)</b>', styles['BodyText']), p('<b>Dimensions*</b>', styles['BodyText'])]]
logo_map = [
    ('Primary logo', '01-primary-logo/primary-logo-gold-on-black.png', 'PNG', 'Default brand lockup for general use.'),
    ('Horizontal logo', '02-horizontal-logo/horizontal-logo-gold-on-black.png', 'PNG', 'Wide headers, website nav, banners.'),
    ('Stacked logo', '03-stacked-logo/stacked-logo-gold-on-black.png', 'PNG', 'Portrait/narrow spaces.'),
    ('Icon mark', '04-icon-mark/icon-mark-gold-on-black.png', 'PNG', 'Favicons, avatars, watermark, compact usage.'),
    ('Wordmark', '05-wordmark/wordmark-gold-on-black.png', 'PNG', 'Text-focused placement when monogram is nearby.'),
    ('Monochrome', '06-monochrome-logo/monochrome-logo-black-on-white.png', 'PNG', 'Single-colour print/engraving use.'),
    ('Inverse', '07-inverse-logo/inverse-logo-white-transparent.png', 'PNG', 'Dark/photo backgrounds.'),
    ('Badge emblem', '09-badge-emblem/badge-emblem-gold-on-black.png', 'PNG', 'Seals, stickers, crew wear.'),
    ('Responsive ladder', '10-responsive-logo/responsive-logo-sheet-gold-on-black.png', 'PNG', 'Size-based lockup switching.'),
]
for variation, rel, ftype, use in logo_map:
    d = dims.get(rel)
    ds = f"{int(d[0])}×{int(d[1])}" if d else 'Not specified'
    logo_rows.append([p(variation, styles['BodyText']), p(rel, styles['Small']), p(ftype, styles['BodyText']), p(use, styles['BodyText']), p(ds, styles['BodyText'])])
lt = Table(logo_rows, colWidths=[28 * mm, 58 * mm, 13 * mm, 61 * mm, 20 * mm])
lt.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EFEFEF')),
    ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
]))
story.append(lt)
story.append(p("*Dimensions shown for representative files; complete metadata available in source assets.", styles['Small']))
story.append(Spacer(1, 3 * mm))
for rel in [
    '01-primary-logo/primary-logo-gold-on-black.png',
    '02-horizontal-logo/horizontal-logo-gold-on-black.png',
    '03-stacked-logo/stacked-logo-gold-on-black.png',
    '04-icon-mark/icon-mark-gold-on-black.png',
]:
    add_img(story, ASSETS / rel, f"Preview | {rel}", max_h=45 * mm)

for line in [
    "Minimum sizes found in assets/brand/README.md: Icon 24px (8mm print), Wordmark 120px wide (30mm), Full logo 200px wide (50mm).",
    "Clear space rule: at least the height of the 'I' in MIHIR around the lockup.",
    "Official restrictions found: no stretch/skew/rotate, no unapproved recoloring/effects, no retyping mark/tagline.",
]:
    story.append(p(f"• {line}", styles['BodyText']))

# 5 colors
story.append(PageBreak())
story.append(p("5. BRAND COLORS", styles['H1']))
color_data = [[p('<b>Swatch</b>', styles['BodyText']), p('<b>Name</b>', styles['BodyText']), p('<b>HEX</b>', styles['BodyText']), p('<b>RGB</b>', styles['BodyText']), p('<b>CMYK</b>', styles['BodyText']), p('<b>HSL</b>', styles['BodyText']), p('<b>Tier</b>', styles['BodyText'])]]
for c in palette:
    r, g, b = hex_to_rgb(c['hex'])
    cmyk = rgb_to_cmyk(r, g, b)
    hsl = rgb_to_hsl_str(r, g, b)
    color_data.append(['', p(c['name'], styles['BodyText']), p(c['hex'], styles['BodyText']), p(f"{r}, {g}, {b}", styles['BodyText']), p(f"{cmyk[0]}, {cmyk[1]}, {cmyk[2]}, {cmyk[3]}", styles['BodyText']), p(hsl, styles['BodyText']), p(c.get('tier', 'Not specified'), styles['BodyText'])])
ct = Table(color_data, colWidths=[14 * mm, 30 * mm, 22 * mm, 28 * mm, 28 * mm, 28 * mm, 18 * mm])
style = [
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EFEFEF')),
    ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]
for i, c in enumerate(palette, start=1):
    style.append(('BACKGROUND', (0, i), (0, i), colors.HexColor(c['hex'])))
ct.setStyle(TableStyle(style))
story.append(ct)
story.append(Spacer(1, 2 * mm))
story.append(p("Pantone equivalents: Not specified in provided assets.", styles['BodyText']))
story.append(p("Gold gradient explicitly specified: #F9E9A0 → #E4C160 → #F3D77B → #C9A23A → #8E6A14.", styles['BodyText']))
add_img(story, ASSETS / '13-brand-colours-typography' / 'brand-colours-typography-card.png', 'Color/Typography reference card | 13-brand-colours-typography/brand-colours-typography-card.png')

# 6 typography
story.append(p("6. TYPOGRAPHY", styles['H1']))
font_dir = ASSETS / '13-brand-colours-typography' / 'fonts'
font_files = sorted([f.name for f in font_dir.glob('*.ttf')])
font_table = [[p('<b>Font Family</b>', styles['BodyText']), p('<b>Weights/Styles seen in assets</b>', styles['BodyText']), p('<b>Usage</b>', styles['BodyText'])],
              [p('Custom calligraphic lettering (traced vector)', styles['BodyText']), p('N/A (vector artwork)', styles['BodyText']), p('Wordmark and monogram; do not retype.', styles['BodyText'])],
              [p('Montserrat', styles['BodyText']), p('600, 700', styles['BodyText']), p('Tagline, labels, compact UI lines.', styles['BodyText'])],
              [p('Cinzel / Cinzel Decorative', styles['BodyText']), p('400, 700, 900', styles['BodyText']), p('Headings, decorative headings, brand-style display.', styles['BodyText'])],
              [p('Playfair Display', styles['BodyText']), p('400, 700, 700i, 900, 900i', styles['BodyText']), p('Editorial/body display and long-form styled copy.', styles['BodyText'])],]
ft = Table(font_table, colWidths=[46 * mm, 38 * mm, 96 * mm])
ft.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EFEFEF')),
    ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
]))
story.append(ft)
story.append(Spacer(1, 2 * mm))
story.append(p("Font files found:", styles['BodyText']))
story.append(p(", ".join(font_files), styles['Small']))
story.append(p("Heading/Subheading/Body/CTA typography examples are observed from templates; exact editable text is converted to vector paths in final SVG outputs.", styles['BodyText']))

# 7 imagery
story.append(PageBreak())
story.append(p("7. IMAGERY & VISUAL STYLE", styles['H1']))
for line in [
    "Observed from existing creative materials: dark, high-contrast backgrounds with gold highlights.",
    "Frequent premium gradient usage (gold gradient + deep black/charcoal base).",
    "Event and celebration motifs are used in festival creatives (Ganpati/Navratri variants).",
    "Composition generally preserves clear lower-third readability zones for headlines/CTA.",
    "Photo overlays are designed as transparent frames for user-provided event photography.",
    "Texture/pattern style is subtle and ornamental rather than heavy.",
]:
    story.append(p(f"• {line}", styles['BodyText']))
add_img(story, ASSETS / '11-festival-variation' / 'festival-ganpati-banner-16x9.png', 'Festival creative example | 11-festival-variation/festival-ganpati-banner-16x9.png')
add_img(story, ASSETS / '14-social-media-templates' / 'feed-square' / '03-photo-post-overlay.png', 'Overlay example for photo insertion | 14-social-media-templates/feed-square/03-photo-post-overlay.png', max_h=55*mm)

# 8 design language
story.append(p("8. DESIGN LANGUAGE", styles['H1']))
for line in [
    "Layout patterns: strong header/logo zones, center-focused message blocks, and consistent footer/contact strips.",
    "Logo placement: typically top or footer lockups with high contrast.",
    "Text hierarchy: short headline + supporting line + CTA/contact treatment.",
    "Spacing/margins: structured and modular (social templates provide fixed-ratio systems).",
    "Format system: feed-square (1:1), feed-portrait (4:5), story (9:16), plus cover/banner formats.",
    "Observed recurring creative types: event announcement, testimonial, booking CTA, service overview, festive greeting, gear spotlight.",
]:
    story.append(p(f"• {line}", styles['BodyText']))
add_img(story, ASSETS / '14-social-media-templates' / 'contact-sheet.png', 'Social template contact sheet | 14-social-media-templates/contact-sheet.png', max_h=115*mm)

# 9 creative library
story.append(PageBreak())
story.append(p("9. EXISTING CREATIVE LIBRARY", styles['H1']))
library_rows = [[p('<b>Category</b>', styles['BodyText']), p('<b>File</b>', styles['BodyText']), p('<b>Type</b>', styles['BodyText']), p('<b>Dimensions</b>', styles['BodyText']), p('<b>Purpose/Notes</b>', styles['BodyText'])]]
key_creatives = [
    ('Festival creatives', '11-festival-variation/festival-ganpati-banner-16x9.png', 'PNG', 'Festival banner variant'),
    ('Festival creatives', '11-festival-variation/festival-navratri-story.png', 'PNG', 'Festival story variant'),
    ('Social media', '14-social-media-templates/feed-square/04-event-announcement.png', 'PNG', 'Event announcement template'),
    ('Social media', '14-social-media-templates/feed-portrait/06-booking-cta.png', 'PNG', 'Booking CTA template'),
    ('Stories', '14-social-media-templates/story/03-event-tonight-story.png', 'PNG', 'Story format event push'),
    ('Covers/Banners', '14-social-media-templates/covers/youtube-banner-2560x1440.png', 'PNG', 'YouTube cover/banner'),
    ('Print collateral', '15-print-collateral/business-card/business-card-front.png', 'PNG', 'Business card front'),
    ('Print collateral', '15-print-collateral/rate-card/rate-card-back.png', 'PNG', 'Rate card back (packages)'),
    ('Print collateral', '15-print-collateral/large-format/standee-850x2000mm.png', 'PNG', 'Roll-up standee'),
    ('Print collateral', '15-print-collateral/large-format/backdrop-6x3ft.png', 'PNG', 'Stage/photo backdrop'),
]
for cat, rel, typ, note in key_creatives:
    d = dims.get(rel)
    ds = f"{int(d[0])}×{int(d[1])}" if d else 'Not specified'
    library_rows.append([p(cat, styles['BodyText']), p(rel, styles['Small']), p(typ, styles['BodyText']), p(ds, styles['BodyText']), p(note, styles['BodyText'])])
lib_table = Table(library_rows, colWidths=[28 * mm, 66 * mm, 14 * mm, 22 * mm, 50 * mm])
lib_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EFEFEF')),
    ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
]))
story.append(lib_table)
add_img(story, ASSETS / '15-print-collateral' / 'contact-sheet.png', 'Print collateral contact sheet | 15-print-collateral/contact-sheet.png', max_h=70*mm)

# 10 products/services
story.append(p("10. PRODUCTS & SERVICES", styles['H1']))
prod_rows = [[p('<b>Name</b>', styles['BodyText']), p('<b>Category</b>', styles['BodyText']), p('<b>Description</b>', styles['BodyText']), p('<b>Pricing/Offers</b>', styles['BodyText']), p('<b>Source</b>', styles['BodyText'])],
             [p('Sound & Light', styles['BodyText']), p('Core service', styles['BodyText']), p('Explicit in tagline and README description.', styles['BodyText']), p('Not specified in machine-readable text.', styles['BodyText']), p('assets/brand/README.md', styles['Small'])],
             [p('Event Production', styles['BodyText']), p('Core service', styles['BodyText']), p('Explicit in tagline and README description.', styles['BodyText']), p('Not specified in machine-readable text.', styles['BodyText']), p('assets/brand/README.md', styles['Small'])],
             [p('Service packages (rate card)', styles['BodyText']), p('Commercial offering', styles['BodyText']), p('Rate-card assets exist including package/pricing visual content.', styles['BodyText']), p('Requires verification from editable source or owner; text in exported artwork is vectorized.', styles['BodyText']), p('assets/brand/15-print-collateral/rate-card/*', styles['Small'])],
             [p('Booking', styles['BodyText']), p('Lead generation action', styles['BodyText']), p('Booking CTA templates and WhatsApp QR flow are included.', styles['BodyText']), p('Number destination available via wa.me link.', styles['BodyText']), p('assets/brand/14-social-media-templates/*, 15-print-collateral/README.md', styles['Small'])],]
pt = Table(prod_rows, colWidths=[26*mm, 24*mm, 52*mm, 43*mm, 35*mm])
pt.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EFEFEF')),
    ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
]))
story.append(pt)

# 11 contact
story.append(PageBreak())
story.append(p("11. CONTACT & DIGITAL PRESENCE", styles['H1']))
contact_rows = [[p('<b>Channel</b>', styles['BodyText']), p('<b>Human-readable</b>', styles['BodyText']), p('<b>Destination</b>', styles['BodyText']), p('<b>Status</b>', styles['BodyText'])],
                [p('WhatsApp', styles['BodyText']), p('Primary booking chat', styles['BodyText']), p("<link href='https://wa.me/917000051042'>https://wa.me/917000051042</link>", styles['BodyText']), p('Found in asset README. Requires owner confirmation.', styles['BodyText'])],
                [p('Website', styles['BodyText']), p('Not specified', styles['BodyText']), p('Not specified in provided assets.', styles['BodyText']), p('Requires verification', styles['BodyText'])],
                [p('Email', styles['BodyText']), p('Not specified', styles['BodyText']), p('Not specified in provided assets.', styles['BodyText']), p('Requires verification', styles['BodyText'])],
                [p('Instagram/Facebook/LinkedIn/YouTube', styles['BodyText']), p('Cover assets exist', styles['BodyText']), p('Profile/page URLs not specified in provided assets.', styles['BodyText']), p('Requires verification', styles['BodyText'])],]
ctbl = Table(contact_rows, colWidths=[28*mm, 38*mm, 60*mm, 54*mm])
ctbl.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EFEFEF')),
    ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
]))
story.append(ctbl)

# 12 asset directory
story.append(p("12. BRAND ASSET DIRECTORY", styles['H1']))
asset_rows = [[p('<b>Asset Group</b>', styles['BodyText']), p('<b>File count</b>', styles['BodyText']), p('<b>Representative path</b>', styles['BodyText']), p('<b>Purpose</b>', styles['BodyText'])]]
group_map = {
    'Logos': ['01-primary-logo', '02-horizontal-logo', '03-stacked-logo', '04-icon-mark', '05-wordmark', '06-monochrome-logo', '07-inverse-logo', '08-social-media-avatar', '09-badge-emblem', '10-responsive-logo', '12-colour-variations'],
    'Campaign/Festival': ['11-festival-variation'],
    'Brand tokens & fonts': ['13-brand-colours-typography'],
    'Social templates': ['14-social-media-templates'],
    'Print collateral': ['15-print-collateral'],
    'Boards/source': ['board', '_source'],
}
for name, folders in group_map.items():
    count = sum(folder_counts.get(f, 0) for f in folders)
    rep = f"assets/brand/{folders[0]}/"
    purpose = {
        'Logos': 'Official mark variants and background compatibility options.',
        'Campaign/Festival': 'Occasion-adapted creatives (Ganpati/Navratri).',
        'Brand tokens & fonts': 'Color tokens, typography card, licensed font files.',
        'Social templates': 'Multi-format social post/story/cover templates and overlays.',
        'Print collateral': 'Business card, letterhead, rate card, standee, backdrop.',
        'Boards/source': 'Reference board and original source artwork.',
    }[name]
    asset_rows.append([p(name, styles['BodyText']), p(str(count), styles['BodyText']), p(rep, styles['Small']), p(purpose, styles['BodyText'])])
adt = Table(asset_rows, colWidths=[33*mm, 18*mm, 50*mm, 79*mm])
adt.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EFEFEF')),
    ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
]))
story.append(adt)

# 13 AI image generation reference
story.append(PageBreak())
story.append(p("13. AI IMAGE GENERATION REFERENCE", styles['H1']))
ref_blocks = [
    ("Brand Identity", "Use MIHIR identity exactly as supplied. Keep tagline exactly: SOUND & LIGHT | EVENT | PRODUCTION."),
    ("Visual Direction", "Premium, dark-base layouts with gold accents and high contrast. Use clean structured compositions observed in provided templates."),
    ("Color Direction", "Prioritize official palette: Gold #D4AF37, Black #000000, Charcoal #1A1A1A, White #F5F5F5, with approved support colors from colours.json."),
    ("Typography Direction", "Use Montserrat for labels/CTA, Cinzel/Cinzel Decorative for headings, Playfair Display for editorial body where needed."),
    ("Logo Rules", "Do NOT redraw the logo with image models. Use provided logo files as overlay/reference assets. Preserve proportions and clear space."),
    ("Composition Direction", "Follow known formats (1:1, 4:5, 9:16, banner) with clear hierarchy: headline, support line, CTA/contact."),
    ("Photography Direction", "Use event-focused imagery with dramatic lighting and readable foreground text zones."),
    ("Background Direction", "Prefer dark or neutral backgrounds that preserve gold/white logo contrast; use inverse/monochrome variants when needed."),
    ("CTA Direction", "Booking and event CTA should remain visually prominent but minimal, with strong contrast and clean spacing."),
    ("Things to Avoid", "Do not distort/recolor logo, do not use unapproved palettes, avoid low-contrast text, avoid unrelated imagery, avoid clutter/excess effects."),
]
for k, v in ref_blocks:
    story.append(p(f"<b>{k}:</b> {v}", styles['BodyText']))
    story.append(Spacer(1, 1.5 * mm))

# 14 occasion guidance
story.append(p("14. OCCASION / CAMPAIGN CREATIVE GUIDANCE", styles['H1']))
for line in [
    "What remains fixed: logo form, tagline text, core palette, and brand typography direction.",
    "What can adapt: background motifs, occasion iconography, headline message, campaign-specific offer text.",
    "Seasonal adaptation: integrate festival elements like those seen in Ganpati/Navratri examples while preserving logo and contrast rules.",
    "Promotional messaging: keep concise, avoid visual overcrowding, maintain CTA legibility.",
    "Campaign names/offers should be owner-verified before publishing.",
]:
    story.append(p(f"• {line}", styles['BodyText']))

# 15 ready-to-use context
story.append(PageBreak())
story.append(p("15. READY-TO-USE AI CONTEXT", styles['H1']))
master_context = (
    "MASTER AI BRAND CONTEXT: Brand: MIHIR. Category: Sound & Light / Event Production. "
    "Tagline: SOUND & LIGHT | EVENT | PRODUCTION. Visual identity is premium gold-on-dark with clean "
    "structured layouts. Use official colors: #D4AF37, #000000, #1A1A1A, #F5F5F5, plus approved support "
    "colors (#F6E27A, #8E6A14, #0B1A3A, #3A3A3A). Typography direction: headings in Cinzel/Cinzel Decorative, "
    "labels in Montserrat, editorial text in Playfair Display. Always use original provided logo files as overlays; "
    "do not redraw logos or retype the wordmark/tagline as alternate branding. Keep high contrast and readable "
    "text hierarchy (headline, support, CTA). Existing creative types include social posts, stories, event announcements, "
    "booking CTA, testimonials, festival greetings, print collateral. Verified contact in assets: WhatsApp https://wa.me/917000051042 "
    "(requires business confirmation). Avoid unapproved colors, distorted logos, cluttered compositions, unrelated imagery, and low-quality outputs."
)
story.append(p(master_context, styles['BodyText']))

# 16 prompt template
story.append(p("16. AI CREATIVE PROMPT TEMPLATE", styles['H1']))
prompt_t = (
    "Create a [TYPE OF CREATIVE] for [OCCASION/CAMPAIGN] for MIHIR. "
    "Objective: [OBJECTIVE]. Audience: [TARGET AUDIENCE]. Main message: [MAIN MESSAGE]. "
    "Offer/Product/Service: [DETAILS]. CTA: [CTA TEXT]. Format: [PLATFORM/FORMAT]. "
    "Dimensions/Aspect Ratio: [SIZE]. Language: [LANGUAGE]. Required contact details: [CONTACT]. "
    "Required logo asset: [EXACT FILE PATH]. Required imagery/background direction: [IMAGE DIRECTION]. "
    "Additional instructions: Follow the provided MASTER AI BRAND CONTEXT and this Master Brand & Creative Guidelines document. "
    "Do not introduce unrelated branding, unapproved colors, or altered logo forms."
)
story.append(p(prompt_t, styles['BodyText']))

# 17 issues
story.append(PageBreak())
story.append(p("17. FILES THAT REQUIRE ATTENTION", styles['H1']))
attention_items = [
    "Official legal business name, full address, email, and website are not specified in provided assets.",
    "Direct social profile URLs are not specified in provided assets.",
    "Rate-card package pricing exists visually, but machine-readable values are not extractable from vectorized text exports; requires verification.",
    "No official Pantone values found.",
    "No explicit formal brand-guideline PDF was found; guidance is distributed across README, token files, and creative exports.",
    "Some creative text content is outlined in SVG paths (not editable/searchable text) — editable source verification may be needed.",
]
if exact_duplicates:
    attention_items.append(f"Exact duplicate files detected: {sum(len(x) for x in exact_duplicates)} files across {len(exact_duplicates)} duplicate groups (review if cleanup is needed).")
else:
    attention_items.append("No exact binary duplicates detected across scanned files.")
for i in attention_items:
    story.append(p(f"• {i}", styles['BodyText']))

# 18 source notes
story.append(p("18. SOURCE & VERIFICATION NOTES", styles['H1']))
source_rows = [[p('<b>Information type</b>', styles['BodyText']), p('<b>Verified source path(s)</b>', styles['BodyText']), p('<b>Notes</b>', styles['BodyText'])],
               [p('Brand name, tagline, logo rules, sizes', styles['BodyText']), p('assets/brand/README.md', styles['Small']), p('Primary source for identity and usage constraints.', styles['BodyText'])],
               [p('Color palette and typography roles', styles['BodyText']), p('assets/brand/13-brand-colours-typography/colours.json, colours.css', styles['Small']), p('Token-level color and type definitions.', styles['BodyText'])],
               [p('Font files and licensing', styles['BodyText']), p('assets/brand/13-brand-colours-typography/fonts/fonts-README.md, OFL-LICENSE.txt', styles['Small']), p('Font families and allowed usage/license context.', styles['BodyText'])],
               [p('Social template formats and use cases', styles['BodyText']), p('assets/brand/14-social-media-templates/README.md', styles['Small']), p('Template purpose, dimensions, overlay instructions.', styles['BodyText'])],
               [p('Print collateral specs and WhatsApp link', styles['BodyText']), p('assets/brand/15-print-collateral/README.md', styles['Small']), p('Print sizes, production notes, QR/WhatsApp destination.', styles['BodyText'])],
               [p('Source artwork provenance', styles['BodyText']), p('assets/brand/_source/README.md', styles['Small']), p('Reference board origin and tracing notes.', styles['BodyText'])],
               [p('Visual system overview', styles['BodyText']), p('assets/brand/board/mihir-brand-board.png/.svg/.jpg', styles['Small']), p('Composite board showing major brand elements.', styles['BodyText'])],]
st = Table(source_rows, colWidths=[38*mm, 62*mm, 80*mm])
st.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EFEFEF')),
    ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#CCCCCC')),
    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
]))
story.append(st)

# appendix summary
story.append(PageBreak())
story.append(p("Appendix: Asset Scan Summary", styles['H1']))
story.append(p(f"Total files scanned in assets/brand: <b>{len(files)}</b>", styles['BodyText']))
story.append(p("File types: " + ", ".join([f"{k}:{v}" for k, v in sorted(ext_counts.items())]), styles['BodyText']))
folder_table = [[p('<b>Top-level folder</b>', styles['BodyText']), p('<b>Files</b>', styles['BodyText'])]]
for folder, count in sorted(folder_counts.items()):
    folder_table.append([p(folder, styles['BodyText']), p(str(count), styles['BodyText'])])
ftab = Table(folder_table, colWidths=[120*mm, 60*mm])
ftab.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#EFEFEF')),
    ('GRID', (0, 0), (-1, -1), 0.25, colors.HexColor('#CCCCCC')),
]))
story.append(ftab)

doc = SimpleDocTemplate(str(OUT), pagesize=A4, leftMargin=16*mm, rightMargin=16*mm, topMargin=14*mm, bottomMargin=14*mm, title='MASTER BRAND & CREATIVE GUIDELINES - MIHIR', author='Asset Analysis Generator')
doc.build(story, onFirstPage=footer, onLaterPages=footer)

print(str(OUT))
print(len(files))
