# Recipe: new visualization

Example: "hybrid search: BM25 + embeddings + rank fusion" for lesson 2.

## 1. Data: precompute, save JSON

In `web/scripts/generate_data.py` (or a separate script in `web/scripts/`) compute what's needed and save to `web/src/data/<name>.json`. Rules:

- real models (Ollama `embeddinggemma`, tiktoken, rank_bm25), no API keys,
- vectors rounded to 4 decimals (file size),
- 2D coordinates normalized to [0, 1],
- script docstring: run command and **why** this model/projection.

## 2. Component in `components/viz/`

```tsx
"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import data from "@/data/hybrid.json";
import { Panel } from "@/components/ui/Panel";

/** Organizm: <one sentence on the process it shows>. Dane: scripts/<script>. */
export function HybridSearchViz() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  // state = process step or a parameter the instructor controls
  ...
  return (
    <div ref={ref}>
      <Panel className="p-6 md:p-8">{/* SVG with viewBox or a grid */}</Panel>
    </div>
  );
}
```

## 3. Look and layout

Shared by all visualizations so slides look like one set.

- **Frame:** one `Panel` with the SVG; controls (Radix `ToggleGroup`) above the drawing; caption (model, metric, what distances mean) and legend **below** the SVG in normal flow, never as an absolute overlay on the drawing. Caption `font-mono text-[0.7rem] text-fg-subtle`.
- **Two layouts:** `const L = useNarrow() ? LAYOUT.narrow : LAYOUT.wide`. Wide ≈ `1000×640`, narrow taller and narrower (≈ `560×700`). Every size (font, point radius, padding) lives in `LAYOUT`, not in classes like `text-[19px]`.
- **Font sizes in viewBox units, chosen for the rendered size:** labels ≈ 16 px on the projector and ≈ 12 px on a phone. Rendered px = units × panel width ÷ viewBox width; check it against other visualizations on screenshots, not the number in code.
- **Point labels via `layoutLabels()`**: pass points, label font, point radius and `avoid` boxes (center element, ring labels). Do not hardcode label offsets.
- **Centering:** the drawing is centered horizontally in the panel. For a figure that changes shape, keep a meaningful element fixed on the vertical axis (e.g. the midpoint of the base segment), let the rest move.
- **Common scale across variants** (models, contexts, queries), so shapes can be compared; fit the scale to the largest variant with margins for labels.
- **Name the metric honestly:** exact distances (`√(2 − 2·cos)`, `1 − cos`) vs projections (t-SNE/PCA: neighborhoods only, distances approximate). Say which one in the toggle label or caption.
- **Do not repeat numbers in the drawing** if a side list already shows them (e.g. similarity values on short edges cluttered the center).
- **Colors:** `focus` = selected item / query, `hit` = results and the winning edge, `cat-1…4` = groups, `fg-subtle` + `line` for scale rings and secondary edges.

## 4. Checklist

- [ ] Answers "which process step does the motion show?".
- [ ] Colors: `hit` for results, `focus` for the query or the control, `cat-*` for series. Nothing outside tokens.
- [ ] Controls via Radix (`Slider`, `ToggleGroup`, `Tabs`), with `aria-label`.
- [ ] Numbers `font-mono tabular-nums`.
- [ ] Works without JS on first render (SSR shows the initial state).
- [ ] Zero console errors (see pitfalls in `motion.md`).
- [ ] Screenshots at 1440×900 and 390×844: labels readable and not overlapping, font size matches the other visualizations, drawing centered, page not wider than the screen.
- [ ] Entry in the organisms table in `components.md`.
