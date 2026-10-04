"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import data from "@/data/words.json";
import { useNarrow } from "@/lib/useMediaQuery";

const W = 560;
const H = 560;
const COLORS = ["var(--color-cat-1)", "var(--color-cat-2)", "var(--color-cat-3)", "var(--color-cat-4)"];

/**
 * Organizm: ozdoba hero strony głównej, ale z prawdziwych danych — 24 słowa
 * z words.json połączone z najbliższym sąsiadem (cosinus na pełnych wektorach).
 * Punkty dryfują, krawędzie "oddychają" (tylko od 640 px wzwyż). Zapowiedź tego, co pokażemy na zajęciach 1.
 */
export function HeroConstellation() {
  // Ciągły ruch tylko na dużym ekranie; na telefonie 48 zapętlonych animacji grzało urządzenie.
  const reduce = useReducedMotion();
  const narrow = useNarrow();
  const still = reduce || narrow;
  const edges = useMemo(
    () =>
      data.similarity.map((row, i) => {
        const j = row.map((s, k) => ({ s, k })).filter((x) => x.k !== i).sort((a, b) => b.s - a.s)[0].k;
        return [i, j] as const;
      }),
    [],
  );
  // Prawy margines 130 jednostek na etykiety, żeby nie wychodziły poza viewBox.
  const pos = data.words.map((w) => ({ x: 30 + w.x * (W - 160), y: 40 + (1 - w.y) * (H - 80) }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full overflow-visible" aria-hidden>
      <defs>
        <radialGradient id="hc-glow">
          <stop offset="0%" stopColor="var(--color-brand-400)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-brand-400)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={W / 2} cy={H / 2} r={W / 2} fill="url(#hc-glow)" />
      {edges.map(([i, j], n) => (
        <motion.line
          key={`${i}-${j}`}
          x1={pos[i].x}
          y1={pos[i].y}
          x2={pos[j].x}
          y2={pos[j].y}
          stroke="var(--color-brand-300)"
          strokeWidth={1}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: still ? 0.35 : [0.15, 0.5, 0.15] }}
          transition={{
            pathLength: { duration: 1.2, delay: 0.8 + n * 0.04 },
            opacity: { duration: 4 + (n % 5), repeat: Infinity, delay: n * 0.2 },
          }}
        />
      ))}
      {data.words.map((w, i) => (
        <motion.g
          key={w.word}
          initial={{ opacity: 0, scale: 0 }}
          animate={still ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { delay: 0.3 + i * 0.03 },
            scale: { type: "spring", delay: 0.3 + i * 0.03 },
            y: { duration: 5 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.15 },
          }}
          style={{ originX: `${pos[i].x}px`, originY: `${pos[i].y}px` }}
        >
          <circle cx={pos[i].x} cy={pos[i].y} r={5} fill={COLORS[data.groups.indexOf(w.group)]} />
          <text x={pos[i].x + 9} y={pos[i].y + 4} className="fill-fg-subtle text-[13px]">
            {w.word}
          </text>
        </motion.g>
      ))}
    </svg>
  );
}
