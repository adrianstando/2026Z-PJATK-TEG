"use client";

import { useEffect, useRef, useState } from "react";
import { ToggleGroup } from "radix-ui";
import data from "@/data/context.json";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";

const W = 640;
const H = 380;
const CAT = { x: 110, y: 300 }; // kot zawsze w tym samym miejscu, reszta względem niego
const CONTEXT_LABEL = ["samo słowo", "…is sleeping…", "I love my…", "Training a…"];
const COLOR = { cat: "var(--color-cat-1)", dog: "var(--color-cat-2)", kitten: "var(--color-cat-3)" };

type Sims = { cat_dog: number; cat_kitten: number; dog_kitten: number };
const dist = (cos: number) => Math.sqrt(Math.max(0, 2 - 2 * cos)); // odległość wektorów o długości 1

// Wspólna skala dla wszystkich kontekstów i modeli, żeby kształty dało się porównywać.
// Skala mieści każdy trójkąt i w poziomie (pies, rzut kotka), i w pionie (wysokość kotka).
function rawTriangle(s: Sims) {
  const a = dist(s.cat_dog);
  const b = dist(s.cat_kitten);
  const c = dist(s.dog_kitten);
  const kx = (b * b + a * a - c * c) / (2 * a);
  return { a, kx, ky: Math.sqrt(Math.max(0, b * b - kx * kx)) };
}
const ALL = data.models.flatMap((m) => m.sims.map(rawTriangle));
const MAX_X = Math.max(...ALL.flatMap((t) => [t.a, t.kx]));
const MAX_Y = Math.max(...ALL.map((t) => t.ky));
const SCALE = Math.min((W - CAT.x - 90) / MAX_X, (CAT.y - 70) / MAX_Y);

/** Trójkąt z dokładnymi odległościami: kot w (0,0), pies na osi x, kotek z twierdzenia cosinusów. */
function triangle(s: Sims) {
  const { a, kx, ky } = rawTriangle(s);
  return [CAT.x + a * SCALE, CAT.y, CAT.x + kx * SCALE, CAT.y - ky * SCALE];
}

/** Płynne przejście między zestawami liczb (pozycje punktów) bez animowania atrybutów SVG przez motion. */
function useTween(target: number[], ms = 650) {
  const [value, setValue] = useState(target);
  const from = useRef(target);
  const current = useRef(target);
  useEffect(() => {
    from.current = current.current;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - t, 3);
      const next = target.map((v, i) => from.current[i] + (v - from.current[i]) * e);
      current.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target.join(",")]);
  return value;
}

/**
 * Organizm: kot / pies / kotek samodzielnie i w trzech zdaniach, w dwóch modelach.
 * Trzy punkty zawsze leżą na jednej płaszczyźnie, więc trójkąt ma dokładne odległości
 * (√(2 − 2·cos)), bez zniekształceń rzutu. Dane: scripts/generate_data.py (context.json).
 */
export function ContextSpace() {
  const [m, setM] = useState(0);
  const [ctx, setCtx] = useState(0);
  const model = data.models[m];
  const s = model.sims[ctx];
  const [dx, dy, kx, ky] = useTween(triangle(s));
  const closer: "dog" | "kitten" = s.cat_kitten > s.cat_dog ? "kitten" : "dog";

  const edge = (x2: number, y2: number, cos: number, best: boolean, labelDy: number, labelDx = 0, anchor: "middle" | "end" = "middle") => (
    <g>
      <line x1={CAT.x} y1={CAT.y} x2={x2} y2={y2} stroke={best ? "var(--color-hit)" : "var(--line-strong)"} strokeWidth={best ? 3.5 : 2} strokeLinecap="round" />
      <text x={(CAT.x + x2) / 2 + labelDx} y={(CAT.y + y2) / 2 + labelDy} textAnchor={anchor} className={cn("font-mono text-[17px]", best ? "fill-hit" : "fill-fg-subtle")}>
        cos {cos.toFixed(2)}
      </text>
    </g>
  );

  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ToggleGroup.Root type="single" value={String(m)} onValueChange={(v) => v && setM(Number(v))} className="flex gap-1 rounded-xl border border-[var(--line)] p-1" aria-label="Model">
          {data.models.map((x, i) => (
            <ToggleGroup.Item key={x.name} value={String(i)} className="rounded-lg px-3 py-1.5 font-mono text-xs text-fg-muted transition-colors data-[state=on]:bg-brand-500 data-[state=on]:text-white">
              {x.name}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
        <ToggleGroup.Root type="single" value={String(ctx)} onValueChange={(v) => v && setCtx(Number(v))} className="flex flex-wrap gap-1" aria-label="Kontekst">
          {CONTEXT_LABEL.map((c, i) => (
            <ToggleGroup.Item
              key={c}
              value={String(i)}
              className="rounded-full border border-[var(--line-strong)] px-3 py-1 text-xs text-fg-muted transition-colors data-[state=on]:border-focus data-[state=on]:bg-focus/10 data-[state=on]:text-focus"
            >
              {c}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-auto w-full overflow-visible" role="img" aria-label="Odległości między wektorami kot, pies i kotek">
        <line x1={dx} y1={dy} x2={kx} y2={ky} stroke="var(--line)" strokeWidth={1.5} strokeDasharray="5 6" />
        {edge(dx, dy, s.cat_dog, closer === "dog", 28)}
        {edge(kx, ky, s.cat_kitten, closer === "kitten", 6, -16, "end")}
        {(
          [
            ["kot", CAT.x, CAT.y, COLOR.cat],
            ["pies", dx, dy, COLOR.dog],
            ["kotek", kx, ky, COLOR.kitten],
          ] as const
        ).map(([label, x, y, color]) => (
          <g key={label}>
            <circle cx={x} cy={y} r={11} fill={color} />
            <text x={x} y={y - 20} textAnchor="middle" className="fill-fg text-[19px] font-medium">
              {label}
            </text>
          </g>
        ))}
      </svg>
      <p className="mt-2 font-mono text-[0.7rem] leading-relaxed text-fg-subtle">
        model: {model.name} ({model.name === "embeddinggemma" ? "lokalnie, Ollama" : "API OpenAI"}, {model.dim} wymiarów) · odległości na rysunku są dokładne: √(2 − 2·cos); trzy punkty zawsze mieszczą się na płaszczyźnie
      </p>
    </Panel>
  );
}
