---
name: Carloku
description: The hosted CARLOS platform — the category-standard app-platform page, out-finished in one purple.
colors:
  carloku-purple: "#5b3e96"
  carloku-purple-deep: "#4c3380"
  carloku-purple-soft: "rgba(91, 62, 150, 0.08)"
  lifted-purple: "#b394f2"
  button-purple-dark-scheme: "#6a48c8"
  ink: "#1d1927"
  moon-ink: "#f2eff8"
  paper: "#ffffff"
  night: "#0e0c13"
  paper-tint: "#f8f7fb"
  night-tint: "#14111c"
  muted: "#5d5570"
  muted-dark-scheme: "#a9a0c2"
  band-purple: "#221a35"
  band-purple-dark-scheme: "#261b44"
  terminal-black: "#120f1a"
  terminal-chrome: "#1b1626"
  terminal-ink: "#ede9f7"
  terminal-out: "#9d93b8"
  terminal-ok-green: "#7ee2a8"
  hairline: "rgba(29, 25, 39, 0.1)"
  hairline-strong: "rgba(29, 25, 39, 0.16)"
  hairline-dark-scheme: "rgba(242, 239, 248, 0.09)"
typography:
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(2.6rem, 5.4vw, 4.1rem)"
    fontWeight: 680
    lineHeight: 1.04
    letterSpacing: "-0.032em"
  headline:
    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.3rem)"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.08rem"
    fontWeight: 620
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  lede:
    fontFamily: "Geist, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "1.17rem"
    fontWeight: 400
    lineHeight: 1.65
  mono:
    fontFamily: "Geist Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.86rem"
    fontWeight: 400
    lineHeight: 1.75
rounded:
  chip: "0.3em"
  control: "0.65rem"
  frame: "0.85rem"
spacing:
  gutter: "1.5rem"
  section: "5.5rem"
  band: "6rem"
  close: "7rem"
components:
  button-primary:
    backgroundColor: "{colors.carloku-purple}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0.72rem 1.4rem"
  button-primary-hover:
    backgroundColor: "{colors.carloku-purple-deep}"
  button-quiet:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0.72rem 1.4rem"
  head-cta:
    textColor: "{colors.carloku-purple}"
    rounded: "0.55rem"
    padding: "0.42rem 0.95rem"
  code-chip:
    backgroundColor: "{colors.carloku-purple-soft}"
    textColor: "{colors.carloku-purple-deep}"
    rounded: "{rounded.chip}"
    padding: "0.12em 0.4em"
  terminal-frame:
    backgroundColor: "{colors.terminal-black}"
    rounded: "{rounded.frame}"
---

# Design System: Carloku

## Overview

**Creative North Star: "The Quiet Standard"**

Carloku's site is the category-standard app-platform page — hero left, terminal right, three steps, feature list, full-bleed band, closing CTA — played completely straight and won on finish, not on invention. Every surface is white (or near-black) paper crossed by hairline borders; a single purple carries the entire brand voice; Geist and Geist Mono do all the talking. The one theatrical object is the hero terminal, which types a real `ship → promote → rollback` session and wears the same dark clothes in both color schemes.

The system is genuinely two-scheme: `prefers-color-scheme` drives a full token swap (white-with-purple light, near-black-with-purple dark) declared as CSS custom properties on `:root`. Both schemes are required, not optional. The build is dependency-free by rule — no build step, no external requests, self-hosted variable fonts only, vanilla JS — so the token layer *is* the stylesheet; there is no second source of truth.

**Key Characteristics:**
- One accent purple per scheme; its rarity is its authority.
- Hairline borders (1px, low-alpha ink) do almost all the structural work; shadows exist only under framed media and the primary button.
- Variable-font weights at non-standard steps (480, 560, 580, 620, 650, 680) — the ramp is tuned, not defaulted.
- A terminal that never changes scheme: fixed dark tokens (`--term-*`) with no dark-mode override.
- Exactly one deep-purple full-bleed band per page.
- Motion is small and fast (120–160ms ease-out) with a total `prefers-reduced-motion` kill switch.

## Colors

