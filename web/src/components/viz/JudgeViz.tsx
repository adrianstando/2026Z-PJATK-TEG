"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { JudgeCase } from "@/content/lesson02/snippets";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";

function Verdict({ label, v, expected, show }: { label: string; v: number; expected?: number; show: boolean }) {
  const ok = expected === undefined || expected === v;
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-center transition-colors", !show ? "border-[var(--line)]" : v ? "border-hit/50 bg-hit/[0.08]" : "border-miss/50 bg-miss/[0.08]")}>
      <p className="text-xs uppercase tracking-wider text-fg-subtle">{label}</p>
      <p className={cn("mt-1 font-mono text-2xl", !show ? "text-fg-subtle" : v ? "text-hit" : "text-miss")}>{show ? v : "?"}</p>
      {expected !== undefined && <p className={cn("font-mono text-[0.7rem]", show ? (ok ? "text-hit" : "text-miss") : "text-fg-subtle")}>oczekiwane {expected}{show ? (ok ? " ✓" : " ✗") : ""}</p>}
    </div>
  );
}

/**
 * Organizm: LLM jako sędzia na prawdziwych wynikach notebooka (web:judge, web:judge-control).
 * Każdy przypadek w dwóch krokach: odpowiedź do oceny, potem werdykt F (wierność) i C (poprawność).
 */
export function JudgeViz({ cases, model }: { cases: JudgeCase[]; model: string }) {
  const st = useStepper(Math.max(cases.length * 2, 1));
  const reduce = useReducedMotion();
  const c = cases[Math.floor(st.step / 2)];
  const show = st.step % 2 === 1;
  if (!c) return null;
  const labels = cases.flatMap((x) => [`${x.name}: odpowiedź do oceny`, `${x.name}: werdykt sędziego`]);
  return (
    <div ref={st.ref} className="space-y-4">
      <StepControls stepper={st} label={labels[st.step]} labels={labels} />
      <AnimatePresence mode="wait">
        <motion.div key={c.name} initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
          <Panel className="grid gap-5 p-5 md:grid-cols-[1fr_18rem] md:p-6">
            <div className="space-y-3 text-sm">
              <p className="font-mono text-xs uppercase tracking-wider text-focus">{c.name}</p>
              <p className="text-fg-muted">
                <span className="text-fg-subtle">pytanie: </span>
                {c.question}
              </p>
              <p className="font-mono text-xs text-fg-subtle">kontekst: {c.context}</p>
              <p className="rounded-lg border border-[var(--line)] bg-ink-950/50 p-3 text-base leading-relaxed">{c.answer}</p>
              {show && (
                <motion.p initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-fg-muted">
                  <span className="text-fg-subtle">uzasadnienie ({model}): </span>
                  {c.reason}
                </motion.p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 self-start">
              <Verdict label="wierność F" v={c.got[0]} expected={c.expected?.[0]} show={show} />
              <Verdict label="poprawność C" v={c.got[1]} expected={c.expected?.[1]} show={show} />
            </div>
          </Panel>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
