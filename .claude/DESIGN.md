---
version: alpha
name: TEG Night Blue
description: Design system of the Generative Technologies lab materials site (web/). Projector presentations and reading material on phones.
colors:
  primary: "#1f5fd1"
  on-primary: "#ffffff"
  ink-950: "#050b1f"
  ink-900: "#0a1430"
  ink-800: "#111e45"
  ink-700: "#1a2a5c"
  fg: "#eef3ff"
  fg-muted: "#a9b6d8"
  fg-subtle: "#6c7ba5"
  brand-300: "#93c2ff"
  brand-400: "#5ea3ff"
  brand-500: "#2f7cf6"
  brand-600: "#1f5fd1"
  cyan-400: "#2fd8e8"
  hit: "#3ee0a4"
  miss: "#ff7a8a"
  focus: "#ffc94d"
  cat-1: "#5ea3ff"
  cat-2: "#2fd8e8"
  cat-3: "#ffc94d"
  cat-4: "#ff8fb1"
  line: "rgb(169 182 216 / 0.14)"
  line-strong: "rgb(169 182 216 / 0.28)"
  panel: "rgb(255 255 255 / 0.035)"
  panel-hi: "rgb(255 255 255 / 0.07)"
typography:
  display:
    fontFamily: Geist
    fontSize: 128px
    fontWeight: "600"
    lineHeight: "0.95"
    letterSpacing: -0.04em
  headline:
    fontFamily: Geist
    fontSize: 60px
    fontWeight: "600"
    lineHeight: "1.08"
    letterSpacing: -0.025em
  title:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: "600"
    lineHeight: "1.4"
  body-lg:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: "400"
    lineHeight: "1.65"
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  eyebrow:
    fontFamily: Geist Mono
    fontSize: 12px
    fontWeight: "400"
    lineHeight: "1.4"
    letterSpacing: 0.22em
  code:
    fontFamily: Geist Mono
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.7"
  data:
    fontFamily: Geist Mono
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.4"
    fontFeature: tnum
rounded:
  chip: 0.5rem
  card: 1.25rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  card-padding: 24px
  section-y: 112px
  container: 1280px
  reading-width: 896px
components:
  page:
    backgroundColor: "{colors.ink-950}"
    textColor: "{colors.fg}"
    typography: "{typography.body-md}"
  panel:
    backgroundColor: "#0e1427"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  panel-hover:
    backgroundColor: "#161c2f"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: 10px 20px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.fg}"
    rounded: "{rounded.full}"
    padding: 10px 20px
  button-ghost-hover:
    backgroundColor: "#161c2f"
  eyebrow:
    textColor: "{colors.brand-400}"
    typography: "{typography.eyebrow}"
  section-heading:
    textColor: "{colors.fg}"
    typography: "{typography.headline}"
  lead:
    textColor: "{colors.fg-muted}"
    typography: "{typography.body-lg}"
  callout-insight:
    backgroundColor: "#141622"
    textColor: "{colors.fg}"
    rounded: 12px
    padding: 16px 20px
  callout-warning:
    backgroundColor: "#141225"
    textColor: "{colors.fg}"
    rounded: 12px
    padding: 16px 20px
  code-block:
    backgroundColor: "#0e1427"
    textColor: "{colors.fg}"
    typography: "{typography.code}"
    rounded: "{rounded.card}"
  terminal:
    backgroundColor: "{colors.ink-950}"
    textColor: "{colors.fg-muted}"
    typography: "{typography.code}"
    rounded: "{rounded.card}"
  badge-focus:
    backgroundColor: "#1e1e24"
    textColor: "{colors.focus}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  token-chip:
    rounded: "{rounded.chip}"
    typography: "{typography.code}"
    padding: 6px 8px
---

## Overview

Navy night and blue light. The site is both a projector presentation (dark room, large headings, keyboard control) and material to read on a phone. Technical and calm: dark background with slowly drifting blue and cyan blobs, a subtle grid, glass panels. Motion shows the process the slide is about (sampling a token, comparing vectors, drawing a graph), never decoration.

Implementation: Next.js (static export), Tailwind CSS v4, Radix UI primitives, `motion`. How to build components and which bugs to avoid: skill [`skills/web-ui`](skills/web-ui/SKILL.md).

