"use client";

import { useState } from "react";
import { ToggleGroup } from "radix-ui";
import lc from "@/data/lesson06-ladder-langchain.json";
import cc from "@/data/lesson06-ladder-claude.json";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { StableHeight } from "@/components/molecules/StableHeight";
import { cn } from "@/lib/cn";

type Attack = { id: string; luka: boolean; detail: string };
type Run = {
  harness: string;
  model: string | null;
  steps: { tool: string; arg: string }[];
  inputTokens: number;
  outputTokens: number;
  costUsd?: number | null;
  seconds: number;
  tests: { passed: number; failed: number; summary: string };
  attack: Attack[];
  luki: number;
  app: string;
};

const HARNESS = [
  { id: "langchain", label: "nasz harness.py", runs: lc.runs.langchain as Record<string, Run> },
  { id: "claude", label: "Claude Code", runs: cc.runs.claude as Record<string, Run> },
] as const;
const LEVELS = lc.levels;

// Nazwy ataków z atak.py po ludzku (te same luki co na slajdzie „Vibe coding”).
const NAME: Record<string, string> = {
  "wyciek-odpowiedzi": "odpowiedzi w GET /tasks",
  "sql-injection": "SQL injection",
  "zaufanie-do-klienta": "zaufanie do klienta",
  "race-condition": "race condition",
  idor: "IDOR",
  "wyciek-hasel": "wyciek haseł",
  "sekret-w-kodzie": "sekret w kodzie",
  "brak-walidacji": "brak walidacji",
  "blad-500-zamiast-401": "500 zamiast 401",
  "brak-testow": "brak testów",
  "atak-nie-ruszyl": "aplikacja nie startuje",
};

