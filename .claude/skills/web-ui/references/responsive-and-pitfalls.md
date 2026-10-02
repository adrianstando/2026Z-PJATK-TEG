# Responsiveness and known bugs

Collected from bugs fixed in this repo. Each item: symptom → cause → fix.

## Resolutions

- Always check **1440×900** (projector) and **390×844** (phone).
- Grids: `grid gap-6 lg:grid-cols-2`; one column below `lg`. Fixed-width columns (`lg:grid-cols-[1fr_24rem]`) only with the `lg:` prefix.
- Tables always inside `overflow-x-auto`.
- Long terminal outputs: `max-h-[30rem] overflow-auto whitespace-pre-wrap`.
- Secondary elements hidden on narrow screens (`hidden md:flex`), never squeezed.
- SVG: `viewBox` + `className="h-auto w-full"`; SVG font size is in `viewBox` units, so it shrinks with the drawing on phones. Labels must be readable at 360 px width.

## Already fixed (don't repeat)

| Symptom | Cause | Fix |
|---|---|---|
| Labels at chart edge clipped | text exceeds `viewBox`, `<svg>` clips by default | inner margin in `viewBox` for labels or `overflow-visible` on `<svg>` |
| Descenders (g, y, ę) clipped in large heading | `overflow-hidden` mask for word reveal is exactly line height | `pb-[0.2em]` on the mask and `-mb-[0.2em]` to keep spacing |
| Lines miss highlighted points | `scale` on an SVG `<g>` scales from the element box center and shifts the point | grow the radius (`r` + CSS `transition`), don't scale the group |
| Graph nodes never appear | `whileInView` on an element with `scale: 0` has zero size and never enters view | drive entrance from the parent (`whileInView` on `<svg>`, children only `variants`) |
| "attribute r/cx/x2: Expected length, undefined" | `motion.circle`/`motion.line` animating geometry attributes; static values don't always help | geometry (`cx`, `cy`, `r`, `x2`) as plain attributes on plain SVG elements + CSS `transition`; `motion.line` only for `pathLength` and `opacity` |
| Slider has no screen-reader name | `aria-label` on `Slider.Root`, but `Slider.Thumb` has the `slider` role | `aria-label` on `Slider.Thumb` |
| Page crashes after notebook change during `npm run dev` | generated cell JSON older than the notebook | `npm run sync`; access cells via `NB[...]` with a fallback |
| Hydration mismatch warning on `<body>` | browser extensions (e.g. Grammarly) add attributes | `suppressHydrationWarning` only on `<body>` |
| Next warning about `scroll-behavior: smooth` | missing attribute on `<html>` | `data-scroll-behavior="smooth"` on `<html>` |
| Emoji as empty squares | font without emoji glyphs | emoji fonts at the end of `--font-sans`; emoji only where they carry information |
| White button text below WCAG AA | `brand-500` with white is 3.9:1 | `primary` background (`brand-600`), hover via `brightness-110` |
| Terminal table columns misalign on phone | `whitespace-pre-wrap` wraps table rows | `Terminal wrap={false}`: `whitespace-pre` and horizontal scroll |
| Points of one group merge into one on a 2D plot | shared PCA over many groups: largest variance is between groups | projection computed for the chosen group; for 3 points an exact drawing (triangle from distances) |
| Continuous animation distracts and loads CPU | constant 3D camera rotation | continuous animation off by default, start/stop button |

## Navigation

- `PresenterKeys` (in layout): ← → and PageUp/PageDown jump between `data-slide` elements; ↑ ↓ and Space scroll normally.
- `data-slide` elements have `scroll-mt-*` larger than the navbar height so the heading isn't hidden under it.
- Breadcrumbs (`Breadcrumbs`) on every subpage; none on the home page.
