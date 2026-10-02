# Components: atomic design

Atomic design (Brad Frost) splits UI into levels. Each level is built **only** from lower levels, so it's clear where to look and where to add.

```
atoms        components/ui/         domain-agnostic, 1 HTML element + styles
molecules    components/molecules/  a few atoms = one function (code block, card)
organisms    components/viz/        self-contained sections: visualizations, nav, hero
             components/site/
             components/lesson/
templates    components/site/Slide  board skeleton
pages        app/**/page.tsx        only compose organisms + content
```

## Atoms (`components/ui`)

| Component | When |
|---|---|
| `Badge` (`tone`: neutral/brand/hit/miss/focus) | status, activity type, short label |
| `Button` (`variant`: primary/ghost, `asChild`) | action; `asChild` + `<Link>`/`<a>` for navigation (Radix Slot) |
| `Panel` | every "glass" rectangle: card, window, visualization background |
| `Eyebrow` | section overline, always mono and uppercase |
| `Kbd` | keyboard shortcut |

## Molecules (`components/molecules`)

| Component | When |
|---|---|
| `SectionHeading` | **every** section starts with it |
| `CodeBlock` (async, server) | code; `highlight={[n]}` marks lines (1-based) |
| `CodeTabs` | same example in several variants (Radix Tabs, pill with `layoutId`) |
| `Terminal` | cell output; lines appear on entering viewport; `wrap={false}` for tables |
| `Callout` (`insight` / `warning`) | one takeaway or one pitfall; max 1 per slide |
| `LessonCard` | lesson tile on the home page |
| `Markdown` | repo README in site style (single source of truth) |
| `notebook/NotebookView` | `.ipynb` section by section: markdown, code, saved outputs, plots |

## Organisms

| Component | Shows |
|---|---|
| `viz/SamplingViz` | generation: temperature → top-k → top-p → sampling, table of successive generations |
| `viz/TokenizerViz` | text split by a real tokenizer (Radix ToggleGroup) |
| `viz/EmbeddingSpace` | words in 2D (t-SNE), neighbors computed on full vectors |
| `viz/VectorSpace3D` | two vectors in 3D (orthographic, rotating camera) and four measures: cosine, dot, L2, L1 |
| `viz/VectorSearchViz` | query → scan all vectors → top-k (computed live) |
| `viz/ContextSpace` | cat / dog / kitten in contexts, two models; triangle with exact distances (law of cosines) |
| `viz/MiniGraph` | knowledge graph drawn edge by edge, highlighted answer path |
| `viz/HeroConstellation` | home hero decoration from real embeddings |
| `viz/GradingBar` | 100 points as a segmented bar |
| `site/SiteNav`, `site/Breadcrumbs`, `site/Slide`, `site/PresenterKeys`, `site/BackgroundMesh` | page frame, breadcrumbs, keyboard navigation |
| `lesson/HeroTitle` | opening title with word animation |

## Writing a component

- Comment above it: **level + one sentence on its purpose** (`/** Molekuła: … */`, comments in Polish).
- `"use client"` only when state, effects or motion are needed. `CodeBlock` and pages stay server components.
- Minimal props. Instead of 10 flags, make a second component.
- Join classes with `cn()` from `lib/cn.ts`. Accept `className` for outside positioning.
- Interactions (slider, toggle, tabs, tooltip, dialog) always via a **Radix** primitive for free keyboard accessibility.
