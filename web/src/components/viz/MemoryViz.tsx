"use client";

import { ArrowLeftRight, Database, HardDrive } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";
import { MEMORY, STORE_FACTS, STORE_TURNS, type MemoryTurn } from "@/content/lesson03/snippets";

const STEPS = [
  "wątek t1: użytkownik pisze, gdzie pracuje",
  "ten sam wątek t1: checkpointer dokłada historię, agent pamięta",
  "nowy wątek t2: pusta historia, agent tego nie wie",
  "ta sama rozmowa od nowa, ale agent ma teraz store",
  "wątek t1: użytkownik znów pisze, gdzie pracuje",
  "harness zapisuje fakt w store, poza historią wątku",
  "nowy wątek t2: pusta historia, ale agent czyta fakt ze store",
];
const STORE_ON = 3;

function Turn({ turn, active }: { turn: MemoryTurn; active: boolean }) {
  return (
    <div className="space-y-1.5">
      <p className={cn("ml-auto w-fit max-w-[90%] rounded-xl rounded-br-sm px-3 py-2 text-sm", active ? "bg-focus/15 text-fg" : "bg-[var(--panel-hi)] text-fg-muted")}>{turn.question}</p>
      <p className="w-fit max-w-[95%] rounded-xl rounded-bl-sm border border-[var(--line)] px-3 py-2 text-sm text-fg-muted">{turn.answer}</p>
    </div>
  );
}

function Thread({ id, turns, activeIndex, active, saved }: { id: string; turns: MemoryTurn[]; activeIndex: number; active: boolean; saved: boolean }) {
  return (
    <div className={cn("flex h-[20rem] flex-col rounded-xl border p-3 transition-colors duration-500 lg:h-[23rem]", active ? "border-focus/60" : "border-[var(--line)]")}>
      <p className="mb-3 font-mono text-xs text-brand-300">thread_id = „{id}”</p>
      <div className="min-h-0 flex-1 space-y-3 overflow-auto pr-1">
        {turns.map((t, i) => (
          <Turn key={t.question + i} turn={t} active={i === activeIndex} />
        ))}
        {!turns.length && <p className="font-mono text-xs text-fg-subtle">wątek jeszcze nie istnieje</p>}
      </div>
      <p className="mt-3 flex items-center gap-2 font-mono text-[0.7rem] text-fg-subtle">
        <HardDrive className="size-3.5 shrink-0" /> checkpointer: {saved ? "historia wątku zapisana" : "pusto"}
      </p>
    </div>
  );
}

/**
 * Organizm: ten sam scenariusz dwa razy. Najpierw sam checkpointer: nowy wątek nie zna faktów z poprzedniego.
 * Potem store: harness zapisuje fakt po rozmowie w t1, a t2 go odczytuje. Dane: web:memory, web:store.
 */
export function MemoryViz({ model }: { model: string }) {
  const st = useStepper(STEPS.length, { interval: 2200 });
  const { ref, step } = st;
  const withStore = step >= STORE_ON;
  const t1 = !withStore ? MEMORY.filter((m) => m.thread === "t1").slice(0, step + 1) : step >= 4 ? STORE_TURNS.slice(0, 1) : [];
  const t2 = !withStore ? (step >= 2 ? MEMORY.filter((m) => m.thread === "t2") : []) : step >= 6 ? STORE_TURNS.slice(1, 2) : [];
  const facts = step >= 5 ? STORE_FACTS : [];
  return (
    <div ref={ref}>
      <Panel className="space-y-4 p-4 md:p-5">
        <p className={cn("font-mono text-xs uppercase tracking-wider", withStore ? "text-focus" : "text-fg-subtle")}>{withStore ? "checkpointer + store" : "sam checkpointer"}</p>
        <div className="grid gap-3 lg:grid-cols-[1fr_14rem_1fr]">
          <Thread id="t1" turns={t1} activeIndex={withStore ? 0 : step} active={step <= 1 || step === 4} saved={t1.length > 0} />
          <div className={cn("flex h-44 flex-col rounded-xl border p-3 transition-all duration-500 lg:h-[23rem]", step === 5 || step === 6 ? "border-focus/60" : withStore ? "border-[var(--line-strong)]" : "border-dashed border-[var(--line)] opacity-50")}>
            <p className="mb-3 flex items-center gap-2 font-mono text-xs text-brand-300">
              <Database className="size-3.5 shrink-0" /> store
            </p>
            <div className="min-h-0 flex-1 space-y-2 overflow-auto">
              {!withStore && <p className="text-xs text-fg-subtle">agent nie ma pamięci długoterminowej</p>}
              {withStore && !facts.length && <p className="text-xs text-fg-subtle">pusto</p>}
              {facts.map((f) => (
                <p key={f} className="rounded-lg border border-hit/40 bg-hit/[0.07] px-2 py-1.5 text-xs text-hit">{f}</p>
              ))}
            </div>
            <p className="mt-3 flex items-center gap-2 font-mono text-[0.7rem] text-fg-subtle">
              <ArrowLeftRight className="size-3.5 shrink-0" />
              {step === 5 ? "zapis: remember" : step === 6 ? "odczyt: recall" : "wspólny dla wątków"}
            </p>
          </div>
          <Thread id="t2" turns={t2} activeIndex={0} active={step === 2 || step === 6} saved={t2.length > 0} />
        </div>
        <StepControls stepper={st} label={STEPS[step]} labels={STEPS} />
      </Panel>
      <p className="mt-2 font-mono text-[0.7rem] text-fg-subtle">{model} · InMemorySaver + InMemoryStore · zapisany wynik komórek web:memory i web:store</p>
    </div>
  );
}
