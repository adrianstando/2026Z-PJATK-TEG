"use client";

import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";
import { PARALLEL as RUN } from "@/content/lesson03/snippets";

// pierwszy krok pętli, w którym model poprosił o więcej niż jedno narzędzie
const STEP = RUN.find((e) => e.kind === "act" && RUN.filter((x) => x.step === e.step && x.kind === "act").length > 1)?.step ?? 1;
const ACTS = RUN.filter((e) => e.step === STEP && e.kind === "act");
const OBS = RUN.filter((e) => e.step === STEP && e.kind === "observe");
const IN = RUN.find((e) => e.step === STEP)?.tokens ?? 0;
const OUT = RUN.find((e) => e.step === STEP + 1)?.tokens ?? 0;

const STEPS = [
  `wywołanie modelu ${STEP}: historia + definicje narzędzi`,
  `jedna odpowiedź, ${ACTS.length} prośby o narzędzia naraz`,
  "aplikacja wykonuje wszystkie (mogą działać równolegle)",
  `wywołanie ${STEP + 1}: model dostaje wszystkie wyniki naraz`,
];

/** Organizm: równoległe wywołania narzędzi w jednym kroku pętli. Dane: web:parallel. */
export function ParallelCallsViz({ model }: { model: string }) {
  const st = useStepper(STEPS.length, { interval: 1800 });
  const { ref, step } = st;
  const box = (on: boolean, active: boolean) =>
    cn("rounded-xl border p-3 text-sm transition-all duration-500", active ? "border-focus/60 bg-focus/[0.06]" : "border-[var(--line)]", !on && "opacity-20");
  if (ACTS.length < 2) return null;
  return (
    <div ref={ref}>
      <Panel className="space-y-4 p-4 md:p-5">
        <div className="grid items-center gap-3 lg:grid-cols-[0.8fr_2.4fr_0.8fr]">
          <div className={box(true, step === 0)}>
            <p className="font-mono text-xs uppercase tracking-wider text-brand-300">model · wywołanie {STEP}</p>
            <p className="mt-1 font-mono text-xs tabular-nums text-fg-subtle">wysłano {IN} tok.</p>
          </div>
          <div className="space-y-2">
            {ACTS.map((a, i) => (
              <div key={i} className="grid gap-2 sm:grid-cols-2">
                <div className={box(step >= 1, step === 1)}>
                  <p className="font-mono text-[0.7rem] uppercase tracking-wider text-brand-300">action {i + 1}</p>
                  <p className="mt-1 break-words font-mono text-xs text-fg">{a.text}</p>
                </div>
                <div className={box(step >= 2, step === 2)}>
                  <p className="font-mono text-[0.7rem] uppercase tracking-wider text-brand-300">observation {i + 1}</p>
                  <p className="mt-1 break-words text-xs text-fg-muted">{OBS[i]?.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={box(step >= 3, step === 3)}>
            <p className="font-mono text-xs uppercase tracking-wider text-brand-300">model · wywołanie {STEP + 1}</p>
            <p className="mt-1 font-mono text-xs tabular-nums text-fg-subtle">wysłano {OUT} tok.</p>
          </div>
        </div>
        <StepControls stepper={st} label={STEPS[step]} className="min-h-[3rem] items-start" />
      </Panel>
      <p className="mt-2 font-mono text-[0.7rem] text-fg-subtle">{model} · krok {STEP} z zapisanego przebiegu react(parallel=True)</p>
    </div>
  );
}
