"use client";

import data from "@/data/talentmatch.json";
import { useNarrow } from "@/lib/useMediaQuery";
import { useSvgPx } from "@/lib/useSvgPx";

// Mały graf z sekcji 1 notebooka (komórka web:cypher-create): 4 osoby, 2 umiejętności, 2 firmy.
export const SMALL = data.small;
export type SmallNode = (typeof SMALL.nodes)[number];
export type SmallEdge = (typeof SMALL.edges)[number];
export const edgeKey = (e: { s: string; t: string; rel: string }) => `${e.s}-${e.rel}-${e.t}`;
export const nodeById = (id: string) => SMALL.nodes.find((n) => n.id === id);

/** Zapis właściwości jak w Cypherze: {name: 'Anna', city: 'Warszawa'} */
export const propsText = (p: Record<string, unknown>, skip: string[] = []) => {
  const e = Object.entries(p).filter(([k]) => !skip.includes(k));
  return e.length ? `{${e.map(([k, v]) => `${k}: ${typeof v === "string" ? `'${v}'` : v}`).join(", ")}}` : "";
};

// Węzeł dodawany w przykładzie MERGE (nie ma go w grafie z notebooka, dopóki zapytanie go nie utworzy).
export const OLA = { id: "ola", kind: "Person", label: "Ola", props: { name: "Ola", city: "Poznań" } };
export const OLA_EDGE = { s: "ola", t: "py", rel: "HAS_SKILL", props: { years: 1 }, years: 1 };

const COLOR: Record<string, string> = { Person: "var(--color-cat-1)", Skill: "var(--color-cat-2)", Company: "var(--color-cat-4)" };

type Layout = { W: number; H: number; r: number; font: number; pos: Record<string, { x: number; y: number }>; edgeLabels: "all" | "active" };
const WIDE: Layout = {
  W: 1000, H: 520, r: 22, font: 17, edgeLabels: "all",
  pos: {
    py: { x: 130, y: 125 }, k8s: { x: 130, y: 385 }, ola: { x: 130, y: 255 },
    ewa: { x: 470, y: 55 }, anna: { x: 470, y: 185 }, marek: { x: 470, y: 315 }, piotr: { x: 470, y: 445 },
    nb: { x: 850, y: 125 }, cf: { x: 850, y: 385 },
  },
};
const NARROW: Layout = {
  W: 600, H: 760, r: 26, font: 26, edgeLabels: "active",
  pos: {
    py: { x: 150, y: 95 }, k8s: { x: 450, y: 95 }, ola: { x: 300, y: 225 },
    ewa: { x: 75, y: 390 }, anna: { x: 225, y: 390 }, marek: { x: 375, y: 390 }, piotr: { x: 525, y: 390 },
    nb: { x: 150, y: 680 }, cf: { x: 450, y: 680 },
  },
};

/**
 * Atom wizualizacji: rysunek małego grafu z właściwościami węzłów i relacji.
 * `nodes`/`edges`: aktywne elementy (reszta przygaszona, gdy cokolwiek jest aktywne),
 * `result`: zielony pierścień, `extra`: węzeł i relacja z przykładu MERGE, `props`: właściwości pod węzłami.
 */
