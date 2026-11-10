"use client";

import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import steps from "@/data/rag-steps.json";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";

const LABELS = [
  "rekord w Chroma: id + tekst + wektor + metadane",
  "zapytanie: odległość 1 − cos do każdego rekordu, rosnąco",
  "where = {rok ≥ 2025}: rekordy z 2024 odpadają przed wyborem k",
  "top-3 z rekordów, które przeszły filtr",
];

/**
 * Organizm: Chroma od środka. Rekord ma cztery pola; zapytanie sortuje rekordy po odległości,
 * filtr `where` wygasza nieaktualne wersje, zostaje top-k. Dane: scripts/generate_rag_steps.py.
 */
export function ChromaRecordsViz() {
  const st = useStepper(LABELS.length);
  const reduce = useReducedMotion();
  const recs = steps.chroma.records;
  const shown = st.step === 0 ? recs.slice(0, 1) : recs;
  const passed = recs.filter((r) => r.rok >= 2025).slice(0, 3).map((r) => r.id);

  return (
    <div ref={st.ref} className="space-y-4">
      <StepControls stepper={st} label={LABELS[st.step]} labels={LABELS} />
      <Panel className="p-4 md:p-6">
        {st.step >= 1 && <p className="mb-3 font-mono text-xs text-focus">query: „{steps.chroma.q}”</p>}
        <div className="overflow-x-auto">
          <LayoutGroup>
            <div className="min-w-[44rem] space-y-2">
              <div className="grid grid-cols-[4rem_10rem_1fr_9rem_7rem] gap-3 px-3 font-mono text-[0.7rem] uppercase tracking-wider text-fg-subtle">
                <span>{st.step >= 1 ? "1 − cos" : ""}</span>
                <span>id</span>
                <span>tekst</span>
                <span>wektor</span>
                <span>metadane</span>
              </div>
              {shown.map((r, i) => {
                const out = st.step >= 2 && r.rok < 2025;
                const win = st.step >= 3 && passed.includes(r.id);
                return (
                  <motion.div
                    layout={!reduce}
                    key={r.id}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: out ? 0.35 : st.step >= 3 && !win ? 0.55 : 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : st.step === 1 ? i * 0.08 : 0 }}
                    className={cn("grid grid-cols-[4rem_10rem_1fr_9rem_7rem] items-center gap-3 rounded-xl border px-3 py-2.5 text-sm", win ? "border-hit/50 bg-hit/[0.08]" : out ? "border-miss/40" : "border-[var(--line)]")}
                  >
                    <span className="font-mono text-xs tabular-nums text-fg-subtle">{st.step >= 1 ? r.dist.toFixed(3) : ""}</span>
                    <span className={cn("font-mono text-xs", win ? "text-hit" : out ? "text-miss line-through" : "text-fg")}>{r.id}</span>
                    <span className="line-clamp-2 text-xs leading-snug text-fg-muted">{r.text}</span>
                    <span className="font-mono text-[0.7rem] text-brand-300">[{r.vec.map((v) => v.toFixed(2)).join(", ")}, …]</span>
                    <span className="font-mono text-[0.7rem] leading-tight text-fg-muted">
                      dział: {r.dzial}
                      <br />
                      <span className={cn(st.step >= 2 && (out ? "text-miss" : "text-hit"))}>rok: {r.rok}</span>
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
      </Panel>
    </div>
  );
}
