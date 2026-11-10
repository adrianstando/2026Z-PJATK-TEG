"use client";

import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import steps from "@/data/rag-steps.json";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";

const R = steps.rrf;
const K = 60;
const LABELS = ["dwie listy: wektory i BM25 (tylko chunki z wynikiem > 0)", `każda pozycja daje 1/(${K} + pozycja)`, "punkty tego samego chunku się sumują", "nowa kolejność według sumy"];

/** Organizm: Reciprocal Rank Fusion liczony na żywo z dwóch prawdziwych rankingów (scripts/generate_rag_steps.py). */
export function RrfStepsViz() {
  const st = useStepper(LABELS.length);
  const reduce = useReducedMotion();
  const score = (pos: number) => 1 / (K + pos);
  const fused = new Map<string, { v?: number; b?: number }>();
  R.vector.forEach((id, i) => fused.set(id, { ...fused.get(id), v: i + 1 }));
  R.bm25.forEach((id, i) => fused.set(id, { ...fused.get(id), b: i + 1 }));
  const rows = [...fused.entries()].map(([id, p]) => ({ id, ...p, sum: (p.v ? score(p.v) : 0) + (p.b ? score(p.b) : 0) }));
  const order = st.step >= 3 ? [...rows].sort((a, b) => b.sum - a.sum) : rows;
  const gold = (id: string) => id.startsWith(R.gold);

  const List = ({ title, ids }: { title: string; ids: string[] }) => (
    <Panel className="p-4">
      <p className="mb-3 text-sm font-medium">{title}</p>
      <ol className="space-y-1.5">
        {ids.map((id, i) => (
          <li key={id} className={cn("flex items-baseline justify-between gap-2 rounded-lg border px-2.5 py-1.5 font-mono text-xs", gold(id) ? "border-hit/50 text-hit" : "border-[var(--line)] text-fg-muted")}>
            <span className="min-w-0 truncate">
              {i + 1}. {id}
            </span>
            {st.step >= 1 && (
              <motion.span initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }} className="shrink-0 tabular-nums text-focus">
                {score(i + 1).toFixed(4)}
              </motion.span>
            )}
          </li>
        ))}
      </ol>
    </Panel>
  );

  return (
    <div ref={st.ref} className="space-y-4">
      <StepControls stepper={st} label={LABELS[st.step]} labels={LABELS} />
      <p className="font-mono text-xs text-focus">„{R.q}”</p>
      <div className="grid gap-4 lg:grid-cols-3">
        <List title="Wektory" ids={R.vector} />
        <List title="BM25" ids={R.bm25} />
        <Panel className={cn("p-4", st.step >= 2 ? "border-brand-400/50" : "opacity-40")}>
          <p className="mb-3 text-sm font-medium">RRF: suma</p>
          {st.step >= 2 && (
            <LayoutGroup>
              <ol className="space-y-1.5">
                {order.map((r, i) => (
                  <motion.li layout={!reduce} key={r.id} transition={{ type: "spring", stiffness: 160, damping: 20 }} className={cn("rounded-lg border px-2.5 py-1.5 font-mono text-xs", gold(r.id) ? "border-hit/50 bg-hit/[0.08] text-hit" : "border-[var(--line)] text-fg-muted")}>
                    <div className="flex justify-between gap-2">
                      <span>
                        {st.step >= 3 ? `${i + 1}. ` : ""}
                        {r.id}
                      </span>
                      <span className="tabular-nums text-fg">{r.sum.toFixed(4)}</span>
                    </div>
                    <div className="text-[0.65rem] text-fg-subtle">
                      {r.v ? `wekt. #${r.v}` : "—"} + {r.b ? `BM25 #${r.b}` : "brak w BM25"}
                    </div>
                  </motion.li>
                ))}
              </ol>
            </LayoutGroup>
          )}
        </Panel>
      </div>
    </div>
  );
}
