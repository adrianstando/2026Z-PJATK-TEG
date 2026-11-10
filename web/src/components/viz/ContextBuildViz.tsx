"use client";

import { motion } from "motion/react";
import { FileText, HardDrive } from "lucide-react";
import data from "@/data/lesson06-context.json";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";

const WHEN_COLOR: Record<string, string> = {
  start: "var(--color-cat-1)",
  zadanie: "var(--color-focus)",
  "na żądanie": "var(--color-hit)",
  praca: "var(--color-cat-4)",
};
const STEPS = data.steps;
const TOTAL = STEPS.reduce((s, x) => s + (x.tokens ?? 0), 0);
const fmt = (n: number) => n.toLocaleString("pl-PL");

/**
 * Organizm: jak Claude Code buduje kontekst w repo kursu. Na starcie trafia CLAUDE.md i same opisy skilli;
 * pełny SKILL.md, DESIGN.md i references dopiero wtedy, gdy zadanie ich wymaga. Dane: scripts/lesson06_data.py.
 */
export function ContextBuildViz() {
  const st = useStepper(STEPS.length, { interval: 1500 });
  const { ref, step, go } = st;
  const loaded = STEPS.slice(0, step + 1);
  const sum = loaded.reduce((s, x) => s + (x.tokens ?? 0), 0);
  return (
    <div ref={ref} className="space-y-4">
      <Panel className="p-4 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="font-mono text-xs text-fg-subtle">okno kontekstu: pliki wczytane do tej pory</span>
          <span className="font-mono text-sm tabular-nums text-fg">{fmt(sum)} tokenów</span>
        </div>
        <div className="mt-3 flex h-9 overflow-hidden rounded-lg bg-ink-950/60">
          {STEPS.map((s, i) =>
            s.tokens ? (
              <motion.div
                key={s.id}
                className={cn("h-full border-r border-ink-950", i === step && "brightness-125")}
                style={{ background: WHEN_COLOR[s.when] }}
                initial={false}
                animate={{ width: i <= step ? `${(s.tokens / TOTAL) * 100}%` : "0%" }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                title={`${s.label}: ${s.tokens}`}
              />
            ) : null,
          )}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[0.7rem] text-fg-subtle">
          {Object.entries(WHEN_COLOR).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1.5">
              <i className="size-2.5 rounded-sm" style={{ background: c }} /> {k}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ol className="space-y-1.5">
            {STEPS.map((s, i) => (
              <motion.li
                key={s.id}
                className={cn("flex items-center gap-3 rounded-lg border px-3 py-2 text-sm", i === step ? "border-brand-400 bg-brand-500/10" : "border-transparent")}
                initial={false}
                animate={{ opacity: i <= step ? 1 : 0.2, x: i <= step ? 0 : -6 }}
              >
                <i className="size-2.5 shrink-0 rounded-sm" style={{ background: WHEN_COLOR[s.when] }} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{s.label}</span>
                  <span className="block font-mono text-[0.7rem] text-fg-subtle">
                    {s.when}
                    {s.file ? ` · ${s.file}` : ""}
                  </span>
                </span>
                <span className="shrink-0 font-mono text-xs tabular-nums text-fg-muted">{s.tokens ? fmt(s.tokens) : "—"}</span>
              </motion.li>
            ))}
          </ol>
          <div>
            <p className="flex items-center gap-2 text-sm text-fg-muted">
              <HardDrive className="size-4" /> Na dysku, poza kontekstem
            </p>
            <ul className="mt-2 space-y-1.5">
              {data.notLoaded.map((f) => (
                <li key={f.file} className="flex items-center gap-2 rounded-lg border border-dashed border-[var(--line)] px-3 py-1.5 text-xs text-fg-subtle">
                  <FileText className="size-3.5 shrink-0" />
                  <span className="min-w-0 flex-1 truncate font-mono">{f.file.replace(".claude/skills/", "skills/")}</span>
                  <span className="font-mono tabular-nums">{fmt(f.tokens)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-fg-subtle">Skill notebook-format istnieje, ale zadanie dotyczy strony, więc w kontekście jest tylko jego opis.</p>
          </div>
        </div>
        <p className="mt-4 font-mono text-[0.7rem] text-fg-subtle">
          liczby: tokenizer {data.tokenizer} na plikach repo kursu; prompt systemowy i definicje narzędzi zależą od wersji narzędzia (nie liczone)
        </p>
      </Panel>
      <StepControls stepper={st} label={`${STEPS[step].when}: ${STEPS[step].label}`} labels={STEPS.map((x) => `${x.when}: ${x.label}`)} />
    </div>
  );
}
