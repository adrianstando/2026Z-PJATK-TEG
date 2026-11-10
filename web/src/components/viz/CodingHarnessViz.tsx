"use client";

import { motion } from "motion/react";
import { Archive, Brain, FileText, GitFork, History, Puzzle, Repeat, ShieldCheck, Wrench } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";

// Osiem elementów harnessu wokół modelu (siatka 3×3, model w środku). Kolejność kroków = kolejność opowiadania.
const PARTS = [
  { id: "loop", icon: Repeat, title: "Pętla", text: "model → narzędzie → wynik → model, aż model odpowie tekstem", cc: "limit tur, przerwanie Esc", area: "lg:col-start-2 lg:row-start-1" },
  { id: "tools", icon: Wrench, title: "Narzędzia", text: "definicje i wykonanie: czytanie i edycja plików, terminal, wyszukiwanie, web", cc: "Read, Edit, Bash, Grep, MCP", area: "lg:col-start-3 lg:row-start-1" },
  { id: "context", icon: FileText, title: "Kontekst", text: "prompt systemowy i pliki instrukcji projektu wczytywane na starcie", cc: "CLAUDE.md, rules/", area: "lg:col-start-3 lg:row-start-2" },
  { id: "skills", icon: Puzzle, title: "Skille", text: "instrukcje na konkretne zadanie; na starcie tylko opis, treść na żądanie", cc: ".claude/skills/", area: "lg:col-start-3 lg:row-start-3" },
  { id: "perm", icon: ShieldCheck, title: "Uprawnienia i hooki", text: "co wolno bez pytania; skrypty uruchamiane przy zdarzeniach", cc: "settings.json, hooki", area: "lg:col-start-2 lg:row-start-3" },
  { id: "sub", icon: GitFork, title: "Subagenci", text: "zadanie poboczne w osobnym kontekście, wraca tylko podsumowanie", cc: ".claude/agents/", area: "lg:col-start-1 lg:row-start-3" },
  { id: "memory", icon: History, title: "Pamięć", text: "notatki między sesjami i historia rozmów", cc: "auto memory, --resume", area: "lg:col-start-1 lg:row-start-2" },
  { id: "compact", icon: Archive, title: "Autokompakcja", text: "gdy kontekst się zapełnia, starsza część rozmowy zamienia się w streszczenie", cc: "/compact, auto-compact", area: "lg:col-start-1 lg:row-start-1" },
];

const LABELS = [
  "Sam model: tokeny na wejściu, tokeny na wyjściu. Nie czyta plików i nic nie uruchamia.",
  ...PARTS.map((p) => `${p.title}: ${p.text}.`),
];

/** Organizm: agent = model + harness. Osiem elementów harnessu pojawia się po kolei wokół modelu. */
export function CodingHarnessViz() {
  const st = useStepper(LABELS.length, { interval: 1700 });
  const { ref, step } = st;
  return (
    <div ref={ref} className="space-y-4">
      <Panel className="relative p-4 sm:p-6">
        <motion.div
          className="pointer-events-none absolute inset-2 rounded-[calc(var(--radius-card)-4px)] border-2 border-dashed border-brand-400/50"
          initial={false}
          animate={{ opacity: step >= 1 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
        />
        <motion.span
          className="absolute -top-3 left-6 rounded-full bg-ink-900 px-2 font-mono text-xs text-brand-300"
          initial={false}
          animate={{ opacity: step >= 1 ? 1 : 0 }}
        >
          harness
        </motion.span>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3">
          <div className="flex items-stretch sm:col-span-2 lg:col-span-1 lg:col-start-2 lg:row-start-2">
            <motion.div
              className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-focus/50 bg-focus/[0.08] px-6 py-5 text-center"
              initial={false}
              animate={{ scale: step === 0 ? 1.03 : 1 }}
              transition={{ type: "spring", stiffness: 140, damping: 16 }}
            >
              <Brain className="size-8 text-focus" />
              <p className="text-lg font-medium">Model</p>
              <p className="font-mono text-xs text-fg-subtle">tokeny → tokeny</p>
            </motion.div>
          </div>
          {PARTS.map((p, i) => {
            const on = step >= i + 1;
            const now = step === i + 1;
            return (
              <motion.div
                key={p.id}
                className={cn("rounded-xl border p-4 transition-colors", p.area, now ? "border-brand-400 bg-brand-500/10" : "border-[var(--line)] bg-ink-950/40")}
                initial={false}
                animate={{ opacity: on ? 1 : 0.12 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="flex items-center gap-2">
                  <p.icon className={cn("size-4", now ? "text-brand-300" : "text-fg-subtle")} />
                  <span className="font-medium">{p.title}</span>
                </div>
                <p className="mt-1.5 text-sm text-fg-muted">{p.text}</p>
                <p className="mt-2 font-mono text-xs text-fg-subtle">Claude Code: {p.cc}</p>
              </motion.div>
            );
          })}
        </div>
      </Panel>
      <StepControls stepper={st} label={LABELS[step]} labels={LABELS} />
    </div>
  );
}
