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
| Page 2–3× wider than phone screen, code and charts run off the right edge | grid items default to `min-width: auto`, so a long code line or fixed-column chart row widens the column | global `.grid > * { min-width: 0 }` in `globals.css`; long content scrolls inside its own block |
| Phone heats up, scroll stutters, white flashes on iPhone | screen-sized layers with `filter: blur(140px)` animated forever, `backdrop-filter` on every panel, `filter: blur` in `Reveal` | glows as `radial-gradient`, static; no `backdrop-filter` except the navbar; entrance = opacity + y only; no `repeat: Infinity` on phones |
| Square corner sticks out of a rounded card in Safari | blurred child inside `overflow-hidden` + rounded parent with a transform | gradient instead of a blurred element |
| `BackgroundMesh` invisible | background set on both `html` and `body`; `body` paints over the `-z-10` layer | background only on `html` (also covers iOS overscroll) |
| SVG labels unreadable on phone | 1000-unit `viewBox` scaled to ~300 px | separate narrow layout via `useNarrow()` (`lib/useMediaQuery.ts`): taller `viewBox`, larger font units, captions below the drawing instead of absolute overlays |
| Page jumps while stepping an animation; Next button moves away from the cursor | a step adds content, so a card or the step label grows | `StableHeight` (molecule) around the changing content with all variants, `labels` on `StepControls`; no fixed `h-*`/`min-h-*` in rem (they fit one width only and leave empty cards on others). One state much longer than the rest (e.g. a full CREATE) does not belong in the animation: show it statically below. Check by stepping and comparing the slide height at 1440, 720 and 390 px |
| SVG labels huge on a wide screen and tiny in a narrow column, different from slide text | font size in viewBox units scales with the drawing width | `useSvgPx(viewBoxW)` (`lib/useSvgPx.ts`): `px(15, fallback)` gives the viewBox size that is 15 screen px; clamp between a readable minimum and the slide text size (`SmallGraph`: names 12–15 px, labels 10–11.5 px; `ReplayFlow`: max 17 px); do not switch to the phone layout by measured width (the vertical layout is huge on desktop columns) |
| Table or column shifts sideways when stepping; a scrollbar appears/disappears | content of a fixed-height `overflow-auto` panel crosses the height limit in some steps | `[scrollbar-gutter:stable]` on every fixed-height scrolling panel |
| Highlighted chip next to a two-line description is two lines tall | flex item stretches to row height | `items-start` on the row, `self-start` on the chip |
| Last chip/tab alone in the second row on a wide screen | `flex-wrap` with 9 items | grid with half the items per row at `xl` (`xl:grid xl:grid-cols-5`: 5 + 4) |
| Empty strip at the bottom of a card, or card much taller than its text | height reserved inside the card for a longer state | reserve outside the card (`self-start` / `StableHeight mode="hug"`) so the card hugs its content; never stretch content (`justify-between`) to fill |
| Page jumps when switching tabs/views (ToggleGroup) | views have different heights and are mounted one at a time | render all views in one grid cell (`grid [&>*]:col-start-1 [&>*]:row-start-1`), inactive ones `invisible` + `inert`, each view `self-start`: the slide reserves the tallest height, the shorter card keeps its own height and the slide background shows below it (`GraphModelViz`) |
| Highlighted code line ends before the line does when scrolled sideways | line background is limited to the visible width of `pre` | `code` as `inline-block` with `min-width: 100%`, so `.line.hl` width follows the longest line (`globals.css`); `.line` must stay inline, otherwise the newlines between lines double the spacing |

## Navigation

- `PresenterKeys` (in layout): ← → and PageUp/PageDown jump between `data-slide` elements; ↑ ↓ and Space scroll normally.
- `data-slide` elements have `scroll-mt-*` larger than the navbar height so the heading isn't hidden under it.
- Breadcrumbs (`Breadcrumbs`) on every subpage; none on the home page.
