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

## 3. Checklist

- [ ] Answers "which process step does the motion show?".
- [ ] Colors: `hit` for results, `focus` for the query or the control, `cat-*` for series. Nothing outside tokens.
- [ ] Controls via Radix (`Slider`, `ToggleGroup`, `Tabs`), with `aria-label`.
- [ ] Numbers `font-mono tabular-nums`.
- [ ] Works without JS on first render (SSR shows the initial state).
- [ ] Zero console errors (see pitfalls in `motion.md`).
- [ ] Entry in the organisms table in `components.md`.
