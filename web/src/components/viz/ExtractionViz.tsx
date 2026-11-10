"use client";

import { motion, useReducedMotion } from "motion/react";
import data from "@/data/talentmatch.json";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { StableHeight } from "@/components/molecules/StableHeight";
import { useStepper } from "@/lib/useStepper";
import { useNarrow } from "@/lib/useMediaQuery";

export const KIND_COLOR: Record<string, string> = {
  Person: "var(--color-fg)",
  Skill: "var(--color-cat-1)",
  Company: "var(--color-cat-2)",
  City: "var(--color-cat-3)",
  University: "var(--color-cat-3)",
  Certification: "var(--color-cat-4)",
  RFP: "var(--color-cat-4)",
};
const KIND_PL: Record<string, string> = { Person: "osoba", Skill: "umiejętność", Company: "firma", City: "miasto", University: "uczelnia", Certification: "certyfikat" };

const LAYOUT = {
  wide: { W: 640, H: 520, R: 200, EX: 1.2, rel_on: true, node: 13, font: 14, rel: 11, max: 26 },
  narrow: { W: 560, H: 600, R: 225, EX: 1.0, rel_on: false, node: 16, font: 23, rel: 21, max: 12 },
};

const G = data.graph;
const CAPTIONS = ["napis pod węzłem: zapis w tekście przed normalizacją", "kolumny: RFP, umiejętności, osoby, firmy"];
const nPeople = G.nodes.filter((n) => n.kind === "Person").length;
const STEPS = [
  "Tekst CV: dane nieustrukturyzowane, każde CV napisane trochę inaczej.",
  "LLM ze schematem (structured outputs) wskazuje encje: osobę, miasto, uczelnię, firmy, technologie, certyfikat.",
  "Kod zamienia encje na węzły; nazwy po normalizacji („K8s” → Kubernetes).",
  "Relacje od osoby, z właściwościami (lata doświadczenia przy HAS_SKILL).",
  `To samo dla pozostałych CV i RFP: ${G.nodes.length} węzłów i ${G.edges.length} relacji. Wspólne technologie i firmy łączą osoby w jeden graf.`,
];

/**
 * Organizm: ekstrakcja grafu z jednego CV, krok po kroku (StepControls): tekst → encje zaznaczone przez model
 * (kolor = typ) → węzły pod nazwą kanoniczną → relacje → cały graf z 14 CV. Panele mają stałą wysokość.
 * Dane: prawdziwy wynik ekstrakcji z notebooka (scripts/generate_graph_data.py).
 */
