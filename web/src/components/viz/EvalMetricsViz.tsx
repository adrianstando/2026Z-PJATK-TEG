"use client";

import { motion, useReducedMotion } from "motion/react";
import steps from "@/data/rag-steps.json";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";

const METHODS = ["wektory", "BM25", "hybryda", "rerank"] as const;
const EV = steps.eval;
const PER = 4;
const GROUPS = Math.ceil(EV.length / PER);
const LABELS = [
  ...Array.from({ length: GROUPS }, (_, g) => `pytania ${g * PER + 1}–${Math.min((g + 1) * PER, EV.length)}: pozycja właściwego dokumentu w rankingu`),
  "hit@1 = odsetek pozycji 1; MRR = średnia z 1/pozycja",
];

/**
 * Organizm: hit@1 i MRR liczone na oczach: kolejne pytania dopisują pozycję właściwego dokumentu
 * dla czterech metod, a sumy rosną na żywo. Dane: scripts/generate_rag_steps.py (te same 16 pytań co w notebooku).
 */
export function EvalMetricsViz() {
  const st = useStepper(LABELS.length);
  const reduce = useReducedMotion();
  const n = Math.min((st.step + 1) * PER, EV.length);
  const seen = EV.slice(0, n);
  const stat = (m: (typeof METHODS)[number]) => {
    const r = seen.map((e) => (e.ranks as Record<string, number | null>)[m]);
    return { hit: r.filter((x) => x === 1).length / r.length, mrr: r.reduce<number>((s, x) => s + (x ? 1 / x : 0), 0) / r.length };
  };

  return (
    <div ref={st.ref} className="space-y-4">
      <StepControls stepper={st} label={LABELS[st.step]} labels={LABELS} />
      <Panel className="overflow-x-auto p-4 md:p-5">
        <table className="w-full min-w-[34rem] font-mono text-xs">
          <thead>
            <tr className="text-left text-fg-subtle">
              <th className="pb-2 font-normal">pytanie</th>
              {METHODS.map((m) => (
                <th key={m} className="w-20 pb-2 text-center font-normal">
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {seen.map((e, i) => (
              <motion.tr key={e.q} initial={reduce ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reduce ? 0 : (i % PER) * 0.1 }} className="border-t border-[var(--line)]">
                <td className="max-w-0 truncate py-1.5 pr-3 font-sans text-fg-muted">{e.q}</td>
                {METHODS.map((m) => {
                  const r = (e.ranks as Record<string, number | null>)[m];
                  return (
                    <td key={m} className="text-center">
                      <span className={cn("inline-block w-12 rounded px-1 tabular-nums", r === 1 ? "bg-hit/15 text-hit" : r ? "bg-focus/15 text-focus" : "bg-miss/15 text-miss")}>{r ? `#${r}` : "—"}</span>
                    </td>
                  );
                })}
              </motion.tr>
            ))}
          </tbody>
          <tfoot>
            {(["hit", "mrr"] as const).map((k) => (
              <tr key={k} className="border-t border-[var(--line-strong)] text-fg">
                <td className="py-1.5">
                  {k === "hit" ? "hit@1" : "MRR"} <span className="text-fg-subtle">({n} pytań)</span>
                </td>
                {METHODS.map((m) => (
                  <td key={m} className={cn("text-center tabular-nums", st.step === LABELS.length - 1 && "text-focus")}>
                    {stat(m)[k].toFixed(k === "hit" ? 2 : 3)}
                  </td>
                ))}
              </tr>
            ))}
          </tfoot>
        </table>
      </Panel>
      <p className="font-mono text-[0.7rem] text-fg-subtle">
        <span className="text-hit">#1</span> trafienie na pierwszym miejscu · <span className="text-focus">#2+</span> dalej · pozycja dokumentu = pierwszy jego chunk w rankingu
      </p>
    </div>
  );
}