## Colors

Color tokens are defined in `web/src/app/globals.css` (`@theme` and `:root` for translucent layers) and must match this file; the build checks it.

- **Ink (950–700):** backgrounds. `ink-950` is the page background; lighter steps only in gradients and layers.
- **Fg, fg-muted, fg-subtle:** three text levels: headings and body, lead and descriptions, captions and metadata.
- **Brand (300–600) and cyan-400:** brand accent. Gradient `brand-300 → brand-500 → cyan-400` only on 1–3 heading words.
- **Hit, miss, focus:** semantic colors with fixed meaning: hit or correct result, error or rejected candidate, element the viewer should look at. Never decorative.
- **Cat-1…4:** data series in charts, at most four, always in this order.
- **Primary, on-primary:** main button (white on `brand-600`, contrast 5.8:1). Hover is 10% brightening (`brightness-110`), not `brand-500`: white on `brand-500` is 3.9:1, below WCAG AA.
- **Line, line-strong, panel, panel-hi:** translucent borders and panel backgrounds; work on any part of the background.

Component tokens give translucent backgrounds as the effective color over `ink-950` (e.g. panel `rgb(255 255 255 / 0.035)` → `#0e1427`) so contrast can be checked. Text contrast on the page background: `fg` 17:1, `fg-muted` 9.7:1, `fg-subtle` 4.7:1.

## Typography

Geist for text, Geist Mono for code, numbers in visualizations and eyebrows. Hierarchy comes from size, not from more typefaces.

- **Display:** only the page opening title; fluid size `clamp(3rem, 9vw, 8rem)`, the token gives the maximum.
- **Headline:** section heading, 36 px on phone, 60 px from `md`. The heading is a thesis (e.g. „Token jest podstawową jednostką”), not a topic name.
- **Eyebrow:** overline above the heading, mono, uppercase, tracked, format „NN · Topic”.
- **Data:** numbers in tables and visualizations always with tabular figures.

## Layout

- Content container `container` (1280 px) with `gutter` (24 px); text pages (README, notebook) use `reading-width`.
- A presentation section (slide) is at least screen height with `section-y` vertical spacing.
- `lg:grid-cols-2` and `lg:grid-cols-4` grids collapse to one column below `lg`. SVG visualizations have `viewBox` and 100% container width.
- Target resolutions: 1440×900 (projector) and 390×844 (phone).

## Elevation & Depth

Depth comes from layers, not shadows: blurred light blobs in the background (scroll parallax), translucent panels with `backdrop-blur` and a `line` border. `glow` shadow (blue halo) only on the main button and the active element.

## Shapes

Radii: `card` for panels and cards, `chip` for tokens and small labels, `full` for buttons, toggles and badges. Chart lines rounded (`stroke-linecap: round`).

## Components

Atomic design in `web/src/components/`: atoms in `ui/`, molecules in `molecules/`, organisms in `viz/`, `site/`, `lesson/` and `notebook/`. Component tokens in the front matter map to their Tailwind classes.

- **Panel:** base of every card, code window and visualization.
- **Section heading:** eyebrow + headline (first 1–3 words in gradient) + lead.
- **Code block and terminal:** syntax-highlighted code next to the real notebook output, labeled with the model name.
- **Callout:** one idea per slide; `insight` (yellow edge) to remember, `warning` (pink edge) for a pitfall.
- **Buttons:** `primary` for the main action, `ghost` for the rest.

The linter reports `ink-*`, `cat-*`, `hit`, `miss` etc. as unused by components. Intended: data visualizations use them and have no component tokens.

## Do's and Don'ts

- Do: colors only from tokens; a new color goes first into this file and `globals.css`.
- Do: numbers and code on slides from real notebook runs.
- Do: one thesis per slide, max ~40 words of running text excluding code.
- Do: interactions via Radix primitives (keyboard accessibility), labeled on the element with the role (e.g. `Slider.Thumb`).
- Don't: hex in a component, a new UI library, screenshots of code instead of text.
- Don't: animation that shows no process step; carousels, autoplay, sound.
- Don't: emoji as decoration of headings and frames.
