"use client";

import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";
import { SMALL, SmallGraphSvg, edgeKey } from "./SmallGraph";

// Te same fakty co w grafie z notebooka, rozpisane na tabele relacyjne (klucze: osoby 1…, umiejętności 11…, firmy 21…).
const of = (kind: string, base: number) => SMALL.nodes.filter((n) => n.kind === kind).map((n, i) => ({ id: base + i, key: n.id, ...(n.props as { name: string; city?: string }) }));
export const TABLES = (() => {
  const people = of("Person", 1);
  const skills = of("Skill", 11);
  const companies = of("Company", 21);
  const id = (k: string) => [...people, ...skills, ...companies].find((x) => x.key === k)!.id;
  const rel = (r: string) => SMALL.edges.filter((e) => e.rel === r);
  return {
    people,
    skills,
    companies,
    has_skill: rel("HAS_SKILL").map((e) => ({ a: id(e.s), b: id(e.t), v: (e.props as { years?: number }).years, s: e.s, t: e.t })),
    worked_at: rel("WORKED_AT").map((e) => ({ a: id(e.s), b: id(e.t), v: (e.props as { since?: number }).since, s: e.s, t: e.t })),
    knows: rel("KNOWS").map((e) => ({ a: id(e.s), b: id(e.t), s: e.s, t: e.t })),
  };
})();

const T = TABLES;
const anna = T.people.find((p) => p.name === "Anna")!;
const annaCos = T.worked_at.filter((w) => w.a === anna.id).map((w) => w.b);
const coRows = T.worked_at.filter((w) => annaCos.includes(w.b));
const colleagues = coRows.filter((w) => w.a !== anna.id);
const wk = (s: string, t: string) => edgeKey({ s, t, rel: "WORKED_AT" });
const names = colleagues.map((c) => T.people.find((p) => p.id === c.a)!.name).join(", ");

const SQL = [
  "SELECT p2.name FROM people p1",
  "JOIN worked_at w1 ON w1.person_id = p1.id",
  "JOIN worked_at w2 ON w2.company_id = w1.company_id",
  "JOIN people p2 ON p2.id = w2.person_id",
  "WHERE p1.name = 'Anna' AND p2.id <> p1.id",
];
const CYPHER = ["MATCH (:Person {name: 'Anna'})", "  -[:WORKED_AT]->(c:Company)", "  <-[:WORKED_AT]-(p:Person)", "RETURN p.name"];

const STEPS = [
  { sql: [0, 4], cy: [0], people: [anna.id], works: [] as number[], comp: [] as number[], nodes: ["anna"], edges: [] as string[], result: [] as string[], text: "Start: osoba o imieniu Anna. W tabeli to wiersz, w grafie węzeł." },
  { sql: [1], cy: [1], people: [anna.id], works: T.worked_at.flatMap((w, i) => (w.a === anna.id ? [i] : [])), comp: annaCos, nodes: ["anna", ...T.worked_at.filter((w) => w.a === anna.id).map((w) => w.t)], edges: T.worked_at.filter((w) => w.a === anna.id).map((w) => wk(w.s, w.t)), result: [], text: "Pierwszy JOIN: wiersze tabeli łączącej z id Anny. W grafie: przejście po krawędzi." },
  { sql: [2], cy: [2], people: [anna.id], works: T.worked_at.flatMap((w, i) => (annaCos.includes(w.b) ? [i] : [])), comp: annaCos, nodes: ["anna", ...coRows.map((w) => w.t), ...colleagues.map((c) => c.s)], edges: coRows.map((w) => wk(w.s, w.t)), result: [], text: "Drugi JOIN tej samej tabeli: wszyscy z tej firmy. W grafie: krawędzie wchodzące do węzła firmy." },
  { sql: [3, 4], cy: [3], people: [anna.id, ...colleagues.map((c) => c.a)], works: T.worked_at.flatMap((w, i) => (annaCos.includes(w.b) ? [i] : [])), comp: annaCos, nodes: ["anna", ...coRows.map((w) => w.t), ...colleagues.map((c) => c.s)], edges: coRows.map((w) => wk(w.s, w.t)), result: colleagues.map((c) => c.s), text: `Trzeci JOIN zamienia id z powrotem na imiona. Wynik: ${names}. Każdy kolejny krok relacji to w SQL kolejny JOIN.` },
];