Two mirrored monochrome-plus-purple schemes: purple is the only voice, everything else is ink, paper, and hairlines.

### Primary
- **Carloku Purple** (#5b3e96): the light-scheme accent and primary button fill; also the hardcoded brand-mark fill in the logo SVG and favicon. Used for links, focus outlines, `::selection`, step numerals, and feature-icon strokes.
- **Carloku Purple Deep** (#4c3380): hover state of the primary button; text color of inline code chips (as `--accent-ink`).
- **Carloku Purple Soft** (rgba(91, 62, 150, 0.08)): the accent at 8% alpha — background of code chips, icon tiles, step numerals, and quiet-button hover washes. In dark scheme it becomes the lifted purple at 10% alpha.
- **Lifted Purple** (#b394f2): the dark-scheme accent (links, focus, icons) — and, in *both* schemes, the terminal's prompt color and caret. Dark-scheme buttons use their own fill (**#6a48c8**, hover #7d5cdb) because the lifted accent is too light to carry white text.

### Neutral
- **Ink** (#1d1927): body text, light scheme — a purple-cast near-black, never pure #000. Dark-scheme ink is **Moon Ink** (#f2eff8).
- **Paper** (#ffffff) / **Night** (#0e0c13): page backgrounds. Each has a tint sibling (**#f8f7fb** / **#14111c**) used only for the alternating `.tint` section.
- **Muted** (#5d5570 light / #a9a0c2 dark): all secondary copy — ledes, feature paragraphs, footer. A step fainter (`--faint`: #6e6880 / #928aab) handles captions and asides.
- **Hairlines** (rgba(29,25,39,0.1) light / rgba(242,239,248,0.09) dark): every border on page surfaces; a `-strong` sibling at 0.16 alpha for quiet-button borders and note rules.

### Terminal (scheme-fixed)
- **Terminal Black** (#120f1a) with chrome bar **#1b1626**: the terminal and dashboard-frame background in both schemes.
- **Terminal Ink** (#ede9f7) for typed commands, **Terminal Out** (#9d93b8) for program output, **#8d84a6** for chrome titles and comments.
- **Terminal OK Green** (#7ee2a8): success lines only. This is the only non-purple hue in the entire system, and it exists only inside the terminal.

### Band
- **Band Purple** (#221a35 light / #261b44 dark): the one full-bleed deep-purple section. It carries its own sub-palette: ink #f2eef9, muted #b9aed6, hairlines at 12–14% alpha of the band ink, and *inverted* buttons (band-ink fill, band-bg text).

### Named Rules
**The One Voice Rule.** One purple per scheme carries links, focus, selection, buttons, and icons. No second accent hue ever appears on page surfaces; the terminal's green is terminal furniture, not a palette member.
**The Terminal Stays Dark Rule.** `--term-*` tokens have no dark-scheme override. Anything framed as a terminal or console capture (`.term`, `.dash-frame`) sits on Terminal Black in both schemes.
**The No-Pure-Black Rule.** Ink and backgrounds are always purple-cast (#1d1927, #0e0c13, #120f1a) — never #000.

## Typography

**Display/Body Font:** Geist variable (with ui-sans-serif, system-ui fallback) — self-hosted woff2, weight axis 100–900, preloaded.
**Mono Font:** Geist Mono variable (with ui-monospace, SFMono-Regular fallback) — commands, code chips, terminal, step numerals.

**Character:** One contemporary grotesk doing everything, differentiated by finely-tuned variable weights and progressively tighter tracking as size grows. Mono is the product's own voice — commands appear as incantations, never paragraphs.

### Hierarchy
- **Display** (680, clamp(2.6rem, 5.4vw, 4.1rem), 1.04, -0.032em): the hero headline only; `text-wrap: balance`, with the sentence-final period in accent purple (`.dot`).
- **Headline** (650, clamp(1.7rem, 3vw, 2.3rem), 1.15, -0.025em): section h2s. The closing CTA scales it up (clamp(2rem, 4vw, 3rem)); guide-page h2s scale it down (1.45rem).
- **Title** (620, 1.08–1.12rem, -0.01em): feature and step h3s.
- **Lede** (400, 1.17rem, 1.65): hero standfirst in muted, max-width 34rem; section ledes at 1.08rem, max-width 38rem. Always `text-wrap: pretty`.
- **Body** (400, 1rem, 1.6): default. Guide prose is capped at 42rem; footer at 44rem.
- **Mono** (400, 0.86–0.88rem, 1.75): terminal and `pre` blocks, with `font-variant-numeric: tabular-nums` in the terminal. Inline code chips run at 0.88em of their context.

### Named Rules
**The Off-Grid Weight Rule.** Weights come from the variable axis at tuned steps — 480 (nav), 560 (emphasis/mono), 580 (buttons), 620/650/680 (titles up to display) — never the flat 400/700 defaults.
**The Tighter-As-Bigger Rule.** Tracking tightens with size: -0.01em at title, -0.025em at headline, -0.032em at display; body stays normal.
**The Purple Period Rule.** A display or closing headline may end its sentence with an accent-colored full stop (`.dot`) — the accent's only appearance inside running display type.

## Layout

A single centered column, max-width 72rem (`--wrap`) with 1.5rem side gutters; prose pages narrow to 50rem (`.wrap.narrow`). Sections stack at a 5.5rem vertical rhythm (band 6rem, closing CTA 7rem), separated not by rules but by alternating backgrounds: plain, tint (with top+bottom hairlines), band. Two-column grids do the feature work — hero at `1.05fr / 1fr` with 4.5rem gap, quiet-grid at `0.92fr / 1.08fr` — always with `minmax(0, …)` to protect the terminal's overflow. Steps run three-across.

Two breakpoints, both max-width: **62rem** collapses every grid to one column and compresses section padding to 4rem; **44rem** rewraps the sticky header (nav drops to a full-width second row). The header itself is 4rem tall, sticky, background at 82% opacity over 12px backdrop blur, and earns its bottom hairline only after 8px of scroll.

## Elevation & Depth

Essentially flat: hairline borders and background-tint shifts convey nearly all structure. Shadows exist in exactly two places — under framed dark media (terminal, dashboard frame) and under the primary button — and both are soft, large-radius, purple-cast ambient washes, never hard offsets.

### Shadow Vocabulary
- **Frame shadow** (`--shadow`: `0 1px 2px rgba(20,12,40,0.05), 0 12px 32px -12px rgba(20,12,40,0.18)` light; `0 1px 2px rgba(0,0,0,0.4), 0 16px 40px -16px rgba(0,0,0,0.55)` dark): terminal and dashboard frames only.
- **Button shadow** (`0 1px 2px rgba(20,12,40,0.2), 0 6px 16px -6px color-mix(in srgb, var(--btn-bg) 55%, transparent)`): primary buttons on page surfaces; removed inside the band.

### Named Rules
**The Two-Shadows Rule.** Only framed dark media and the primary button cast shadows. Cards, sections, the header, and everything else are flat, defined by hairlines and tint shifts.

## Shapes

Soft-but-businesslike radii in three sizes: **0.3em** for inline chips, **~0.55–0.7rem** for controls (buttons 0.65rem, header CTA 0.55rem, `pre` 0.7rem), **0.85rem** for the big framed objects (terminal, dashboard). Step numerals, terminal traffic-light dots, and icon-tile contents use circles; icon tiles themselves are 2.4rem squares at 0.6rem radius. Borders are always 1px hairlines — there are no 2px+ borders and no hard-cornered rectangles anywhere. The brand mark is a rounded square (rx 14/64) holding an open circular stroke — the same geometry family as the page.

## Components

### Buttons
- **Shape:** softly rounded (0.65rem), inline-flex, 0.72rem × 1.4rem padding, weight 580.
- **Primary:** Carloku Purple fill (#5b3e96 light / #6a48c8 dark), white text, purple-cast shadow. Hover deepens the fill (#4c3380 / #7d5cdb). Inside the band it inverts: band-ink fill, band-bg text, no shadow, hover to pure white.
- **Quiet:** transparent with a strong-hairline border and ink text; hover turns border and text accent-purple over an accent-soft wash.
- **Active:** `translateY(1px)` press. **Focus:** 2px accent outline, 3px offset (global rule for all links and buttons).
- **Header CTA:** a smaller quiet-button variant (0.42rem × 0.95rem, 0.55rem radius) in accent color.

### Chips (inline code)
- **Style:** Geist Mono at 0.88em on an accent-soft wash, accent-ink text, 0.3em radius, 0.12em × 0.4em padding. This is how the three commands appear in prose.

### Cards / Containers
There are no boxed cards. "Cards" are borderless grid cells (steps, features) separated by hairline rules between siblings (`li + li { border-top }`) and by whitespace. Framed containers exist only for dark media (see Terminal).

### Navigation
- Sticky translucent header (82% bg over 12px blur), 4rem tall; brand at weight 640 with the SVG mark; links in muted at 0.95rem/weight 480, hover to ink (color transition only, 120ms). Scroll past 8px adds the bottom hairline. Below 44rem the nav wraps to a second full-width row.

### Terminal (signature component)
Terminal Black frame, 0.85rem radius, hairline `rgba(255,255,255,0.08)` border, frame shadow. Chrome bar (#1b1626) holds three 0.68rem dots drawn in title-color at 28% opacity plus a mono-ish title (#8d84a6, 0.78rem). Body is Geist Mono 0.86rem at 1.75 line-height, tabular numerals, min-height 17.5rem. Line grammar: commands in terminal-ink with a `$` prompt in lifted purple (weight 560, injected via `::before`), output in terminal-out, comments in title-color, success in OK green, and a blinking lifted-purple caret (1.1s steps). On load the session types itself once (14ms/char, staged line delays, vanilla JS) — skipped entirely under reduced motion. The same frame + chrome bar wraps the dashboard screenshot (`.dash-frame`), which swaps light/dark captures via `<picture>` while the frame stays dark.

### Feature list items
Two-column grid rows (icon auto / text 1fr, 1.15rem gap), 1.35rem vertical padding, hairline rules between rows. Icons are inline 24px-viewBox stroke SVGs (stroke-width 2, round caps/joins — vendored Lucide-style, never icon fonts or CDNs) at 1.25rem inside 2.4rem accent-soft tiles.

### Guide article (get-started)
Hairline-separated sections at 2.4rem padding; `pre` blocks in the terminal's clothes (Terminal Black, terminal ink, 0.7rem radius); asides as `.note` — a single left hairline-strong rule, faint text, no background.

## Do's and Don'ts

### Do:
- **Do** keep both color schemes complete: every new token needs a light value on `:root` and a dark value in the `prefers-color-scheme: dark` block, plus a `theme-color` meta if it changes page chrome.
- **Do** draw structure with hairlines and tint shifts (`--line`, `--bg-tint`), reserving shadows for framed dark media and the primary button.
- **Do** put anything terminal- or console-shaped on the fixed `--term-*` palette in both schemes.
- **Do** use tuned variable weights (480/560/580/620/650/680) and tighter tracking as type grows.
- **Do** keep motion at 120–160ms ease-out, and gate *all* animation and smooth scroll behind `prefers-reduced-motion` (the global kill switch already exists — don't bypass it).
- **Do** stay dependency-free: no build step, no external requests, self-hosted fonts only, inline SVG icons, vanilla JS.

### Don't:
- **Don't** introduce a second accent hue on page surfaces; the terminal's OK green never leaves the terminal.
- **Don't** use pure #000 or #fff for ink/dark backgrounds — near-blacks are purple-cast (#1d1927, #0e0c13, #120f1a). (The one white exception: text *on* purple button fills.)
- **Don't** box content in bordered cards; siblings separate with single hairline rules or whitespace.
- **Don't** add a second full-bleed purple band to a page — one per page is the ceiling.
- **Don't** use hard-offset shadows, borders heavier than 1px, or icon fonts/CDN icons.
- **Don't** let dark-scheme buttons use the lifted accent (#b394f2) as a fill; buttons keep their own deeper fills (#6a48c8/#7d5cdb) so white text stays legible.