export function ExtractionViz() {
  const s = useStepper(STEPS.length, { interval: 1800 });
  const phase = s.step;
  const reduce = useReducedMotion();
  const L = useNarrow() ? LAYOUT.narrow : LAYOUT.wide;
  const { text, spans, entities } = data.extraction;

  // tekst pocięty na fragmenty zwykłe i encje
  const parts: { s: string; kind?: string; canon?: string; i: number }[] = [];
  let at = 0;
  spans.forEach((sp, i) => {
    if (sp.a > at) parts.push({ s: text.slice(at, sp.a), i: -1 });
    parts.push({ s: text.slice(sp.a, sp.b), kind: sp.kind, canon: sp.canon, i });
    at = sp.b;
  });
  parts.push({ s: text.slice(at), i: -1 });

  const others = entities.filter((e) => e.kind !== "Person");
  const person = entities.find((e) => e.kind === "Person")!;
  const cx = L.W / 2;
  const cy = L.H / 2;
  const pos = others.map((_, i) => {
    const a = (i / others.length) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + L.R * Math.cos(a) * L.EX, y: cy + L.R * Math.sin(a) };
  });

  const body = (ph: number) =>
    ph === 4 ? (
          <ul className="flex flex-1 flex-col justify-between gap-1 font-mono text-sm text-fg-muted">
            {G.nodes.filter((n) => n.kind === "Person").map((n, i) => (
              <li key={n.id} className={i === 0 ? "text-fg" : undefined}>
                {n.label}
              </li>
            ))}
          </ul>
        ) : (
        <p className="whitespace-pre-wrap text-[0.9rem] leading-relaxed text-fg-muted">
          {parts.map((p, k) =>
            p.kind ? (
              <span
                key={k}
                title={p.canon !== p.s ? `${p.s} → ${p.canon}` : KIND_PL[p.kind]}
                className="rounded px-0.5 transition-colors duration-500"
                style={
                  ph >= 1
                    ? { background: `color-mix(in srgb, ${KIND_COLOR[p.kind]} 22%, transparent)`, color: "var(--color-fg)", transitionDelay: reduce ? "0s" : `${p.i * 0.05}s` }
                    : undefined
                }
              >
                {p.s}
              </span>
            ) : (
              <span key={k}>{p.s}</span>
            ),
          )}
        </p>
        );

  return (
    <div ref={s.ref} className="space-y-4">
    <StepControls stepper={s} label={STEPS[phase]} labels={STEPS} />
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <Panel className="flex flex-col p-5 md:p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-xs text-fg-subtle">{phase < 4 ? "data/cv/01_anna_kowalska.md" : `data/cv/ · ${nPeople} plików`}</span>
        </div>
        {/* rezerwa: dłuższy z widoków (tekst CV albo lista plików) przy bieżącej szerokości */}
        <StableHeight variants={[body(0), body(4)]} className="flex-1">
          {body(phase)}
        </StableHeight>
      </Panel>

      <Panel className="p-2">
        <svg viewBox={`0 0 ${L.W} ${L.H}`} className="h-auto w-full overflow-visible" role="img" aria-label="Graf wyodrębniony z CV">
          <g style={{ opacity: phase === 4 ? 1 : 0, transition: "opacity .6s" }}>
            {G.edges.map((e) => {
              const a = G.nodes.find((n) => n.id === e.s)!.p;
              const b = G.nodes.find((n) => n.id === e.t)!.p;
              const X = (v: number) => 30 + v * (L.W - 60);
              const Y = (v: number) => 20 + v * (L.H - 40);
              return <line key={e.id} x1={X(a[0])} y1={Y(a[1])} x2={X(b[0])} y2={Y(b[1])} stroke="var(--line-strong)" strokeWidth={1} />;
            })}
            {G.nodes.map((n) => (
              <circle key={n.id} cx={30 + n.p[0] * (L.W - 60)} cy={20 + n.p[1] * (L.H - 40)} r={n.id === "Person:Anna Kowalska" ? L.node * 0.8 : L.node * 0.5} fill={KIND_COLOR[n.kind]} fillOpacity={0.35} stroke={KIND_COLOR[n.kind]} strokeWidth={1.5} />
            ))}
          </g>
          <g style={{ opacity: phase === 4 ? 0 : 1, transition: "opacity .4s" }}>
          {others.map((e, i) => (
            <g key={`e${i}`} style={{ opacity: phase >= 3 ? 1 : 0, transition: `opacity 0.5s ${reduce ? 0 : i * 0.06}s` }}>
              <line x1={cx} y1={cy} x2={pos[i].x} y2={pos[i].y} stroke="var(--line-strong)" strokeWidth={1.5} />
              {L.rel_on && <text
                x={cx + (pos[i].x - cx) * 0.62}
                y={cy + (pos[i].y - cy) * 0.62 - 4}
                textAnchor="middle"
                fontSize={L.rel}
                className="fill-fg-subtle font-mono"
              >
                {e.rel}
                {e.years != null ? ` ${e.years}` : ""}
              </text>}
            </g>
          ))}
          {others.map((e, i) => (
            <g key={`n${i}`} style={{ opacity: phase >= 2 ? 1 : 0, transition: `opacity 0.4s ${reduce ? 0 : i * 0.05}s` }}>
              <circle cx={pos[i].x} cy={pos[i].y} r={L.node} fill={KIND_COLOR[e.kind]} fillOpacity={0.2} stroke={KIND_COLOR[e.kind]} strokeWidth={2} />
              <text x={pos[i].x} y={pos[i].y + L.node + L.font + 2} textAnchor="middle" fontSize={L.font} className="fill-fg">
                {e.label.length > L.max ? e.label.slice(0, L.max - 2) + "…" : e.label}
              </text>
              {e.raw !== e.label && (
                <text x={pos[i].x} y={pos[i].y + L.node + 2 * L.font + 4} textAnchor="middle" fontSize={L.rel} className="fill-focus font-mono">
                  z „{e.raw}”
                </text>
              )}
            </g>
          ))}
          <motion.g initial={false} animate={{ opacity: phase >= 2 ? 1 : 0 }}>
            <circle cx={cx} cy={cy} r={L.node * 1.6} fill={KIND_COLOR.Person} fillOpacity={0.2} stroke={KIND_COLOR.Person} strokeWidth={2.5} />
            <text x={cx} y={cy + L.node * 1.6 + L.font + 4} textAnchor="middle" fontSize={L.font} className="fill-fg font-medium">
              {person.label}
            </text>
          </motion.g>
          </g>
        </svg>
        <div className="flex flex-wrap gap-x-4 gap-y-1 px-3 pb-2 text-xs text-fg-muted">
          {Object.entries(KIND_PL).map(([k, v]) => (
            <span key={k} className="flex items-center gap-1.5">
              <i className="size-2.5 rounded-full" style={{ background: KIND_COLOR[k] }} /> {v}
            </span>
          ))}
        </div>
        <p className="px-3 pb-2 font-mono text-[0.7rem] text-fg-subtle">
          {data.compare.model.chat} · structured outputs · <StableHeight as="span" mode="hug" variants={[CAPTIONS[0], CAPTIONS[1]]}>{CAPTIONS[phase === 4 ? 1 : 0]}</StableHeight>
        </p>
      </Panel>
    </div>
    </div>
  );
}