// Linia w app.py, przy której widać lukę: kotwice tekstowe, bo każdy przebieg pisze inny kod.
const ANCHOR: Record<string, RegExp> = {
  "sekret-w-kodzie": /(SECRET|KEY)\w*\s*=.*["']/,
  "race-condition": /INSERT INTO submissions/i,
  "sql-injection": /f["'].*(SELECT|INSERT)/i,
  idor: /submissions.*WHERE.*id\s*=\s*\?/i,
  "wyciek-hasel": /md5|sha256\(/i,
  "zaufanie-do-klienta": /correct|points:\s*int/,
  "wyciek-odpowiedzi": /SELECT \* FROM tasks/i,
  "brak-walidacji": /task_id:\s*int/,
  "blad-500-zamiast-401": /jwt\.decode/,
};

function excerpt(app: string, id: string) {
  const lines = app.split("\n");
  const re = ANCHOR[id];
  const i = re ? lines.findIndex((l) => re.test(l)) : -1;
  if (i < 0) return null;
  const from = Math.max(0, i - 2);
  return { from, hl: i, lines: lines.slice(from, i + 3) };
}

const fmt = (n: number) => (n >= 1e6 ? `${(n / 1e6).toLocaleString("pl-PL", { maximumFractionDigits: 1 })} mln` : `${Math.round(n / 1000)} tys.`);

function Detail({ run, level }: { run: Run; level: (typeof LEVELS)[number] }) {
  const holes = run.attack.filter((a) => a.luka);
  const first = holes.map((h) => ({ h, ex: excerpt(run.app, h.id) })).find((x) => x.ex);
  const usedSkill = run.steps.filter((s) => /skill/i.test(s.tool)).map((s) => s.arg);
  return (
    <Panel className="space-y-4 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">
          {run.harness}, poziom {level.id}: {level.label}
        </span>
        <span className="text-sm text-fg-muted">({level.add})</span>
      </div>
      <p className="text-sm text-fg-muted">
        Model {run.model}: {run.steps.length} wywołań narzędzi, {fmt(run.inputTokens)} tokenów wejścia, {run.seconds} s.
        {usedSkill.length > 0 ? ` Wczytane skille: ${[...new Set(usedSkill)].join(", ")}.` : ""} Testy agenta: {run.tests.passed > 0 ? `${run.tests.passed} przechodzi` : "brak"}
        {run.tests.failed > 0 ? `, ${run.tests.failed} nie przechodzi` : ""}.
      </p>
      <ul className="grid gap-1 text-sm sm:grid-cols-2">
        {run.attack.map((a) => (
          <li key={a.id} className={cn("flex items-center gap-2", a.luka ? "text-miss" : "text-fg-muted")}>
            <i className={cn("size-2 shrink-0 rounded-full", a.luka ? "bg-miss" : "bg-hit")} />
            {NAME[a.id] ?? a.id}
            {a.luka && a.id !== "brak-testow" ? ": luka" : ""}
          </li>
        ))}
      </ul>
      {first?.ex && (
        <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-ink-950/60">
          <p className="border-b border-[var(--line)] px-3 py-1.5 font-mono text-xs text-fg-subtle">
            błędny kod · {NAME[first.h.id]} · app.py:{first.ex.hl + 1}
          </p>
          <pre className="overflow-x-auto py-2 font-mono text-xs leading-relaxed">
            {first.ex.lines.map((l, i) => (
              <span key={i} className={cn("block px-3 whitespace-pre", first.ex!.from + i === first.ex!.hl ? "bg-miss/15 text-fg" : "text-fg-muted")}>
                <span className="mr-3 inline-block w-7 text-right tabular-nums opacity-60">{first.ex!.from + i + 1}</span>
                {l || " "}
              </span>
            ))}
          </pre>
          <p className="border-t border-[var(--line)] px-3 py-1.5 font-mono text-xs text-miss">{first.h.detail}</p>
        </div>
      )}
    </Panel>
  );
}

/**
 * Organizm: drabina konfiguracji. Wiersze = poziomy (każdy dokłada jedną rzecz), kolumny = harness.
 * Komórka: liczba luk z atak.py i testy agenta; kliknięcie pokazuje szczegóły przebiegu i błędny fragment kodu.
 * Szczegóły mają rezerwę najdłuższego wariantu (StableHeight hug). Dane: scripts/lesson06_experiments.py.
 */
export function ConfigLadderViz() {
  const [sel, setSel] = useState("langchain:0");
  const [h, l] = sel.split(":");
  const harness = HARNESS.find((x) => x.id === h)!;
  const all = HARNESS.flatMap((hh) => LEVELS.map((lv) => ({ key: `${hh.id}:${lv.id}`, run: hh.runs[String(lv.id)], lv }))).filter((x) => x.run);
  return (
    <div className="space-y-6">
      <Panel className="overflow-x-auto p-2">
        <ToggleGroup.Root type="single" value={sel} onValueChange={(v) => v && setSel(v)} aria-label="Przebieg" className="grid min-w-[34rem] grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-1">
          <span className="px-3 py-2 font-mono text-xs text-fg-subtle">poziom konfiguracji</span>
          {HARNESS.map((hh) => (
            <span key={hh.id} className="px-3 py-2 font-mono text-xs text-fg-subtle">
              {hh.label} · {hh.runs["0"]?.model ?? ""}
            </span>
          ))}
          {LEVELS.map((lv) => (
            <div key={lv.id} className="contents">
              <span className="px-3 py-2 text-sm">
                <span className="mr-2 font-mono text-xs text-brand-300">{lv.id}</span>
                {lv.label}
              </span>
              {HARNESS.map((hh) => {
                const r = hh.runs[String(lv.id)];
                if (!r) return <span key={hh.id} className="px-3 py-2 text-sm text-fg-subtle">—</span>;
                const broken = r.attack.some((a) => a.id === "atak-nie-ruszyl");
                const holes = r.attack.filter((a) => a.luka && a.id !== "brak-testow").length;
                return (
                  <ToggleGroup.Item
                    key={hh.id}
                    value={`${hh.id}:${lv.id}`}
                    className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-transparent px-3 py-2 text-left text-sm transition-colors hover:bg-[var(--panel-hi)] data-[state=on]:border-brand-400 data-[state=on]:bg-brand-500/15"
                  >
                    <Badge tone={holes === 0 && !broken ? "hit" : "miss"}>{broken ? "nie startuje" : holes === 0 ? "0 luk" : `${holes} ${holes === 1 ? "luka" : holes < 5 ? "luki" : "luk"}`}</Badge>
                    <span className="text-fg-muted">{r.tests.passed > 0 ? `${r.tests.passed} testów` : "bez testów"}</span>
                  </ToggleGroup.Item>
                );
              })}
            </div>
          ))}
        </ToggleGroup.Root>
      </Panel>
      <StableHeight mode="hug" variants={all.map((x) => <Detail key={x.key} run={x.run} level={x.lv} />)}>
        <Detail run={harness.runs[l]} level={LEVELS.find((x) => String(x.id) === l)!} />
      </StableHeight>
    </div>
  );
}
