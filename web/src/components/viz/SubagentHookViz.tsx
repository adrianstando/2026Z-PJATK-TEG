"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ToggleGroup } from "radix-ui";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { StableHeight } from "@/components/molecules/StableHeight";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";
// Schemat (liczby tokenów poglądowe): GDZIE trafia praca subagentów i KTO uruchamia hook.
const AGENTS = [
  { name: "frontend", task: "strona zmiany hasła w Next.js", color: "var(--color-cat-2)" },
  { name: "backend", task: "endpoint POST /change-password i testy", color: "var(--color-cat-4)" },
  { name: "infra", task: "zmienna SECRET_KEY w Dockerfile i w CI", color: "var(--color-cat-3)" },
];
const SUB = [
  { main: 40, sub: [0, 0, 0], label: "Główna rozmowa: 40 tys. tokenów historii, plan funkcji „zmiana hasła” gotowy." },
  { main: 41, sub: [4, 4, 4], label: "Delegacja do trzech subagentów naraz: każdy dostaje własny kontekst (swój prompt, CLAUDE.md, polecenie)." },
  { main: 41, sub: [26, 31, 14], label: "Każdy subagent czyta swoje pliki i uruchamia testy we WŁASNYM kontekście; razem ponad 70 tys. tokenów." },
  { main: 43, sub: [26, 31, 14], label: "Do głównej rozmowy wracają trzy krótkie podsumowania. Główny kontekst urósł o 2 tys., nie o 70." },
];
const SUB_MAX = 45;
const HOOK = [
  { who: "model", text: "Edit(app.py): nowy endpoint POST /change-password", label: "Model proponuje edycję. Harness ją wykonuje." },
  { who: "harness", text: "PostToolUse · matcher Write|Edit → .claude/hooks/run-tests.sh", label: "Hook to zwykły skrypt uruchamiany przez harness po narzędziu. Model nie decyduje, czy się wykona." },
  { who: "hook", text: "exit 2 · stderr: FAILED test_login_after_password_change", label: "Kod wyjścia 2: treść stderr wraca do modelu jako informacja zwrotna." },
  { who: "model", text: "Edit(app.py): nowe hasło zapisywane jako hash", label: "Model poprawia kod, bo dostał konkretny błąd, a nie ogólną radę." },
  { who: "hook", text: "exit 0 · 14 passed", label: "Hook przechodzi. Regułę z CLAUDE.md model może pominąć, hook wykona się zawsze." },
];
const WHO: Record<string, string> = { model: "border-focus/50 text-focus", harness: "border-brand-400/50 text-brand-300", hook: "border-cat-4/50 text-cat-4" };

/** Organizm: subagent (osobny kontekst, wraca podsumowanie) i hook (deterministyczny skrypt harnessu) krok po kroku. */
export function SubagentHookViz() {
  const [mode, setMode] = useState<"sub" | "hook">("sub");
  return (
    <div className="space-y-4">
      <ToggleGroup.Root type="single" value={mode} onValueChange={(v) => v && setMode(v as "sub" | "hook")} className="inline-flex flex-wrap gap-1 rounded-xl border border-[var(--line)] p-1" aria-label="Mechanizm">
        {(
          [
            ["sub", "Subagent"],
            ["hook", "Hook"],
          ] as const
        ).map(([v, l]) => (
          <ToggleGroup.Item key={v} value={v} className="rounded-lg px-3 py-1.5 text-sm text-fg-muted transition-colors data-[state=on]:bg-brand-500 data-[state=on]:text-white">
            {l}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <StableHeight variants={[<Subagent key="s" />, <Hook key="h" />]} mode="hug">
        {mode === "sub" ? <Subagent /> : <Hook />}
      </StableHeight>
    </div>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-xs text-fg-subtle">
        <span>{label}</span>
        <span className="tabular-nums">{value ? `${value.toLocaleString("pl-PL")} tys.` : "—"}</span>
      </div>
      <div className="mt-1 h-7 overflow-hidden rounded-md bg-ink-950/60">
        <motion.div className="h-full rounded-md" style={{ background: color }} initial={false} animate={{ width: `${(value / max) * 100}%` }} transition={{ type: "spring", stiffness: 90, damping: 18 }} />
      </div>
    </div>
  );
}

function Subagent() {
  const st = useStepper(SUB.length, { interval: 1900 });
  const { ref, step } = st;
  const s = SUB[step];
  return (
    <div ref={ref} className="space-y-4">
      <Panel className="space-y-5 p-5 sm:p-6">
        <Bar label="kontekst głównej rozmowy" value={s.main} max={SUB_MAX} color="var(--color-cat-1)" />
        <div className="grid gap-3 md:grid-cols-3">
          {AGENTS.map((a, i) => (
            <motion.div key={a.name} initial={false} animate={{ opacity: step >= 1 ? 1 : 0.2 }} className="rounded-xl border border-dashed border-[var(--line-strong)] p-4">
              <p className="text-sm font-medium">subagent {a.name}</p>
              <p className="mb-3 text-sm text-fg-muted">{a.task}</p>
              <Bar label="jego kontekst" value={s.sub[i]} max={SUB_MAX} color={a.color} />
              <motion.p className="mt-3 font-mono text-xs text-hit" initial={false} animate={{ opacity: step >= 3 ? 1 : 0 }}>
                ↑ wraca podsumowanie, ok. 600 tokenów
              </motion.p>
            </motion.div>
          ))}
        </div>
        <p className="font-mono text-xs text-fg-subtle">schemat; liczby poglądowe</p>
      </Panel>
      <StepControls stepper={st} label={s.label} labels={SUB.map((x) => x.label)} />
    </div>
  );
}

function Hook() {
  const st = useStepper(HOOK.length, { interval: 1900 });
  const { ref, step } = st;
  return (
    <div ref={ref} className="space-y-4">
      <Panel className="space-y-2 p-5 sm:p-6">
        {HOOK.map((h, i) => (
          <motion.div
            key={i}
            className={cn("flex flex-col gap-1 rounded-lg border px-3 py-2 sm:flex-row sm:items-center sm:gap-3", i === step ? "bg-[var(--panel-hi)]" : "", WHO[h.who])}
            initial={false}
            animate={{ opacity: i <= step ? 1 : 0.12, x: i <= step ? 0 : -8 }}
          >
            <span className="w-20 shrink-0 font-mono text-xs uppercase">{h.who}</span>
            <span className={cn("font-mono text-xs sm:text-[0.8rem]", i === 2 ? "text-miss" : i === 4 ? "text-hit" : "text-fg")}>{h.text}</span>
          </motion.div>
        ))}
      </Panel>
      <StepControls stepper={st} label={HOOK[step].label} labels={HOOK.map((h) => h.label)} />
    </div>
  );
}
