import cc from "@/data/lesson06-loop-claude.json";
import { Panel } from "@/components/ui/Panel";

type Step = { tool: string; arg: string; context: number };
type Run = { harness: string; model: string | null; steps: Step[]; inputTokens: number; seconds: number; acceptance: { passed: number; failed: number } };

const runs = (cc.runs as Record<string, unknown>).claude as Record<"bez" | "z", Run> | undefined;

const VARIANT = [
  { id: "bez", label: "bez konfiguracji" },
  { id: "z", label: "konfiguracja harnessu: AGENTS.md + skill" },
] as const;

const COLOR: Record<string, string> = {
  Glob: "text-fg-subtle",
  Grep: "text-fg-subtle",
  Read: "text-cat-1",
  Write: "text-cat-4",
  Edit: "text-cat-4",
  Bash: "text-focus",
  Skill: "text-hit",
};

// ścieżki z katalogów roboczych eksperymentu (claude-bez/app/... → app/...)
const clean = (a: string) => a.replace(/\/?(?:loop\/)?(?:claude|langchain)-(?:bez|z)\//g, "");

const k = (n: number) => (n >= 1e6 ? `${(n / 1e6).toLocaleString("pl-PL", { maximumFractionDigits: 2 })} mln` : `${Math.round(n / 1000)} tys.`);

function Column({ run, label, max }: { run: Run; label: string; max: number }) {
  return (
    <Panel className="flex h-full flex-col p-4">
      <p className="font-medium">{label}</p>
      <ol className="mt-3 space-y-1">
        {run.steps.map((s, i) => (
          <li key={i} className="grid grid-cols-[1.6rem_minmax(0,1fr)_4.5rem] items-center gap-2 font-mono text-xs">
            <span className="text-right text-fg-subtle tabular-nums">{i + 1}</span>
            <span className="truncate">
              <span className={COLOR[s.tool] ?? "text-fg"}>{s.tool}</span> <span className="text-fg-muted">{clean(s.arg)}</span>
            </span>
            <span className="relative h-3 overflow-hidden rounded bg-ink-950/60" title={`kontekst: ${s.context} tokenów`}>
              <span className="absolute inset-y-0 left-0 rounded bg-brand-500/70" style={{ width: `${(s.context / max) * 100}%` }} />
            </span>
          </li>
        ))}
      </ol>
      <div className="min-h-4 flex-1" />
      <div className="grid grid-cols-3 gap-2 border-t border-[var(--line)] pt-3 text-sm">
        <span>
          <span className="block font-mono text-xs text-fg-subtle">wywołania</span>
          {run.steps.length}
        </span>
        <span>
          <span className="block font-mono text-xs text-fg-subtle">tokeny łącznie</span>
          {k(run.inputTokens)}
        </span>
        <span>
          <span className="block font-mono text-xs text-fg-subtle">testy akceptacyjne</span>
          <span className={run.acceptance.failed === 0 && run.acceptance.passed > 0 ? "text-hit" : "text-miss"}>
            {run.acceptance.passed}/{run.acceptance.passed + run.acceptance.failed}
          </span>
        </span>
      </div>
    </Panel>
  );
}

/**
 * Organizm: to samo polecenie w większym projekcie w Claude Code, bez konfiguracji i z konfiguracją harnessu.
 * Statyczne listy wywołań narzędzi (pasek = kontekst modelu w danym kroku); podsumowanie na dole obu kolumn w jednej linii.
 * Dane: scripts/lesson06_experiments.py loop --harness claude.
 */
export function AgentLoopCompareViz() {
  if (!runs?.bez || !runs?.z) return null;
  const max = Math.max(...[...runs.bez.steps, ...runs.z.steps].map((s) => s.context), 1);
  return (
    <div className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-2">
        {VARIANT.map((v) => (
          <Column key={v.id} run={runs[v.id]} label={v.label} max={max} />
        ))}
      </div>
      <p className="font-mono text-xs text-fg-subtle">
        {runs.bez.model} · pasek = kontekst wysłany do modelu w danym kroku · tokeny łącznie = suma tokenów wejścia ze wszystkich kroków · testy akceptacyjne ukryte przed agentem
      </p>
    </div>
  );
}
