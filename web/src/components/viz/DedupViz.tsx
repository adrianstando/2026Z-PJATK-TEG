"use client";

import { Fragment } from "react";
import { LayoutGroup, motion } from "motion/react";
import data from "@/data/talentmatch.json";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";

const RAW = data.dedup.raw;
const byRaw = [...RAW].sort((a, b) => a.name.localeCompare(b.name));
const groups = [...new Set(RAW.map((r) => r.canon))].map((c) => ({ canon: c, items: RAW.filter((r) => r.canon === c) }));
const merged = new Set(groups.filter((g) => g.items.length > 1 || g.items[0].name !== g.canon).flatMap((g) => g.items.map((i) => i.name)));
const nCanon = groups.length;

const STEPS = [
  `${RAW.length} nazw umiejętności tak, jak zapisał je model w 14 CV (liczba = w ilu CV wystąpiła).`,
  `LLM dostaje listę unikalnych nazw i zwraca słownik nazw kanonicznych. Podświetlone: ${merged.size} nazw, które zmieniają zapis albo łączą się z inną.`,
  `Po zastosowaniu słownika: ${nCanon} węzłów :Skill. Zapytanie o Kubernetes widzi teraz wszystkie warianty zapisu.`,
];

/**
 * Organizm: deduplikacja encji. Surowe nazwy z ekstrakcji zlewają się w węzły kanoniczne
 * (K8s, k8s, Kubernetes → Kubernetes). Każdy chip ma layoutId, więc przesuwa się do swojej grupy.
 * Dane: extracted.json i słownik CANON z notebooka (scripts/generate_graph_data.py).
 */
export function DedupViz() {
  const s = useStepper(STEPS.length, { interval: 2000 });
  const chip = (r: (typeof RAW)[number], hl: boolean) => (
    <motion.span
      key={r.name}
      layoutId={`raw-${r.name}`}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[0.75rem] sm:text-xs",
        hl && merged.has(r.name) ? "border-focus/60 bg-focus/10 text-focus" : "border-[var(--line)] text-fg-muted",
      )}
    >
      {r.name}
      <span className="tabular-nums text-fg-subtle">{r.n}</span>
    </motion.span>
  );
  return (
    <div ref={s.ref}>
      <Panel className="space-y-4 p-5">
        <div className="flex items-baseline gap-3 font-mono">
          <span className="text-2xl tabular-nums text-fg">{s.step < 2 ? RAW.length : nCanon}</span>
          <span className="text-xs uppercase tracking-widest text-fg-subtle">{s.step < 2 ? "surowych nazw" : "węzłów :Skill"}</span>
        </div>
        {/* lista nazw i grupy mają różną wysokość: niewidoczna kopia grup w tej samej komórce siatki
            rezerwuje miejsce na wyższy widok, więc krok nie przesuwa strony i nie ma przewijania */}
        <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
        <div aria-hidden className="invisible">
          <div className="flex flex-wrap gap-1.5">{byRaw.map((r) => <span key={r.name} className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[0.75rem] sm:text-xs">{r.name}<span>{r.n}</span></span>)}</div>
        </div>
        <div aria-hidden className="invisible">
          <Groups chip={(r) => <span key={r.name} className="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[0.75rem] sm:text-xs">{r.name}<span>{r.n}</span></span>} />
        </div>
        <div className="self-start">
        <LayoutGroup>
          {s.step < 2 ? (
            <div className="flex flex-wrap gap-1.5">{byRaw.map((r) => chip(r, s.step === 1))}</div>
          ) : (
            <Groups chip={(r) => chip(r, true)} animate />
          )}
        </LayoutGroup>
        </div>
        </div>
        <StepControls stepper={s} label={STEPS[s.step]} labels={STEPS} />
      </Panel>
    </div>
  );
}

function Groups({ chip, animate }: { chip: (r: (typeof RAW)[number]) => React.ReactNode; animate?: boolean }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {groups.map((g) => {
        const cls = cn("rounded-lg border p-2", g.items.length > 1 ? "border-hit/50 bg-hit/[0.06]" : "border-[var(--line)]");
        const inner = (
          <>
            <p className={cn("mb-1 text-sm", g.items.length > 1 ? "text-hit" : "text-fg")}>{g.canon}</p>
            <div className="flex flex-wrap gap-1">{g.items.map((r) => <Fragment key={r.name}>{chip(r)}</Fragment>)}</div>
          </>
        );
        return animate ? (
          <motion.div layout key={g.canon} className={cls}>
            {inner}
          </motion.div>
        ) : (
          <div key={g.canon} className={cls}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
