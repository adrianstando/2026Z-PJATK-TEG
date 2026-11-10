"use client";

import { useMemo, useState } from "react";
import { ToggleGroup } from "radix-ui";
import data from "@/data/talentmatch.json";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { StableHeight } from "@/components/molecules/StableHeight";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";
import { useNarrow } from "@/lib/useMediaQuery";

const COLOR: Record<string, string> = {
  Person: "var(--color-cat-1)",
  Skill: "var(--color-cat-2)",
  Company: "var(--color-cat-4)",
  RFP: "var(--color-cat-3)",
};
const KIND_PL: Record<string, string> = { Person: "osoba", Skill: "umiejętność", Company: "firma", RFP: "zapytanie ofertowe" };

const LAYOUT = {
  wide: { W: 1000, H: 620, L: 100, R: 150, T: 24, r: { Person: 8, Skill: 9, Company: 10, RFP: 11 } as Record<string, number>, font: 14 },
  narrow: { W: 600, H: 1100, L: 150, R: 200, T: 30, r: { Person: 11, Skill: 12, Company: 13, RFP: 14 } as Record<string, number>, font: 24 },
};

const { nodes, edges } = data.graph;
const byId = new Map(nodes.map((n) => [n.id, n]));
const shortName = (n: (typeof nodes)[number]) => (n.kind === "Person" ? n.label.split(" ")[0] + " " + n.label.split(" ")[1][0] + "." : n.label);

/**
 * Organizm: graf TalentMatch (osoby, umiejętności, firmy, RFP) z ekstrakcji w notebooku.
 * Zapytanie Cypher wykonuje się krok po kroku: każdy krok podświetla węzły i krawędzie,
 * które obejmuje kolejna linia MATCH/WITH. Kliknięcie węzła pokazuje jego sąsiadów.
 * Dane i układ: scripts/generate_graph_data.py.
 */
export function TalentGraph() {
  const [qi, setQi] = useState(0);
  return <QueryGraph key={qi} qi={qi} setQi={setQi} />;
}

