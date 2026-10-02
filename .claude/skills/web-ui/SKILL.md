---
name: web-ui
description: >
  How to build UI in web/ (Next.js, Tailwind v4, Radix, motion): where each component lives,
  how to add a slide, visualization or animation, how to check the look on projector and phone,
  and which known bugs to avoid. Use for every visual change in web/.
---

# web-ui

Visual identity (colors, typography, spacing, shapes, components) is defined in **[`.claude/DESIGN.md`](../../DESIGN.md)**, in [DESIGN.md](https://github.com/google-labs-code/design.md) format. This skill does not repeat tokens; it describes how to apply them in code.

## Stack

Next.js 16 (App Router, `output: "export"` to GitHub Pages) · React 19 · TypeScript strict · Tailwind CSS v4 · [Radix UI](https://www.radix-ui.com/primitives) (`radix-ui`) · `motion` (`motion/react`) · `lucide-react` · `shiki` (build-time syntax highlighting).

The site is static: no API routes, no model calls in the browser, no keys. Visualization data is computed by `web/scripts/generate_data.py` and saved to `web/src/data/`.

## Tokens in code

- `DESIGN.md` (YAML) → `web/src/app/globals.css` (`@theme` and `:root`) → Tailwind classes (`bg-ink-950`, `text-fg-muted`, `border-hit/40`) or `var(--color-…)` in SVG.
- Color consistency is checked by `web/scripts/check-design-tokens.mjs` before `dev` and `build`. File format: `npm run design:lint`.
- New color: first `DESIGN.md`, then `globals.css`, only then the component.

## Rules

1. **Only existing building blocks** ([references/components.md](references/components.md)): atoms `components/ui` → molecules `components/molecules` → organisms `components/viz|site|lesson|notebook` → pages `app/**/page.tsx`, which only compose organisms.
2. **Interactions via Radix** (Slider, ToggleGroup, Tabs), with `aria-label` on the element that has the role.
3. **Animation shows a process step** ([references/motion.md](references/motion.md)) and respects `prefers-reduced-motion`.
4. **Slide content** per [references/presentation.md](references/presentation.md); code and outputs from the notebook (skill `notebook-format`).
5. **Every change checked at 1440×900 and 390×844**, with an empty browser console ([references/responsive-and-pitfalls.md](references/responsive-and-pitfalls.md)).

## New lesson section

1. `web/src/app/zajecia/<slug>/page.tsx`: `<Slide id="…">`; `id` is a short slug used as anchor and arrow-key target.
2. `<SectionHeading eyebrow="NN · Topic" accent="Thesis" title="rest of sentence" lead="…" />`.
3. One main organism (visualization or code + terminal), each in `<Reveal delay={…}>`.
4. At most one `<Callout>`.
5. Agenda entry in the hero (link to `#id`).

## New visualization

[references/viz-recipe.md](references/viz-recipe.md).

## Check

```bash
cd web && npm run typecheck && npm run build && npx serve out
```

Screenshots (Playwright) at both resolutions, after animations finish (~5 s after the section enters the viewport).
