# Acelera tu Negocio — Design Brief

## Design read
The visitor is a Chilean SME owner or CEO ($3M-$10M+ CLP/month) evaluating whether
to hand strategic control of their company's growth to an outside firm — the
register must feel like precision judgment under pressure, not a marketing
agency selling excitement. Quietly confident, engineered, zero decoration.

## Concept spine
**Panel de Control** — the site itself is a flight instrument for business
acceleration: a brushed-titanium gauge/chronometer that the camera pushes into,
revealing the mechanism (dial, needle, calibrated markings) that reads a
company's growth trajectory. "Dirección y consultoría" is instrumentation, not
inspiration.

## Delivery tier
`cinema` — Lenis+GSAP, Tier-1 hero = the scroll-scrub journey, scroll chapters.

## Locked palette — "Cold Luxury" (instrument steel)
- Ground: `#0a0b0c` (off-black, cool undertone — never pure `#000000`)
- Elevated surface: `#15171a`
- Hairline / border: `#282b2f`
- Ink (primary text): `#f3f5f6`
- Muted ink (secondary text): `#98a1a8`
- Chrome (metallic highlight, decorative only): `#aab6c0`
- Accent (single, interactive — CTAs, active states, data line): `#4f7fa6`
  (desaturated steel-cobalt, ~42% saturation — reads as instrument-panel
  backlight, not a neon glow)

Defense: Acelera sells precision judgment, not hype — brushed steel on
near-black reads like avionics/instrumentation: engineered, trustworthy, zero
ornament. This is the "Cold Luxury" escape route named in design-recipe.md,
chosen specifically to avoid the graphite+ember AI default (no orange/amber
anywhere) and the near-black+neon-glow AI default (the accent is desaturated
steel-cobalt, not a glowing cyan/blue). First build in this chat, so all six
anti-convergence axes are derived fresh from the brief's material world
(steel, brushed metal, glass, calibration marks) rather than differed from a
prior build.

## Locked type
**Geist** (display + body) + **Geist Mono** (data readouts, tags, nav labels,
kickers, form field labels) — the exact Mercury/Ramp-adjacent pairing the
client named as reference. Mono is used structurally, as instrument-readout
typography (metrics, proof tags, chapter numbers), never decoratively.

## Animation mode

Animation mode: animated-website

Locked at intake, user chose "Animado (recomendado)".

### Journey shape: single-shot
ONE continuous ~15s film, scrubbed end to end. The brand's story ("we read
your business like an instrument, then execute") is one subject seen ever
more closely — no reason to travel between separate worlds.

### Journey (one scene, one chapter of copy, four beats directed into the footage)
The `scrollScrubScenes` array ships exactly ONE entry (`hero`) per the
single-shot contract. Its `scroll` weight (320vh) gives the pinned film room
to play the four beats below while ONE persistent headline and body read
over it:
1. "Apertura". Camera floats in near-total darkness; a brushed titanium
   instrument dial emerges from shadow, lit from one direction.
2. "Enfoque". Camera pushes into the dial's mechanism, gear teeth, a
   calibrated bezel, a needle at rest, sharp macro detail.
3. "Lectura". The needle sweeps and traces a rising line engraved into the
   metal face.
4. "Resolucion". The instrument settles, fully lit, needle steady in the
   optimal zone, glass reflecting a clean highlight.

Headline: brand promise (dirección + consultoría, read like an instrument).
No proof tags (hero stays minimal per hero discipline). The page sections
below the film (Servicios, Como trabajamos, A quien ayudamos, Contacto)
carry the direccion/consultoria/resultado story beats as ordinary content,
not as additional scroll-scrub chapters.

### World grammar
Brushed titanium/steel instrument (chronometer/altimeter family), single
directional light sweeping from upper-left, cool color temperature
throughout (never warm/amber), macro-to-medium lens depth of field, seamless
charcoal-black studio background (no environment, no text, no logos), subject
always centered with generous negative space around it for chapter copy.