export function SmallGraphSvg({
  nodes = [],
  edges = [],
  result = [],
  extra = false,
  removed = false,
  props = true,
  label = "Mały graf: osoby, umiejętności, firmy",
  compact = false,
}: {
  nodes?: string[];
  edges?: string[];
  result?: string[];
  extra?: boolean;
  removed?: boolean;
  props?: boolean;
  label?: string;
  /** rysunek w wąskiej kolumnie: większe podpisy, etykiety relacji tylko przy aktywnych krawędziach */
  compact?: boolean;
}) {
  const { ref, width } = useSvgPx(1);
  const narrow = useNarrow();
  const L: Layout = narrow ? NARROW : compact ? { ...WIDE, font: 24, r: 26, edgeLabels: "active" } : WIDE;
  const any = nodes.length > 0 || edges.length > 0;
  const allNodes: SmallNode[] = extra ? [...SMALL.nodes, OLA as SmallNode] : SMALL.nodes;
  const allEdges: SmallEdge[] = extra ? [...SMALL.edges, OLA_EDGE as SmallEdge] : SMALL.edges;
  // podpisy na ekranie: nazwy 12–15 px, etykiety 10–11,5 px. Na szerokim rysunku nie rosną ponad tekst slajdu,
  // na wąskim maleją razem z rysunkiem, ale nie poniżej czytelnego minimum (wtedy nie nachodzą na siebie)
  const px = (size: number) => (width > 0 ? (size * L.W) / width : 0);
  const clamp = (units: number, lo: number, hi: number) => (width > 0 ? Math.min(px(hi), Math.max(px(lo), units)) : units);
  const f = clamp(L.font, 12, 15);
  const fs = clamp(L.font * 0.7, 10, 11.5);
  return (
    <svg ref={ref} viewBox={`0 0 ${L.W} ${L.H}`} className="h-auto w-full overflow-visible" role="img" aria-label={label}>
      {allEdges.map((e) => {
        const a = L.pos[e.s];
        const b = L.pos[e.t];
        const k = edgeKey(e);
        const on = edges.includes(k);
        const gone = removed && e.s === "ola";
        // KNOWS łączy dwie osoby z tej samej kolumny: łuk zamiast prostej przez węzeł pośrodku
        const bend = e.rel === "KNOWS";
        const mx = (a.x + b.x) / 2 + (bend ? (narrow ? 0 : 120) : 0);
        const my = (a.y + b.y) / 2 + (bend ? (narrow ? 110 : 0) : 0);
        const c = { x: 2 * mx - (a.x + b.x) / 2, y: 2 * my - (a.y + b.y) / 2 };
        // koniec strzałki na brzegu węzła docelowego, nie w jego środku
        const from = bend ? c : a;
        const len = Math.hypot(b.x - from.x, b.y - from.y) || 1;
        const end = { x: b.x - ((b.x - from.x) / len) * (L.r + 4), y: b.y - ((b.y - from.y) / len) * (L.r + 4) };
        const d = bend ? `M${a.x},${a.y} Q${c.x},${c.y} ${end.x},${end.y}` : `M${a.x},${a.y} L${end.x},${end.y}`;
        const showLabel = L.edgeLabels === "all" || on;
        const pr = propsText(e.props as Record<string, unknown>);
        return (
          <g key={k} style={{ opacity: gone ? 0 : any && !on ? 0.18 : 1, transition: "opacity .4s" }}>
            <path d={d} fill="none" stroke={on ? "var(--color-focus)" : "var(--line-strong)"} strokeWidth={on ? 3.5 : 1.6} strokeLinecap="round" markerEnd={on ? "url(#sg-arrow-on)" : "url(#sg-arrow)"} style={{ transition: "stroke .4s" }} />
            {showLabel && (
              <text x={mx} y={my - fs * 0.45} textAnchor="middle" fontSize={fs} className={on ? "fill-focus font-mono" : "fill-fg-subtle font-mono"} style={{ paintOrder: "stroke", stroke: "var(--color-ink-950)", strokeWidth: 4 }}>
                {e.rel}
                {pr && ` ${pr}`}
              </text>
            )}
          </g>
        );
      })}
      <defs>
        {["sg-arrow", "sg-arrow-on"].map((id) => (
          <marker key={id} id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth={L.font * 0.7} markerHeight={L.font * 0.7} orient="auto" markerUnits="userSpaceOnUse">
            <path d="M0,0 L10,5 L0,10 z" fill={id === "sg-arrow" ? "var(--line-strong)" : "var(--color-focus)"} />
          </marker>
        ))}
      </defs>
      {allNodes.map((n) => {
        const p = L.pos[n.id];
        const on = nodes.includes(n.id);
        const gone = removed && n.id === "ola";
        const city = (n.props as Record<string, unknown>).city;
        return (
          <g key={n.id} style={{ opacity: gone ? 0 : any && !on ? 0.28 : 1, transition: "opacity .4s" }}>
            {result.includes(n.id) && <circle cx={p.x} cy={p.y} r={L.r + 8} fill="none" stroke="var(--color-hit)" strokeWidth={3} />}
            <circle cx={p.x} cy={p.y} r={L.r} fill={COLOR[n.kind]} fillOpacity={on ? 0.4 : 0.2} stroke={COLOR[n.kind]} strokeWidth={on ? 3 : 2} />
            <text x={p.x} y={p.y - L.r - fs * 0.6} textAnchor="middle" fontSize={fs} className="fill-fg-subtle font-mono">
              :{n.kind}
            </text>
            <text x={p.x} y={p.y + L.r + f + 2} textAnchor="middle" fontSize={f} className="fill-fg">
              {n.label}
            </text>
            {props && city != null && (
              <text x={p.x} y={p.y + L.r + f + fs * 1.35 + 2} textAnchor="middle" fontSize={fs} className="fill-fg-subtle font-mono">
                city: &apos;{String(city)}&apos;
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
