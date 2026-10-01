"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Slider } from "radix-ui";
import { Pause, Play } from "lucide-react";
import { Panel } from "@/components/ui/Panel";

type V3 = [number, number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const norm = (a: V3) => Math.hypot(...a);
const unit = (a: V3) => mul(a, 1 / norm(a));
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

// Wektor A jest stały; baza (u, w) prostopadła do A pozwala obracać B wokół A.
const A: V3 = unit([0.85, 0.25, 0.5]);
const U = unit(cross(A, [0, 0, 1]));
const W = cross(A, U);

const SIZE = 440;
const C = SIZE / 2;
const SCALE = 165;
const deg = (d: number) => (d * Math.PI) / 180;

const METRICS = [
  { key: "cos", label: "cosinus", formula: "A·B / (|A|·|B|)", color: "var(--color-hit)", range: [-1, 1] as const, note: "tylko kąt" },
  { key: "dot", label: "iloczyn skalarny", formula: "Σ aᵢ·bᵢ", color: "var(--color-focus)", range: [-1.6, 1.6] as const, note: "kąt i długość" },
  { key: "l2", label: "odległość euklidesowa", formula: "√Σ (aᵢ − bᵢ)²", color: "var(--color-miss)", range: [0, 2.6] as const, note: "mniej = bliżej" },
  { key: "l1", label: "odległość Manhattan", formula: "Σ |aᵢ − bᵢ|", color: "var(--color-cat-4)", range: [0, 4.4] as const, note: "mniej = bliżej" },
] as const;

/**
 * Organizm: miary podobieństwa w 3D. A stały, B sterowany kątem θ, obrotem φ wokół A
 * i długością. Kamera obraca się sama i daje się przeciągać. Cosinus zależy tylko od θ —
 * zmiana |B| albo φ go nie rusza, a iloczyn i odległości tak.
 */
export function VectorSpace3D() {
  const reduce = useReducedMotion();
  const [theta, setTheta] = useState(50);
  const [phi, setPhi] = useState(30);
  const [len, setLen] = useState(1);
  const [yaw, setYaw] = useState(-0.6);
  const [pitch, setPitch] = useState(0.35);
  const [spinning, setSpinning] = useState(false); // obrót kamery domyślnie wyłączony
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);

  // Powolny obrót kamery, gdy jest włączony i nikt nie przeciąga.
  useEffect(() => {
    if (reduce || !spinning) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      if (!drag.current) setYaw((y) => y + dt * 0.00012);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, spinning]);

  const B: V3 = mul(add(mul(A, Math.cos(deg(theta))), mul(add(mul(U, Math.cos(deg(phi))), mul(W, Math.sin(deg(phi)))), Math.sin(deg(theta)))), len);

  // Rzut prostokątny: obrót wokół osi z (yaw), potem pochylenie (pitch).
  const P = (v: V3) => {
    const x1 = v[0] * Math.cos(yaw) - v[1] * Math.sin(yaw);
    const y1 = v[0] * Math.sin(yaw) + v[1] * Math.cos(yaw);
    const sy = v[2] * Math.cos(pitch) - y1 * Math.sin(pitch);
    return { x: C + x1 * SCALE, y: C - sy * SCALE, depth: y1 * Math.cos(pitch) + v[2] * Math.sin(pitch) };
  };
  const path = (pts: V3[]) => pts.map((p, i) => `${i ? "L" : "M"}${P(p).x.toFixed(1)},${P(p).y.toFixed(1)}`).join(" ");
  const circle = (a: V3, b: V3, r = 1) => path(Array.from({ length: 73 }, (_, i) => add(mul(a, r * Math.cos(deg(i * 5))), mul(b, r * Math.sin(deg(i * 5))))));

  const values = {
    cos: dot(A, B) / (norm(A) * norm(B)),
    dot: dot(A, B),
    l2: norm(add(A, mul(B, -1))),
    l1: A.reduce((s, a, i) => s + Math.abs(a - B[i]), 0),
  };

  // Łuk kąta między A i B (promień 0.35) i rzut B na A (iloczyn skalarny).
  // Łuk po okręgu (a nie interpolacja liniowa, która dla θ≈180° przechodzi przez zero).
  const perp = theta > 0.5 ? unit(add(unit(B), mul(A, -Math.cos(deg(theta))))) : U;
  const arc = path(Array.from({ length: 31 }, (_, i) => {
    const s = deg((theta * i) / 30);
    return mul(add(mul(A, Math.cos(s)), mul(perp, Math.sin(s))), 0.35);
  }));
  const projPoint = mul(A, dot(A, B));
  const o = P([0, 0, 0]);
  const pa = P(A);
  const pb = P(B);
  const pp = P(projPoint);

  return (
    <Panel className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:p-8">
      <div
        className="relative cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          drag.current = { x: e.clientX, y: e.clientY, yaw, pitch };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          setYaw(drag.current.yaw + (e.clientX - drag.current.x) * 0.01);
          setPitch(Math.max(-0.2, Math.min(1.3, drag.current.pitch + (e.clientY - drag.current.y) * 0.01)));
        }}
        onPointerUp={() => (drag.current = null)}
      >
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto h-auto w-full max-w-[34rem]" role="img" aria-label="Dwa wektory w przestrzeni 3D">
          {/* sfera jednostkowa: równik i dwa południki */}
          <path d={circle([1, 0, 0], [0, 1, 0])} fill="none" stroke="var(--line-strong)" />
          <path d={circle([1, 0, 0], [0, 0, 1])} fill="none" stroke="var(--line)" />
          <path d={circle([0, 1, 0], [0, 0, 1])} fill="none" stroke="var(--line)" />
          {/* osie */}
          {([[1.25, 0, 0, "x"], [0, 1.25, 0, "y"], [0, 0, 1.25, "z"]] as const).map(([x, y, z, l]) => {
            const e = P([x, y, z]);
            return (
              <g key={l}>
                <line x1={o.x} y1={o.y} x2={e.x} y2={e.y} stroke="var(--line-strong)" strokeDasharray="3 4" />
                <text x={e.x} y={e.y} dx={4} dy={4} className="fill-fg-subtle font-mono text-[11px]">
                  {l}
                </text>
              </g>
            );
          })}
          {/* rzut B na A = iloczyn skalarny */}
          <line x1={pb.x} y1={pb.y} x2={pp.x} y2={pp.y} stroke="var(--color-focus)" strokeDasharray="4 4" opacity={0.7} />
          <line x1={o.x} y1={o.y} x2={pp.x} y2={pp.y} stroke="var(--color-focus)" strokeWidth={6} strokeLinecap="round" opacity={0.35} />
          {/* odległość euklidesowa między końcami */}
          <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke="var(--color-miss)" strokeWidth={2} strokeDasharray="6 5" />
          {/* kąt */}
          <path d={arc} fill="none" stroke="var(--color-hit)" strokeWidth={2.5} />
          {/* wektory */}
          <line x1={o.x} y1={o.y} x2={pa.x} y2={pa.y} stroke="var(--color-cat-1)" strokeWidth={4} strokeLinecap="round" />
          <line x1={o.x} y1={o.y} x2={pb.x} y2={pb.y} stroke="var(--color-cat-2)" strokeWidth={4} strokeLinecap="round" />
          <circle cx={pa.x} cy={pa.y} r={6} fill="var(--color-cat-1)" />
          <circle cx={pb.x} cy={pb.y} r={6} fill="var(--color-cat-2)" />
          <text x={pa.x} y={pa.y} dx={9} dy={-7} className="fill-cat-1 font-mono text-[15px] font-semibold">A</text>
          <text x={pb.x} y={pb.y} dx={9} dy={-7} className="fill-cat-2 font-mono text-[15px] font-semibold">B</text>
          <circle cx={o.x} cy={o.y} r={3} fill="var(--color-fg-subtle)" />
        </svg>
        <div className="mt-2 flex items-center justify-center gap-3 text-xs text-fg-subtle">
          <button
            type="button"
            onClick={() => setSpinning((v) => !v)}
            onPointerDown={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] px-3 py-1 text-fg-muted transition-colors hover:bg-[var(--panel-hi)] hover:text-fg"
          >
            {spinning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
            {spinning ? "zatrzymaj obrót" : "obracaj"}
          </button>
          <span>albo przeciągnij wykres</span>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <div className="space-y-3">
          {METRICS.map((m) => {
            const v = values[m.key];
            const [lo, hi] = m.range;
            const frac = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
            return (
              <div key={m.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm">
                    {m.label} <span className="text-xs text-fg-subtle">· {m.note}</span>
                  </span>
                  <span className="font-mono text-xl tabular-nums" style={{ color: m.color }}>
                    {v.toFixed(2)}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--panel-hi)]">
                  <motion.div className="h-full rounded-full" style={{ background: m.color }} animate={{ width: `${frac * 100}%` }} transition={{ type: "spring", stiffness: 200, damping: 26 }} />
                </div>
                <p className="mt-1 font-mono text-[0.7rem] text-fg-subtle">{m.formula}</p>
              </div>
            );
          })}
        </div>
        <div className="space-y-4 border-t border-[var(--line)] pt-5">
          <Ctl label="kąt θ między A i B" value={`${theta}°`} min={0} max={180} step={1} v={theta} set={setTheta} />
          <Ctl label="obrót B wokół A (φ)" value={`${phi}°`} min={0} max={360} step={1} v={phi} set={setPhi} />
          <Ctl label="długość |B|" value={len.toFixed(2)} min={0.3} max={1.6} step={0.05} v={len} set={setLen} />
        </div>
      </div>
    </Panel>
  );
}

function Ctl(props: { label: string; value: string; min: number; max: number; step: number; v: number; set: (v: number) => void }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-fg-muted">{props.label}</span>
        <span className="font-mono text-cat-2">{props.value}</span>
      </div>
      <Slider.Root className="relative flex h-5 touch-none select-none items-center" min={props.min} max={props.max} step={props.step} value={[props.v]} onValueChange={([x]) => props.set(x)} aria-label={props.label}>
        <Slider.Track className="relative h-1.5 grow rounded-full bg-[var(--panel-hi)]">
          <Slider.Range className="absolute h-full rounded-full bg-cat-2" />
        </Slider.Track>
        <Slider.Thumb aria-label={props.label} className="block size-4.5 rounded-full border-2 border-cat-2 bg-ink-950 outline-none focus-visible:ring-4 focus-visible:ring-cat-2/30" />
      </Slider.Root>
    </div>
  );
}