### Camera architecture
N/A (single-shot — no legs to join).

### Mobile framing
Subject (the instrument face) kept inside the center 60% of frame at all
times so a portrait crop never loses it; mobile encode uses the same clip at
reduced resolution.

### Delivery budget
≤32 MiB total desktop clip, ≤16 MiB total mobile clip.

## Section plan (ordered, one layout family each, no consecutive repeats)
1. **Hero / journey** (scroll-scrub, chapters embedded) — full-bleed film +
   pinned text. *(no eyebrow — hero discipline)*
2. **Servicios** — asymmetric bento (1 large cell + 2 smaller cells, matching
   "gauges of different sizes on a panel"), NOT a 3-equal-column row.
   *(eyebrow: yes — 1 of 3 budget)*
3. **Cómo trabajamos** — split text + image (process steps as an instrument
   readout list, numbered in Geist Mono). *(no eyebrow)*
4. **Casos de éxito** — full-width stat/quote blocks, alternating alignment.
   *(eyebrow: yes — 2 of 3)*
5. **Recursos gratuitos** — card grid (single distinct instance), "próximamente"
   teaser state with a notify-me capture — genuinely empty today, composed as
   a real designed empty state, not a broken section. *(no eyebrow)*
6. **Contacto** — form split panel (form left, instrument-dial illustration +
   direct info right). *(eyebrow: yes — 3 of 3)*
7. **Footer** — logo, nav, socials, legal.

7 sections total → eyebrow ceiling = ceil(7/3) = 3 (Servicios, Casos de éxito,
Contacto). 6 distinct layout families used across 6 content sections — no
family repeats.

## Asset plan
- Hero storyboard: ONE 16:9 six-panel-grid image, one continuous camera move
  (NOT six scenes), no text.
- Hero film: ONE `generate_video` single-shot, ~15s, 16:9, storyboard as
  style reference (not start_image), audio off.
- Section plates: 1 macro steel-texture plate (Servicios bento large cell),
  1 supporting plate (Cómo trabajamos), 1 atmospheric dark-steel plate
  (Casos de éxito background), 1 dial-illustration plate (Contacto panel).
- Custom icon set: one sheet, 8 glyphs (dirección, consultoría, video,
  proceso x3, recursos, contacto), 2px stroke, chrome-on-charcoal, sliced +
  background-removed.
- Logo: **user-provided** (`acelera-tu-logo.svg`, white mark) — used as-is in
  nav/footer/loading states. No logo generation.
- Favicon/head kit: derived from the user's logo mark (the icon glyph within
  it, not the wordmark) — generate the head-kit sizes from that source.
- OG image: one 1200x630 card composed in the brand language (dial macro +
  wordmark), not a crop of the hero.

## CTA inventory (each with its own interaction identity — no shared button)
1. **"Agendar llamada"** — primary intent, reused verbatim in nav / hero /
   resolución chapter / contact section / footer. Garment: a metallic pill
   with a hairline bezel; on hover/active it depresses like a physical
   instrument button (`scale-[0.98]` + inset highlight shift) — a "press",
   not a flood-fill or underline (keeps the garment catalog un-reused since
   this is the first build in the chat).
2. **"Ver servicios"** — secondary intent, hero only. Garment: text label
   whose underline is a thin calibration tick-mark that extends on hover
   (distinct from the primary's press garment).
3. **"Enviar"** — form submit intent, contact section only. Garment:
   full-width button whose fill is a needle-sweep wipe (left to right) on
   hover/loading, echoing the instrument needle motif.
4. **"Notificarme"** — recursos-gratuitos capture intent. Garment: small
   corner-bracket target that closes around the label on hover/focus
   (viewfinder garment).

Zero overlap with the rationed garments (drawing underline used ONCE only for
"Ver servicios" and it is a tick-mark variant, not a plain underline; no
hover flood-fill; no framed block).
