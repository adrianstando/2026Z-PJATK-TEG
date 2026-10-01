"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import data from "@/data/words.json";
import { Panel } from "@/components/ui/Panel";

const W = 1000;
const H = 640;
const PAD = 70;
const GROUP_COLOR = ["var(--color-cat-1)", "var(--color-cat-2)", "var(--color-cat-3)", "var(--color-cat-4)"];

const px = (x: number) => PAD + x * (W - 2 * PAD);
const py = (y: number) => PAD + (1 - y) * (H - 2 * PAD);

/**
 * Organizm: 24 słowa jako punkty. Pozycje to t-SNE prawdziwych embeddingów
 * (paraphrase-multilingual-mpnet-base-v2, 768 wymiarów → 2), a "najbliżsi sąsiedzi" liczeni są
 * na pełnych wektorach — dlatego czasem wyglądają na daleko na płaskim rzucie.
 */
export function EmbeddingSpace() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const [sel, setSel] = useState(0);

  const neighbours = useMemo(() => {
    const row = data.similarity[sel];
    return row
      .map((s, j) => ({ j, s }))
      .filter((x) => x.j !== sel)
      .sort((a, b) => b.s - a.s)
      .slice(0, 4);
  }, [sel]);

  const w = data.words[sel];
  const gi = data.groups.indexOf(w.group);

  return (
    <div ref={ref} className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <Panel className="relative overflow-hidden p-2">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Mapa embeddingów słów">
          <defs>
            <radialGradient id="emb-glow">
              <stop offset="0%" stopColor="var(--color-brand-400)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="var(--color-brand-400)" stopOpacity="0" />
            </radialGradient>
          </defs>

          <AnimatePresence>
            {inView &&
              neighbours.map((n, k) => {
                const b = data.words[n.j];
                return (
                  <motion.g key={`${sel}-${n.j}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <motion.line
                      x1={px(w.x)}
                      y1={py(w.y)}
                      x2={px(b.x)}
                      y2={py(b.y)}
                      stroke="var(--color-focus)"
                      strokeWidth={2.5 - k * 0.4}
                      strokeDasharray="1 0"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.6, delay: k * 0.12, ease: "easeOut" }}
                    />
                    <motion.text
                      x={(px(w.x) + px(b.x)) / 2}
                      y={(py(w.y) + py(b.y)) / 2 - 8}
                      textAnchor="middle"
                      className="fill-focus font-mono text-[18px]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 + k * 0.12 }}
                    >
                      {n.s.toFixed(2)}
                    </motion.text>
                  </motion.g>
                );
              })}
          </AnimatePresence>

          {data.words.map((p, i) => {
            const color = GROUP_COLOR[data.groups.indexOf(p.group)];
            const active = i === sel;
            const near = neighbours.some((n) => n.j === i);
            return (
              <motion.g
                key={p.word}
                initial={{ x: W / 2, y: H / 2, opacity: 0, scale: 0 }}
                animate={inView ? { x: px(p.x), y: py(p.y), opacity: 1, scale: 1 } : {}}
                transition={{ type: "spring", stiffness: 70, damping: 14, delay: 0.2 + i * 0.035 }}
                onMouseEnter={() => setSel(i)}
                onClick={() => setSel(i)}
                className="cursor-pointer"
              >
                {active && <circle r={46} fill="url(#emb-glow)" />}
                <circle
                  r={active ? 11 : 7}
                  fill={color}
                  stroke={active || near ? "var(--color-focus)" : "transparent"}
                  strokeWidth={3}
                  className="transition-all duration-300"
                />
                <text y={-16} textAnchor="middle" className={`text-[19px] ${active ? "fill-fg font-semibold" : "fill-fg-muted"}`}>
                  {p.word}
                </text>
              </motion.g>
            );
          })}
        </svg>
        <div className="absolute right-5 top-4 text-right font-mono text-[0.7rem] leading-relaxed text-fg-subtle">
          rzut t-SNE wektorów 768-wymiarowych
          <br />
          model: {data.model.split("/").pop()}
          <br />
          sąsiedzi: cosinus na pełnych wektorach
        </div>
        <div className="absolute bottom-4 left-5 flex flex-wrap gap-4 text-xs text-fg-muted">
          {data.groups.map((g, i) => (
            <span key={g} className="flex items-center gap-1.5">
              <i className="size-2.5 rounded-full" style={{ background: GROUP_COLOR[i] }} />
              {g}
            </span>
          ))}
        </div>
      </Panel>

      <Panel className="flex flex-col p-6">
        <p className="text-xs uppercase tracking-wider text-fg-subtle">wybrane słowo</p>
        <AnimatePresence mode="wait">
          <motion.div key={sel} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
            <p className="mt-2 text-4xl font-semibold" style={{ color: GROUP_COLOR[gi] }}>
              {w.word}
            </p>
            <p className="mt-4 break-all font-mono text-xs leading-relaxed text-fg-muted">
              [{w.preview.map((v) => v.toFixed(3)).join(", ")}, … ]
            </p>
            <p className="mt-1 font-mono text-xs text-fg-subtle">{data.dim} liczb, długość wektora = 1</p>

            <p className="mt-6 text-xs uppercase tracking-wider text-fg-subtle">najbliżsi sąsiedzi (cosinus)</p>
            <ol className="mt-3 space-y-2">
              {neighbours.map((n, k) => (
                <motion.li
                  key={n.j}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: k * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <span className="w-24 truncate">{data.words[n.j].word}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--panel-hi)]">
                    <motion.span
                      className="block h-full rounded-full bg-focus"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, n.s) * 100}%` }}
                      transition={{ delay: 0.1 + k * 0.08, duration: 0.6 }}
                    />
                  </span>
                  <span className="font-mono text-sm tabular-nums text-fg-muted">{n.s.toFixed(2)}</span>
                </motion.li>
              ))}
            </ol>
          </motion.div>
        </AnimatePresence>

      </Panel>
    </div>
  );
}
