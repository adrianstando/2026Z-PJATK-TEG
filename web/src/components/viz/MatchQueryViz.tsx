"use client";

import data from "@/data/talentmatch.json";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { CypherCode } from "@/components/molecules/CypherCode";
import { StableHeight } from "@/components/molecules/StableHeight";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";
import { NB, between } from "@/content/lesson04/snippets";

const M = data.match;
const QUERY = between(NB.match.code, "MATCH (rfp", '"""\nfor');
const short = (n: string) => n.split(" ")[0] + " " + n.split(" ")[1][0] + ".";
// wynik komórki web:match: słowniki Pythona w kolejnych liniach → wiersze tabeli
const RESULT = NB.match.output
  .trim()
  .split("\n")
  .map((l) => JSON.parse(l.replace(/'/g, '"').replace(/\bTrue\b/g, "true").replace(/\bFalse\b/g, "false")) as { name: string; met: number; required: number; available: boolean; missing: string[] });
const reqsText = "[" + M.reqs.map((r) => `{skill: '${r.skill}', min: ${r.min}}`).join(", ") + "]";

type View = "reqs" | "collect" | "people" | "checks" | "met" | "filter" | "result";
const STEPS: { lines: number[]; view: View; text: string }[] = [
  { lines: [0], view: "reqs", text: `MATCH z parametrem $rfp = '${M.rfp}': jeden wiersz na każde wymaganie (relacja REQUIRES z właściwością min_years).` },
  { lines: [1], view: "collect", text: "WITH … collect({…}) AS reqs: trzy wiersze zwinięte w jeden; reqs to lista słowników (mapy w Cypherze)." },
  { lines: [2], view: "people", text: `MATCH (p:Person): każda z ${M.rows.length} osób dołączona do tej listy, ${M.rows.length} wierszy.` },
  { lines: [3, 4], view: "checks", text: "[r IN reqs | r {.*, have: …}]: do każdego wymagania dopisany staż osoby. Brak relacji HAS_SKILL daje null, a coalesce(…, 0) zamienia go na 0." },
  { lines: [5, 6, 7], view: "met", text: "size([c IN checks WHERE c.have >= c.min]): liczba spełnionych wymagań; available: porównanie dat dostępności i startu projektu." },
  { lines: [8], view: "filter", text: "WHERE met >= size(checks) - 1: zostają osoby, którym brakuje najwyżej jednego wymagania." },
  { lines: [9, 10, 11], view: "result", text: "RETURN z listą braków (missing) i ORDER BY: najpierw pełne dopasowanie, potem dostępność." },
];

/**
 * Organizm: dłuższe zapytanie dopasowania do RFP (MATCH_QUERY z notebooka) wykonane krok po kroku.
 * Po lewej podświetlone linie, po prawej dane pośrednie po danej klauzuli (wyliczone z ekstrakcji,
 * ostatni krok to zapisany wynik komórki web:match). Panel danych ma stałą wysokość.
 */
export function MatchQueryViz() {
  const s = useStepper(STEPS.length, { interval: 2600 });
  const st = STEPS[s.step];
  return (
    <div ref={s.ref} className="space-y-4">
      <StepControls stepper={s} label={st.text} labels={STEPS.map((x) => x.text)} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <CypherCode code={QUERY} lines={st.lines} className="text-[0.72rem] sm:text-[0.8rem]" />
        <Panel className="overflow-x-auto p-4 font-mono text-[0.75rem] sm:text-xs">
          {/* rezerwa: najwyższy z widoków danych pośrednich (tabela 14 osób), bez przewijania */}
          <StableHeight variants={VIEWS.map((v) => <DataView key={v} view={v} />)} mode="hug">
            <DataView view={st.view} />
          </StableHeight>
        </Panel>
      </div>
    </div>
  );
}

const VIEWS: View[] = ["reqs", "collect", "people", "checks", "met", "filter", "result"];
const th = "border-b border-[var(--line)] px-2 pb-1.5 text-left font-normal text-fg-subtle";
const td = "px-2 py-1 align-top";

function DataView({ view }: { view: View }) {
  const rows = view === "filter" ? M.rows.filter((r) => r.met >= M.reqs.length - 1) : M.rows;
  return (
    <>
          {view === "reqs" && (
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>rfp.id</th>
                  <th className={th}>s.name</th>
                  <th className={th}>req.min_years</th>
                </tr>
              </thead>
              <tbody className="text-fg">
                {M.reqs.map((r) => (
                  <tr key={r.skill}>
                    <td className={td}>{M.rfp}</td>
                    <td className={td}>{r.skill}</td>
                    <td className={td}>{r.min}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {view === "collect" && (
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>rfp.id</th>
                  <th className={th}>reqs</th>
                </tr>
              </thead>
              <tbody className="text-fg">
                <tr>
                  <td className={td}>{M.rfp}</td>
                  <td className={cn(td, "break-words text-focus")}>{reqsText}</td>
                </tr>
              </tbody>
            </table>
          )}
          {view === "people" && (
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>p.name</th>
                  <th className={th}>reqs</th>
                </tr>
              </thead>
              <tbody className="text-fg">
                {M.rows.map((r) => (
                  <tr key={r.name}>
                    <td className={cn(td, "whitespace-nowrap")}>{r.name}</td>
                    <td className={cn(td, "text-fg-subtle")}>[3 wymagania]</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {(view === "checks" || view === "met" || view === "filter") && (
            <table className="w-full">
              <thead>
                <tr>
                  <th className={th}>p.name</th>
                  {M.reqs.map((r) => (
                    <th key={r.skill} className={th}>
                      {r.skill} ≥{r.min}
                    </th>
                  ))}
                  {view !== "checks" && <th className={th}>met</th>}
                  {view !== "checks" && <th className={th}>available</th>}
                </tr>
              </thead>
              <tbody className="text-fg">
                {rows.map((r) => (
                  <tr key={r.name}>
                    <td className={cn(td, "whitespace-nowrap")}>{short(r.name)}</td>
                    {r.checks.map((c) => (
                      <td key={c.skill} className={cn(td, "tabular-nums", c.have >= c.min ? "text-hit" : "text-miss")}>
                        {c.have}
                      </td>
                    ))}
                    {view !== "checks" && <td className={cn(td, "tabular-nums", r.met === M.reqs.length ? "text-hit" : "text-fg")}>{r.met}</td>}
                    {view !== "checks" && <td className={cn(td, r.available ? "text-hit" : "text-miss")}>{String(r.available)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {view === "result" && (
            <table className="w-full">
              <thead>
                <tr>
                  {["name", "met", "required", "available", "missing"].map((h) => (
                    <th key={h} className={th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-fg">
                {RESULT.map((r) => (
                  <tr key={r.name}>
                    <td className={cn(td, "whitespace-nowrap")}>{r.name}</td>
                    <td className={cn(td, "tabular-nums", r.met === r.required ? "text-hit" : "text-fg")}>{r.met}</td>
                    <td className={cn(td, "tabular-nums")}>{r.required}</td>
                    <td className={cn(td, r.available ? "text-hit" : "text-miss")}>{String(r.available)}</td>
                    <td className={cn(td, "text-miss")}>{r.missing.join(", ") || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
    </>
  );
}
