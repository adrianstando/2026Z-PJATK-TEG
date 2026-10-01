"use client";

import { motion } from "motion/react";

// Zapowiedź projektu: wiedza zapisana jako graf (encje + relacje).
// Pytanie wielokrokowe: "Jaki pierwiastek nazwano na cześć kraju urodzenia jego odkrywczyni?"
const NODES = [
  { id: "msc", label: "Skłodowska-Curie", kind: 0, x: 200, y: 200 },
  { id: "pc", label: "Pierre Curie", kind: 0, x: 90, y: 340 },
  { id: "po", label: "Polon", kind: 1, x: 470, y: 110 },
  { id: "ra", label: "Rad", kind: 1, x: 470, y: 300 },
  { id: "pl", label: "Polska", kind: 2, x: 200, y: 50 },
  { id: "fr", label: "Paryż", kind: 2, x: 320, y: 380 },
  { id: "nob", label: "Nagroda Nobla", kind: 3, x: 620, y: 210 },
];
const EDGES: [string, string, string][] = [
  ["msc", "pl", "URODZIŁA_SIĘ_W"],
  ["msc", "po", "ODKRYŁA"],
  ["msc", "ra", "ODKRYŁA"],
  ["po", "pl", "NAZWANY_NA_CZEŚĆ"],
  ["msc", "pc", "MAŁŻONEK"],
  ["msc", "fr", "PRACOWAŁA_W"],
  ["ra", "nob", "NAGRODZONE"],
  ["po", "nob", "NAGRODZONE"],
];
const PATH = new Set(["msc-pl", "msc-po", "po-pl"]);
const COLOR = ["var(--color-cat-1)", "var(--color-cat-2)", "var(--color-cat-3)", "var(--color-cat-4)"];
const KIND = ["Osoba", "Pierwiastek", "Miejsce", "Wyróżnienie"];
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));

/**
 * Organizm: graf wiedzy. Węzły pojawiają się, krawędzie rysują się po kolei,
 * a na końcu podświetla się ścieżka odpowiedzi na pytanie wielokrokowe.
 * Animacją steruje rodzic (whileInView na <svg>) — dzieci mają tylko warianty.
 */
export function MiniGraph() {
  return (
    <div>
      <p className="mb-3 font-mono text-sm text-focus">„Jaki pierwiastek nazwano na cześć kraju urodzenia odkrywczyni?”</p>
      <motion.svg viewBox="0 0 720 430" className="h-auto w-full" initial="hidden" whileInView="show" viewport={{ once: true, margin: "-15% 0px" }}>
        {EDGES.map(([a, b, rel], i) => {
          const hot = PATH.has(`${a}-${b}`);
          const A = byId[a];
          const B = byId[b];
          return (
            <g key={a + b}>
              <motion.line
                x1={A.x}
                y1={A.y}
                x2={B.x}
                y2={B.y}
                stroke="var(--line-strong)"
                strokeWidth={1.5}
                variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.6, delay: 0.6 + i * 0.12 } } }}
              />
              {hot && (
                <motion.line
                  x1={A.x}
                  y1={A.y}
                  x2={B.x}
                  y2={B.y}
                  stroke="var(--color-focus)"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.7, delay: 2.2 + [...PATH].indexOf(`${a}-${b}`) * 0.5 } } }}
                />
              )}
              <motion.text
                x={(A.x + B.x) / 2}
                y={(A.y + B.y) / 2 - 6}
                textAnchor="middle"
                className={hot ? "fill-focus font-mono text-[10px]" : "fill-fg-subtle font-mono text-[10px]"}
                variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: 1 + i * 0.12 } } }}
              >
                {rel}
              </motion.text>
            </g>
          );
        })}
        {NODES.map((n, i) => (
          <motion.g key={n.id} variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { delay: i * 0.08 } } }}>
            <circle cx={n.x} cy={n.y} r={24} fill={COLOR[n.kind]} fillOpacity={0.18} stroke={COLOR[n.kind]} strokeWidth={2} />
            <text x={n.x} y={n.y + 44} textAnchor="middle" className="fill-fg text-[14px]">
              {n.label}
            </text>
          </motion.g>
        ))}
      </motion.svg>
      <div className="mt-2 flex flex-wrap gap-4 text-xs text-fg-muted">
        {KIND.map((k, i) => (
          <span key={k} className="flex items-center gap-1.5">
            <i className="size-2.5 rounded-full" style={{ background: COLOR[i] }} /> {k}
          </span>
        ))}
        <span className="text-focus">— ścieżka odpowiedzi</span>
      </div>
    </div>
  );
}
