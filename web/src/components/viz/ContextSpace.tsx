"use client";

import { useEffect, useRef, useState } from "react";
import { ToggleGroup } from "radix-ui";
import data from "@/data/context.json";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { useNarrow } from "@/lib/useMediaQuery";

const W = 640;
const H = 380;
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
const MAX_Y = Math.max(...ALL.map((t) => t.ky));
// Środek odcinka kot–pies zawsze na pionowej osi rysunku: przy zmianie odległości oba punkty
// rozsuwają się albo zbliżają symetrycznie, a kotek leży tam, gdzie wynika z odległości.
// HALF: największe wychylenie od osi (pies albo kotek) we wszystkich wariantach.
const HALF = Math.max(...ALL.flatMap((t) => [t.a / 2, Math.abs(t.kx - t.a / 2)]));
// Marginesy na podpisy: z boków na „cos …”, u góry na nazwę kotka, u dołu na podpis krawędzi kot–pies.
const SCALE = Math.min((W / 2 - 110) / HALF, (H - 70 - 50) / MAX_Y);
const BASE_Y = (H + MAX_Y * SCALE) / 2 + 10;

/** Trójkąt z dokładnymi odległościami: kot i pies na jednej poziomej linii, kotek z twierdzenia cosinusów. */
function triangle(s: Sims) {
  const { a, kx, ky } = rawTriangle(s);
  const catX = W / 2 - (a / 2) * SCALE;
  return [catX, catX + a * SCALE, catX + kx * SCALE, BASE_Y - ky * SCALE];
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
  // Rozmiary w jednostkach viewBox dobrane tak, żeby po przeskalowaniu napisy miały ok. 16 px,
  // jak w pozostałych wizualizacjach (na projektorze rysunek jest szerszy niż viewBox, na telefonie węższy).
  const T = useNarrow() ? { word: 27, cos: 24, r: 11 } : { word: 14, cos: 13, r: 8 };
  const model = data.models[m];
  const s = model.sims[ctx];
  const [cx, dx, kx, ky] = useTween(triangle(s));
  const cy = BASE_Y;
  const dy = BASE_Y;
  const closer: "dog" | "kitten" = s.cat_kitten > s.cat_dog ? "kitten" : "dog";

  const edge = (x2: number, y2: number, cos: number, best: boolean, labelDy: number, labelDx = 0, anchor: "middle" | "end" = "middle") => (
    <g>
      <line x1={cx} y1={cy} x2={x2} y2={y2} stroke={best ? "var(--color-hit)" : "var(--line-strong)"} strokeWidth={best ? 3.5 : 2} strokeLinecap="round" />
      <text x={(cx + x2) / 2 + labelDx} y={(cy + y2) / 2 + labelDy} textAnchor={anchor} className={cn("font-mono", best ? "fill-hit" : "fill-fg-subtle")} style={{ fontSize: T.cos }}>
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
            ["kot", cx, cy, COLOR.cat],
            ["pies", dx, dy, COLOR.dog],
            ["kotek", kx, ky, COLOR.kitten],
          ] as const
        ).map(([label, x, y, color]) => (
          <g key={label}>
            <circle cx={x} cy={y} r={T.r} fill={color} />
            <text x={x} y={y - T.r - 8} textAnchor="middle" className="fill-fg font-medium" style={{ fontSize: T.word }}>
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
