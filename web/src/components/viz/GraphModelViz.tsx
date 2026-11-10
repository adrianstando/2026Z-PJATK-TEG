"use client";

import { useState } from "react";
import { ToggleGroup } from "radix-ui";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { SmallGraphSvg } from "./SmallGraph";
import { MiniTable, TABLES as T, TableVsGraph } from "./TableVsGraph";

const VIEWS = [
  { id: "graph", label: "Graf" },
  { id: "tables", label: "Tabele (SQL)" },
  { id: "query", label: "Zapytanie: SQL vs graf" },
] as const;
type View = (typeof VIEWS)[number]["id"];

/**
 * Organizm: ten sam mały graf z notebooka w trzech widokach. Wszystkie widoki leżą w jednej komórce
 * siatki (nieaktywne `invisible`), więc kontener ma wysokość najwyższego i przełączanie nie przesuwa strony.
 */
export function GraphModelViz() {
  const [view, setView] = useState<View>("graph");
  return (
    <div className="space-y-4">
      <ToggleGroup.Root type="single" value={view} onValueChange={(v) => v && setView(v as View)} className="flex flex-wrap gap-2" aria-label="Widok danych">
        {VIEWS.map((v) => (
          <ToggleGroup.Item
            key={v.id}
            value={v.id}
            className="rounded-full border border-[var(--line-strong)] px-4 py-1.5 text-sm text-fg-muted transition-all hover:text-fg data-[state=on]:border-focus data-[state=on]:bg-focus/10 data-[state=on]:text-focus"
          >
            {v.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      {/* wszystkie widoki w jednej komórce siatki: kontener ma wysokość najwyższego, a karta krótszego widoku
          ma swoją wysokość (self-start), pod nią zostaje tło slajdu; długość strony się nie zmienia */}
      <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
        <Layer on={view === "graph"}>
          <Panel className="p-4 md:p-6">
            <SmallGraphSvg />
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-fg-muted">
              <span>
                <b className="font-mono text-cat-1">:Person</b>, <b className="font-mono text-cat-2">:Skill</b>, <b className="font-mono text-cat-4">:Company</b>: etykiety węzłów
              </span>
              <span>
                strzałka: relacja z typem i kierunkiem, w nawiasie <code>{"{…}"}</code> jej właściwości
              </span>
            </div>
          </Panel>
        </Layer>
        <Layer on={view === "tables"}>
          <Panel className="space-y-6 p-4 md:p-6">
            <div className="grid gap-x-10 gap-y-6 font-mono text-xs sm:grid-cols-2 sm:text-sm lg:grid-cols-3">
              <MiniTable fit title="people" head={["id", "name", "city"]} rows={T.people.map((p) => ({ cells: [p.id, p.name, p.city] }))} />
              <MiniTable fit title="skills" head={["id", "name"]} rows={T.skills.map((p) => ({ cells: [p.id, p.name] }))} />
              <MiniTable fit title="companies" head={["id", "name"]} rows={T.companies.map((p) => ({ cells: [p.id, p.name] }))} />
              <MiniTable fit title="has_skill" head={["person_id", "skill_id", "years"]} rows={T.has_skill.map((r) => ({ cells: [r.a, r.b, r.v] }))} />
              <MiniTable fit title="worked_at" head={["person_id", "company_id", "since"]} rows={T.worked_at.map((r) => ({ cells: [r.a, r.b, r.v] }))} />
              <MiniTable fit title="knows" head={["person_id", "known_id"]} rows={T.knows.map((r) => ({ cells: [r.a, r.b] }))} />
            </div>
            <p className="max-w-3xl text-sm leading-relaxed text-fg-muted">
              Węzły to wiersze tabel <code>people</code>, <code>skills</code>, <code>companies</code>. Każda relacja to tabela łącząca z dwoma kluczami obcymi, a jej właściwości (<code>years</code>, <code>since</code>) to dodatkowe kolumny. Dane są te same; różni się to, jak łatwo po nich chodzić.
            </p>
          </Panel>
        </Layer>
        <Layer on={view === "query"}>
          <TableVsGraph />
        </Layer>
      </div>
    </div>
  );
}

function Layer({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div aria-hidden={!on} inert={!on} className={cn("self-start transition-opacity duration-300", on ? "opacity-100" : "invisible opacity-0")}>
      {children}
    </div>
  );
}
