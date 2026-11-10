"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { StepControls } from "@/components/molecules/StepControls";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { useStepper } from "@/lib/useStepper";
import { useNarrow } from "@/lib/useMediaQuery";
import { useSvgPx } from "@/lib/useSvgPx";

export type FlowNode = { id: string; label: string; sub?: string; x: number; y: number; terminal?: boolean };
export type FlowLayout = { W: number; H: number; font: number; nodeW: number; nodeH: number; token: number; nodes: FlowNode[] };
export type FlowEvent = { node: string; tag: string; text: string; meta?: string };

const STEP_MS = 1700;

/**
 * Organizm (wspólny szkielet AgentLoopViz i GraphRunViz): odtwarza zapisany przebieg agenta
 * krok po kroku. Żeton przechodzi między węzłami diagramu, a po prawej dopisuje się
 * dziennik zdarzeń z notebooka. Dziennik ma stałą wysokość i przewija się sam, więc kroki nie przesuwają strony.
 */
export function ReplayFlow({
  layouts,
  edges,
  events,
  start,
  label,
  caption,
  state,
}: {
  layouts: { wide: FlowLayout; narrow: FlowLayout };
  edges: [string, string][];
  events: FlowEvent[];
  start: string;
  label: string;
  caption: string;
  /** opcjonalny licznik stanu pod diagramem, np. liczba wiadomości po kroku i */
  state?: (i: number) => string;
}) {
  const st = useStepper(events.length + 1, { interval: STEP_MS });
  const logRef = useRef<HTMLOListElement>(null);
  const reduced = useReducedMotion();
  const L0 = useNarrow() ? layouts.narrow : layouts.wide;
  // czcionka w węzłach najwyżej ~17 px na ekranie: na szerokim panelu diagram się powiększa, tekst nie
  const { ref: svgRef, px } = useSvgPx(L0.W);
  const L = { ...L0, font: Math.min(L0.font, px(17, L0.font)) };
  const shown = st.step - 1;

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: reduced ? "auto" : "smooth" }); // przewija tylko dziennik, nie stronę
  }, [shown, reduced]);

  const byId = Object.fromEntries(L.nodes.map((n) => [n.id, n]));
  const current = shown >= 0 ? events[shown].node : start;
  const prev = shown > 0 ? events[shown - 1].node : start;
  const visited = new Set([start, ...events.slice(0, shown + 1).map((e) => e.node)]);
  const tok = byId[current] ?? byId[start];

  return (
    <div ref={st.ref} className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <Panel className="flex flex-col p-3 md:p-4">
        <svg ref={svgRef} viewBox={`0 0 ${L.W} ${L.H}`} className="h-auto w-full" role="img" aria-label={label}>
          <defs>
            <marker id={`arrow-${label.length}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="var(--line-strong)" />
            </marker>
          </defs>
          {edges.map(([a, b]) => {
            const A = byId[a];
            const B = byId[b];
            if (!A || !B) return null;
            // linia od brzegu do brzegu prostokątów (przycięta w kierunku krawędzi)
            const dx = B.x - A.x;
            const dy = B.y - A.y;
            const cut = (n: FlowNode, sx: number, sy: number) => {
              const k = Math.min(Math.abs(L.nodeW / 2 / (dx || 1e-6)), Math.abs(L.nodeH / 2 / (dy || 1e-6))) + 0.02;
              return { x: n.x + sx * dx * k, y: n.y + sy * dy * k };
            };
            // para krawędzi w obie strony (model ⇄ tools): rozsunięcie w poprzek, żeby się nie nakładały
            const both = edges.some(([x, y]) => x === b && y === a);
            const len = Math.hypot(dx, dy) || 1;
            const off = both ? L.nodeH * 0.22 : 0;
            const ox = (-dy / len) * off;
            const oy = (dx / len) * off;
            const p0 = cut(A, 1, 1);
            const q0 = cut(B, -1, -1);
            const p = { x: p0.x + ox, y: p0.y + oy };
            const q = { x: q0.x + ox, y: q0.y + oy };
            const hot = shown >= 0 && prev === a && current === b;
            return (
              <line
                key={a + b}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke={hot ? "var(--color-focus)" : "var(--line-strong)"}
                strokeWidth={hot ? 3 : 1.5}
                markerEnd={`url(#arrow-${label.length})`}
                style={{ transition: "stroke 300ms" }}
              />
            );
          })}
          {L.nodes.map((n) => {
            const active = n.id === current;
            const seen = visited.has(n.id);
            return (
              <g key={n.id}>
                <rect
                  x={n.x - L.nodeW / 2}
                  y={n.y - L.nodeH / 2}
                  width={L.nodeW}
                  height={L.nodeH}
                  rx={n.terminal ? L.nodeH / 2 : 12}
                  fill={active ? "color-mix(in srgb, var(--color-focus) 16%, transparent)" : "var(--panel)"}
                  stroke={active ? "var(--color-focus)" : seen ? "var(--color-brand-400)" : "var(--line-strong)"}
                  strokeWidth={active ? 2.5 : 1.5}
                  style={{ transition: "fill 300ms, stroke 300ms" }}
                />
                <text x={n.x} y={n.y + (n.sub ? -L.font * 0.1 : L.font * 0.35)} textAnchor="middle" className={cn("font-mono", active ? "fill-focus" : "fill-fg-muted")} style={{ fontSize: L.font }}>
                  {n.label}
                </text>
                {n.sub && (
                  <text x={n.x} y={n.y + L.font * 0.85} textAnchor="middle" className="fill-fg-subtle font-mono" style={{ fontSize: L.font * 0.62 }}>
                    {n.sub}
                  </text>
                )}
              </g>
            );
          })}
          {/* żeton: geometria jako zwykłe atrybuty + przejście CSS (pułapka z motion.circle) */}
          <circle
            cx={tok.x - L.nodeW / 2 + L.token * 1.5}
            cy={tok.y}
            r={L.token}
            fill="var(--color-focus)"
            style={{ transition: reduced ? undefined : "cx 600ms cubic-bezier(.16,1,.3,1), cy 600ms cubic-bezier(.16,1,.3,1)" }}
          />
        </svg>
        <div className="mt-auto space-y-3 px-1 pt-3">
          <StepControls stepper={st} label={shown >= 0 ? events[shown].tag : "start"} labels={["start", ...events.map((e) => e.tag)]} />
          <p className="font-mono text-[0.7rem] text-fg-subtle">
            {caption}
            {state && <span className="block text-focus">{state(shown)}</span>}
          </p>
        </div>
      </Panel>

      <Panel className="p-4">
        <ol ref={logRef} className="h-[22rem] space-y-2 overflow-auto pr-1 lg:h-[26rem]" aria-live="polite">
          {events.slice(0, shown + 1).map((e, i) => (
            <motion.li
              key={i}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className={cn("rounded-xl border px-3 py-2 text-sm", i === shown ? "border-focus/50 bg-focus/[0.06]" : "border-[var(--line)]")}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className={cn("font-mono text-xs uppercase tracking-wider", i === shown ? "text-focus" : "text-brand-300")}>{e.tag}</span>
                {e.meta && <span className="font-mono text-[0.7rem] tabular-nums text-fg-subtle">{e.meta}</span>}
              </div>
              <p className="mt-1 whitespace-pre-line break-words leading-snug text-fg-muted">{e.text}</p>
            </motion.li>
          ))}
          {shown < 0 && <li className="px-1 py-2 font-mono text-xs text-fg-subtle">…</li>}
        </ol>
      </Panel>
    </div>
  );
}