/**
 * Organizm: pytanie „kto pracował z Anną” krok po kroku, równolegle jako JOIN-y w SQL
 * i jako przejścia po krawędziach w Cypherze. Dane: graf z komórki web:cypher-create.
 */
export function TableVsGraph() {
  const s = useStepper(STEPS.length, { interval: 1800 });
  const st = STEPS[s.step];
  const row = (on: boolean) => cn("transition-colors", on ? "bg-focus/15 text-fg" : "text-fg-subtle");
  return (
    <div ref={s.ref} className="space-y-4">
      <StepControls stepper={s} label={st.text} labels={STEPS.map((x) => x.text)} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="space-y-4 p-5">
          <span className="font-mono text-xs uppercase tracking-widest text-brand-400">tabele + SQL</span>
          <div className="grid grid-cols-1 gap-3 font-mono text-xs sm:grid-cols-3">
            <MiniTable title="people" head={["id", "name"]} rows={T.people.map((p) => ({ cells: [p.id, p.name], on: st.people.includes(p.id) }))} rowClass={row} />
            <MiniTable title="worked_at" head={["person_id", "company_id"]} rows={T.worked_at.map((w, i) => ({ cells: [w.a, w.b], on: st.works.includes(i) }))} rowClass={row} />
            <MiniTable title="companies" head={["id", "name"]} rows={T.companies.map((c) => ({ cells: [c.id, c.name], on: st.comp.includes(c.id) }))} rowClass={row} />
          </div>
          <pre className="overflow-x-auto rounded-lg bg-ink-950/60 p-3 font-mono text-[0.75rem] leading-relaxed">
            {SQL.map((l, i) => (
              <div key={i} className={cn("rounded px-1 transition-colors", st.sql.includes(i) ? "bg-focus/15 text-focus" : "text-fg-subtle")}>
                {l}
              </div>
            ))}
          </pre>
        </Panel>
        <Panel className="space-y-2 p-5">
          <span className="font-mono text-xs uppercase tracking-widest text-brand-400">graf + Cypher</span>
          <SmallGraphSvg nodes={st.nodes} edges={st.edges} result={st.result} props={false} compact />
          <pre className="overflow-x-auto rounded-lg bg-ink-950/60 p-3 font-mono text-[0.75rem] leading-relaxed">
            {CYPHER.map((l, i) => (
              <div key={i} className={cn("rounded px-1 transition-colors", st.cy.includes(i) ? "bg-focus/15 text-focus" : i < st.cy[0] ? "text-fg" : "text-fg-subtle")}>
                {l}
              </div>
            ))}
          </pre>
        </Panel>
      </div>
    </div>
  );
}

export function MiniTable({
  title,
  head,
  rows,
  rowClass = () => "text-fg-muted",
  fit = false,
}: {
  /** tabela szeroka na treść zamiast na całą kolumnę */
  fit?: boolean;
  title: string;
  head: string[];
  rows: { cells: (string | number | undefined)[]; on?: boolean }[];
  rowClass?: (on: boolean) => string;
}) {
  return (
    <div className="min-w-0 overflow-x-auto">
      <p className="mb-1 text-brand-300">{title}</p>
      <table className={fit ? "w-auto" : "w-full"}>
        <thead className="text-fg-subtle">
          <tr>
            {head.map((h) => (
              <th key={h} className={cn("border-b border-[var(--line)] pb-1 text-left font-normal", fit ? "pr-6" : "pr-3")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className={rowClass(!!r.on)}>
              {r.cells.map((c, j) => (
                <td key={j} className={cn("py-1 tabular-nums", fit ? "pr-6" : "pr-3")}>
                  {c ?? "null"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
