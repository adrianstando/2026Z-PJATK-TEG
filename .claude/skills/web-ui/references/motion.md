# Animation (`motion/react`)

## Principle

Motion must **show the process** being taught. Examples from the repo:

- `EmbeddingSpace`: points start at the center and spread to their places, because the model lays words out in space.
- `VectorSearchViz`: query drops in → lines to **all** documents (scan) → only top-k lines remain → list re-sorts with `layout`. Three phases = three algorithm steps.
- `SamplingViz`: probability bars spring on temperature, top-k and top-p changes; rejected tokens fade.

If an animation can't answer "which process step does it show?", remove it.

## Patterns

| Need | How |
|---|---|
| section / block entrance | `<Reveal delay={0.1…0.4}>` (opacity + y + blur, once) |
| list appears item by item | parent `variants={{ show: { transition: { staggerChildren: 0.06 } } }}`, children `hidden/show` (see `Terminal`) |
| number / bar changes value | `animate={{ width: \`${p * 100}%\` }}` + `transition={{ type: "spring", stiffness: 120, damping: 20 }}` |
| drawing a line / edge | `motion.line` / `motion.path` with `initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}`; **always also set static x1/y1/x2/y2** |
| list reorder | `<LayoutGroup>` + `motion.li layout` |
| sliding tab / pill | `layoutId="…"` on the active element background (see `CodeTabs`) |
| stepwise process | `phase` state + `setTimeout` in a `useEffect` depending on in-view (see `VectorSearchViz`) |
| start only when visible | `useInView(ref, { once: true, margin: "-20% 0px" })` |
| background parallax | `useScroll` + `useTransform` (only `BackgroundMesh`) |

## Parameters

- Entrances: `duration 0.7–0.9`, ease `[0.16, 1, 0.3, 1]`.
- Data springs: `stiffness 70–200`, `damping 14–20`.
- Stagger: 0.03–0.08 s per item; total under ~1.5 s.
- `prefers-reduced-motion`: `useReducedMotion()` → `initial={false}`; global CSS shortens the rest.

## Pitfalls

Known animation and SVG bugs are in [responsive-and-pitfalls.md](responsive-and-pitfalls.md).
