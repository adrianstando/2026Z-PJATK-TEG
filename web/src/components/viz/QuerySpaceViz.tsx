"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ToggleGroup } from "radix-ui";
import steps from "@/data/rag-steps.json";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { useNarrow } from "@/lib/useMediaQuery";

const LAYOUT = {
  wide: { W: 1000, H: 560, PAD: 40, dot: 7, hit: 11, label: 15, q: 17 },
  narrow: { W: 560, H: 640, PAD: 28, dot: 8, hit: 12, label: 19, q: 21 },
};
export const DEPT_COLOR: Record<string, string> = {
  HR: "var(--color-cat-1)",
  IT: "var(--color-cat-2)",
  Produkt: "var(--color-cat-4)",
  Finanse: "var(--color-cat-3)",
  Prawo: "var(--color-brand-300)",
  Administracja: "var(--color-fg-subtle)",
};
const K = 3;
const LABELS = [
  "60 chunków w przestrzeni embeddingów; kolor = dział",
  "pytanie zamienione na wektor (768 liczb)",
  "wektor pytania ląduje między chunkami",
  `cosinus z każdym chunkiem → ${K} najbliższe`,
];

/**
 * Organizm: pytanie → embedding → punkt w przestrzeni chunków → top-k sąsiedzi.
 * Rzut t-SNE liczony offline razem dla chunków i pytań (scripts/generate_rag_steps.py);
 * top-k wyznacza cosinus na pełnych wektorach, rzut pokazuje tylko sąsiedztwo.
 */
export function QuerySpaceViz() {
  const st = useStepper(LABELS.length);
  const reduce = useReducedMotion();
  const [qi, setQi] = useState(0);
  const L = useNarrow() ? LAYOUT.narrow : LAYOUT.wide;
  const query = steps.space.queries[qi];
  const top = query.top.slice(0, K);
  const topIds = new Set(top.map((t) => t.id));
  const px = (x: number) => L.PAD + x * (L.W - 2 * L.PAD);
  const py = (y: number) => L.PAD + y * (L.H - 2 * L.PAD);
  const pos = new Map(steps.space.points.map((p) => [p.id, { x: px(p.x), y: py(p.y) }]));
  const q = { x: px(query.x), y: py(query.y) };

  return (
    <div ref={st.ref} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup.Root type="single" value={String(qi)} onValueChange={(v) => v && (setQi(Number(v)), st.go(Math.min(st.step, 1)))} className="flex flex-wrap gap-2" aria-label="Pytanie">
          {steps.space.queries.map((x, i) => (
            <ToggleGroup.Item key={i} value={String(i)} className="rounded-full border border-[var(--line-strong)] px-3.5 py-1.5 text-left text-sm text-fg-muted transition-all hover:text-fg data-[state=on]:border-focus data-[state=on]:bg-focus/10 data-[state=on]:text-focus">
              {x.q}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>
      <StepControls stepper={st} label={LABELS[st.step]} labels={LABELS} />
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <Panel className="p-2">
          <svg viewBox={`0 0 ${L.W} ${L.H}`} className="h-auto w-full" role="img" aria-label="Pytanie w przestrzeni chunków">
            {st.step >= 3 &&
              top.map((t, i) => (
                <motion.line key={`${qi}-${t.id}`} x1={q.x} y1={q.y} x2={pos.get(t.id)!.x} y2={pos.get(t.id)!.y} stroke="var(--color-hit)" strokeWidth={3 - i * 0.6} initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: i * 0.15 }} />
              ))}
            {steps.space.points.map((p) => {
              const hit = st.step >= 3 && topIds.has(p.id);
              const c = pos.get(p.id)!;
              return (
                <g key={p.id} opacity={st.step >= 3 && !hit ? 0.35 : 1} style={{ transition: "opacity 400ms" }}>
                  <circle cx={c.x} cy={c.y} r={hit ? L.hit : L.dot} fill={DEPT_COLOR[p.dzial]} style={{ transition: "r 300ms" }} />
                  {hit && <circle cx={c.x} cy={c.y} r={L.hit + 6} fill="none" stroke="var(--color-hit)" strokeWidth={2.5} />}
                </g>
              );
            })}
            {st.step >= 2 && (
              <motion.g key={`q-${qi}`} initial={reduce ? false : { opacity: 0, y: -60 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 160, damping: 16 }}>
                <circle cx={q.x} cy={q.y} r={L.hit} fill="var(--color-focus)" />
                <text x={q.x} y={q.y - L.hit - 8} textAnchor="middle" className="fill-focus font-mono font-semibold" style={{ fontSize: L.q }}>
                  pytanie
                </text>
              </motion.g>
            )}
          </svg>
        </Panel>
        <Panel className="p-5">
          {st.step === 0 && (
            <ul className="space-y-2 text-sm">
              {Object.entries(DEPT_COLOR).map(([d, c]) => (
                <li key={d} className="flex items-center gap-2 text-fg-muted">
                  <span className="size-3 rounded-full" style={{ background: c }} /> {d}
                </li>
              ))}
            </ul>
          )}
          {st.step >= 1 && st.step < 3 && (
            <div className="space-y-3">
              <p className="text-focus">„{query.q}”</p>
              <motion.p key={qi} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="break-all font-mono text-sm text-brand-300">
                [{query.vec.map((v) => v.toFixed(3)).join(", ")}, …]
              </motion.p>
              <p className="font-mono text-xs text-fg-subtle">embeddinggemma · 768 wymiarów</p>
            </div>
          )}
          {st.step === 3 && (
            <ol className="space-y-2">
              {top.map((t, i) => (
                <motion.li key={`${qi}-${t.id}`} initial={reduce ? false : { opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }} className="flex items-baseline justify-between gap-2 rounded-lg border border-hit/40 bg-hit/[0.07] px-3 py-2">
                  <span className="font-mono text-xs text-hit">
                    {i + 1}. {t.id}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-fg-muted">cos {t.cos.toFixed(3)}</span>
                </motion.li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
      <p className="font-mono text-[0.7rem] text-fg-subtle">rzut t-SNE (metryka cosinusowa): zachowuje sąsiedztwo, nie odległości; ranking liczony na pełnych wektorach</p>
    </div>
  );
}