function QueryGraph({ qi, setQi }: { qi: number; setQi: (i: number) => void }) {
  const narrow = useNarrow();
  const L = narrow ? LAYOUT.narrow : LAYOUT.wide;
  const [sel, setSel] = useState<string | null>(null);
  const q = data.queries[qi];
  const stepper = useStepper(q.steps.length, { interval: 1600 });
  const step = stepper.step;
  const st = q.steps[step];

  // kolumny: RFP → umiejętności → osoby → firmy; podpisy po lewej dla dwóch pierwszych, po prawej dla pozostałych
  const xy = (p: number[]) => ({ x: L.L + p[0] * (L.W - L.L - L.R), y: L.T + p[1] * (L.H - 2 * L.T) });
  const leftLabel = (kind: string) => kind === "RFP" || kind === "Skill";

  const { activeN, activeE, result } = useMemo(() => {
    if (sel) {
      const es = edges.filter((e) => e.s === sel || e.t === sel);
      return { activeN: new Set([sel, ...es.map((e) => e.s), ...es.map((e) => e.t)]), activeE: new Set(es.map((e) => e.id)), result: new Set<string>() };
    }
    return { activeN: new Set(st.nodes), activeE: new Set(st.edges), result: new Set("result" in st ? (st.result as string[]) : []) };
  }, [sel, st]);
  const anyActive = activeN.size > 0;

  return (
    <div ref={stepper.ref} className="space-y-4">
      <ToggleGroup.Root
        type="single"
        value={String(qi)}
        onValueChange={(v) => {
          if (!v) return;
          setQi(Number(v));
        }}
        className="flex flex-wrap gap-2"
        aria-label="Zapytanie do grafu"
      >
        {data.queries.map((x, i) => (
          <ToggleGroup.Item
            key={x.id}
            value={String(i)}
            className="rounded-full border border-[var(--line-strong)] px-4 py-2 text-sm text-fg-muted transition-all hover:text-fg data-[state=on]:border-focus data-[state=on]:bg-focus/10 data-[state=on]:text-focus"
          >
            {x.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel className="p-2">
          <svg viewBox={`0 0 ${L.W} ${L.H}`} className="h-auto w-full" role="img" aria-label="Graf TalentMatch">
            <rect width={L.W} height={L.H} fill="transparent" onClick={() => setSel(null)} />
            {edges.map((e) => {
              const a = xy(byId.get(e.s)!.p);
              const b = xy(byId.get(e.t)!.p);
              const on = activeE.has(e.id);
              return (
                <line
                  key={e.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={on ? "var(--color-focus)" : "var(--line-strong)"}
                  strokeWidth={on ? 2.5 : 1}
                  strokeLinecap="round"
                  style={{ opacity: anyActive && !on ? 0.25 : 1, transition: "opacity .4s, stroke .4s" }}
                />
              );
            })}
            {nodes.map((n) => {
              const { x, y } = xy(n.p);
              const on = activeN.has(n.id);
              const res = result.has(n.id);
              const r = L.r[n.kind];
              return (
                <g
                  key={n.id}
                  onClick={() => setSel(sel === n.id ? null : n.id)}
                  className="cursor-pointer"
                  style={{ opacity: anyActive && !on ? 0.3 : 1, transition: "opacity .4s" }}
                >
                  <title>{n.label}</title>
                  {res && <circle cx={x} cy={y} r={r + 6} fill="none" stroke="var(--color-hit)" strokeWidth={2.5} />}
                  <circle cx={x} cy={y} r={r} fill={COLOR[n.kind]} fillOpacity={0.25} stroke={COLOR[n.kind]} strokeWidth={n.id === sel ? 3.5 : 1.8} />
                  {/* telefon: podpisy osób tylko dla aktywnych węzłów, bo nachodzą na kolumnę firm */}
                  {(!narrow || n.kind !== "Person" || on) && <text
                    x={leftLabel(n.kind) ? x - r - 6 : x + r + 6}
                    y={y + L.font * 0.35}
                    textAnchor={leftLabel(n.kind) ? "end" : "start"}
                    fontSize={L.font}
                    className={on ? "fill-fg" : "fill-fg-muted"}
                    style={{ paintOrder: "stroke", stroke: "var(--color-ink-950)", strokeWidth: 3 }}
                  >
                    {shortName(n)}
                  </text>}
                </g>
              );
            })}
          </svg>
          <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 pb-2 text-xs text-fg-muted">
            {Object.entries(KIND_PL).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1.5">
                <i className="size-2.5 rounded-full" style={{ background: COLOR[k] }} /> {v}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <i className="size-2.5 rounded-full border-2 border-hit" /> wynik
            </span>
          </div>
          <p className="px-3 pb-2 font-mono text-[0.7rem] text-fg-subtle">
            {nodes.length} węzłów, {edges.length} relacji z ekstrakcji ({data.compare.model.chat}); bez miast, uczelni i certyfikatów · kliknięcie węzła: sąsiedzi
          </p>
        </Panel>

        <div className="space-y-4">
          <Panel className="p-4">
            {/* wysokość najdłuższego z trzech zapytań przy bieżącej szerokości */}
            <StableHeight variants={data.queries.map((x) => <Cypher key={x.id} lines={x.cypher} />)} mode="hug">
              <Cypher lines={q.cypher} active={sel ? -1 : st.line} />
            </StableHeight>
            <StepControls stepper={{ ...stepper, go: (i) => { setSel(null); stepper.go(i); }, next: () => { setSel(null); stepper.next(); }, prev: () => { setSel(null); stepper.prev(); } }} className="mt-3" />
          </Panel>
          <Panel className="p-4 text-sm leading-relaxed text-fg-muted">
            {/* wysokość: najdłuższy opis kroku (wszystkie zapytania) albo zwarty opis osoby; dłuższa lista sąsiadów przewija się w środku */}
            <StableHeight variants={[...data.queries.flatMap((x) => x.steps.map((y, k) => <p key={x.id + k}>{y.text}</p>)), <NodeInfo key="node" id="Person:Anna Kowalska" />]} mode="overlay">
              {sel ? <NodeInfo id={sel} /> : <p>{st.text}</p>}
            </StableHeight>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function Cypher({ lines, active = -1 }: { lines: string[]; active?: number }) {
  return (
    <pre className="whitespace-pre-wrap break-words font-mono text-[0.75rem] leading-relaxed sm:text-[0.8rem]">
      {lines.map((line, i) => (
        <div key={i} className={cn("rounded px-2 py-0.5 transition-colors", i === active ? "bg-focus/15 text-focus" : active >= 0 && i <= active ? "text-fg" : "text-fg-subtle")}>
          {line}
        </div>
      ))}
    </pre>
  );
}

/** Zwarty opis zaznaczonego węzła: typ, nazwa, sąsiedzi w jednym akapicie. */
function NodeInfo({ id }: { id: string }) {
  const n = byId.get(id)!;
  const es = edges.filter((e) => e.s === id || e.t === id);
  return (
    <div>
      <p className="text-fg">
        <span className="mr-2 font-mono text-xs uppercase" style={{ color: COLOR[n.kind] }}>
          {KIND_PL[n.kind]}
        </span>
        {n.label}
        {"title" in n && n.title ? <span className="text-fg-muted"> · {String(n.title)}</span> : null}
        {"available" in n && n.available ? <span className="font-mono text-xs text-fg-muted"> · od {String(n.available)}</span> : null}
      </p>
      <p className="mt-1.5 font-mono text-xs leading-relaxed">
        {es.map((e, i) => {
          const other = byId.get(e.s === id ? e.t : e.s)!;
          return (
            <span key={e.id}>
              {i > 0 && <span className="text-fg-subtle"> · </span>}
              {e.s === id ? "→" : "←"} {e.rel} {other.label}
              {e.years != null ? ` (${e.years} l.)` : ""}
            </span>
          );
        })}
      </p>
    </div>
  );
}
