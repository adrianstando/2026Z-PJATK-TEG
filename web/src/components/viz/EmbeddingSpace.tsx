"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { ToggleGroup } from "radix-ui";
import data from "@/data/words.json";
import { Panel } from "@/components/ui/Panel";
import { useNarrow } from "@/lib/useMediaQuery";
import { layoutLabels } from "@/lib/labelLayout";

const GROUP_COLOR = ["var(--color-cat-1)", "var(--color-cat-2)", "var(--color-cat-3)", "var(--color-cat-4)"];

// Dwa układy rysunku: szeroki (projektor) i wysoki (telefon). Czcionki w jednostkach viewBox,
// więc na telefonie muszą być większe, żeby po przeskalowaniu miały ok. 12 px.
const LAYOUT = {
  wide: { W: 1000, H: 640, PAD: 70, label: 19, sim: 18, dot: 7, hit: 11 },
  narrow: { W: 560, H: 720, PAD: 46, label: 20, sim: 19, dot: 8, hit: 12 },
};

type Mode = "tsne" | "cos";

// Widok "cos": wybrane słowo w środku, odległość od środka liniowo zależna od 1 − cos na pełnych
// wektorach. Skala dla wybranego słowa: najbliższy sąsiad na wewnętrznym pierścieniu, najdalszy
// na zewnętrznym (pierścienie podpisane wartościami cos). Kierunek: każda grupa ma swoją ćwiartkę.
const R0 = 0.16; // najbliższe słowo nie siedzi na środku
function cosRange(sel: number) {
  const row = data.similarity[sel].filter((_, j) => j !== sel);
  return { hi: Math.max(...row), lo: Math.min(...row) };
}
const radius = (cos: number, { hi, lo }: { hi: number; lo: number }) => R0 + ((hi - cos) / (hi - lo)) * (1 - R0);
const ANGLE = data.words.map((w, i) => {
  const g = data.groups.indexOf(w.group);
  const members = data.words.map((x, j) => ({ x, j })).filter((m) => m.x.group === w.group);
  const k = members.findIndex((m) => m.j === i);
  return -Math.PI / 2 + (g + (k + 0.5) / members.length) * (Math.PI / 2);
});

/**
 * Organizm: 24 słowa jako punkty, w dwóch widokach.
 * - "mapa t-SNE": rzut prawdziwych embeddingów (paraphrase-multilingual-mpnet-base-v2, 768 wymiarów → 2);
 *   pokazuje grupy, ale odległości na płaszczyźnie są zniekształcone.
 * - "odległość od słowa": wybrane słowo w środku, reszta w odległości 1 − cos liczonej na pełnych
 *   wektorach (dokładnie), jak w VectorSearchViz.
 * Najbliżsi sąsiedzi są zawsze liczeni na pełnych wektorach.
 */
export function EmbeddingSpace() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const narrow = useNarrow();
  const L = narrow ? LAYOUT.narrow : LAYOUT.wide;
  const [sel, setSel] = useState(0);
  const [mode, setMode] = useState<Mode>("tsne");

  const neighbours = useMemo(() => {
    const row = data.similarity[sel];
    return row
      .map((s, j) => ({ j, s }))
      .filter((x) => x.j !== sel)
      .sort((a, b) => b.s - a.s)
      .slice(0, 4);
  }, [sel]);

  const pos = useMemo(() => {
    const { W, H, PAD } = L;
    if (mode === "tsne") return data.words.map((p) => ({ x: PAD + p.x * (W - 2 * PAD), y: PAD + (1 - p.y) * (H - 2 * PAD) }));
    const rx = W / 2 - PAD;
    const ry = H / 2 - PAD;
    const range = cosRange(sel);
    return data.words.map((_, i) => {
      if (i === sel) return { x: W / 2, y: H / 2 };
      const r = radius(data.similarity[sel][i], range);
      return { x: W / 2 + r * rx * Math.cos(ANGLE[i]), y: H / 2 + r * ry * Math.sin(ANGLE[i]) };
    });
  }, [L, mode, sel]);

  const labels = useMemo(() => {
    // w widoku "cos" podpisy omijają etykiety pierścieni
    const range = cosRange(sel);
    const avoid =
      mode === "cos"
        ? [range.hi, (range.hi + range.lo) / 2, range.lo].map((c) => {
            const y = L.H / 2 - radius(c, range) * (L.H / 2 - L.PAD) - 6;
            return { x0: L.W / 2, y0: y - L.sim, x1: L.W / 2 + L.sim * 6, y1: y + 2 };
          })
        : [];
    return layoutLabels(data.words.map((p, i) => ({ ...pos[i], text: p.word })), { font: L.label, r: L.dot, width: L.W, height: L.H, avoid });
  }, [pos, L, mode, sel]);

  const w = data.words[sel];
  const gi = data.groups.indexOf(w.group);
  const range = cosRange(sel);
  const rings = [range.hi, (range.hi + range.lo) / 2, range.lo];

  return (
    <div ref={ref} className="space-y-4">
      <ToggleGroup.Root
        type="single"
        value={mode}
        onValueChange={(v) => v && setMode(v as Mode)}
        className="inline-flex flex-wrap gap-1 rounded-xl border border-[var(--line)] p-1"
        aria-label="Widok"
      >
        {(
          [
            ["tsne", "rzut t-SNE (sąsiedztwa wg cosinusa)"],
            ["cos", "radialnie: metryka cosinusowa"],
          ] as const
        ).map(([v, label]) => (
          <ToggleGroup.Item
            key={v}
            value={v}
            className="rounded-lg px-3 py-1.5 text-sm text-fg-muted transition-colors data-[state=on]:bg-brand-500 data-[state=on]:text-white"
          >
            {label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <Panel className="overflow-hidden p-2">
          <svg viewBox={`0 0 ${L.W} ${L.H}`} className="h-auto w-full" role="img" aria-label="Mapa embeddingów słów">
            <defs>
              <radialGradient id="emb-glow">
                <stop offset="0%" stopColor="var(--color-brand-400)" stopOpacity="0.5" />
                <stop offset="100%" stopColor="var(--color-brand-400)" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* pierścienie skali w widoku "cos" */}
            <AnimatePresence>
              {mode === "cos" &&
                rings.map((c) => {
                  const r = radius(c, range);
                  const rx = r * (L.W / 2 - L.PAD);
                  const ry = r * (L.H / 2 - L.PAD);
                  return (
                    <motion.g key={c} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ellipse cx={L.W / 2} cy={L.H / 2} rx={rx} ry={ry} fill="none" stroke="var(--line)" strokeDasharray="4 6" />
                      <text x={L.W / 2 + 6} y={L.H / 2 - ry - 6} className="fill-fg-subtle font-mono" style={{ fontSize: L.sim * 0.7 }}>
                        cos {c.toFixed(2)}
                      </text>
                    </motion.g>
                  );
                })}
            </AnimatePresence>

            <AnimatePresence>
              {inView &&
                neighbours.map((n, k) => {
                  const a = pos[sel];
                  const b = pos[n.j];
                  return (
                    <motion.g key={`${mode}-${sel}-${n.j}-${narrow}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <motion.line
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke="var(--color-focus)"
                        strokeWidth={2.5 - k * 0.4}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.6, delay: (mode === "cos" ? 0.6 : 0) + k * 0.12, ease: "easeOut" }}
                      />
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
                  initial={{ x: L.W / 2, y: L.H / 2, opacity: 0, scale: 0 }}
                  animate={inView ? { x: pos[i].x, y: pos[i].y, opacity: 1, scale: 1 } : {}}
                  transition={{ type: "spring", stiffness: 70, damping: 14, delay: inView ? 0.02 * i : 0 }}
                  // W widoku "cos" najechanie nie zmienia środka — inaczej rysunek skakałby pod kursorem.
                  onMouseEnter={() => mode === "tsne" && setSel(i)}
                  onClick={() => setSel(i)}
                  className="cursor-pointer"
                >
                  {active && <circle r={46} fill="url(#emb-glow)" />}
                  <circle
                    r={active ? L.hit : L.dot}
                    fill={color}
                    stroke={active || near ? "var(--color-focus)" : "transparent"}
                    strokeWidth={3}
                    className="transition-all duration-300"
                  />
                  <text x={labels[i].dx} y={labels[i].dy} textAnchor={labels[i].anchor} className={active ? "fill-fg font-semibold" : "fill-fg-muted"} style={{ fontSize: L.label }}>
                    {p.word}
                  </text>
                </motion.g>
              );
            })}
          </svg>
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 px-3 pb-2 pt-1">
            <div className="font-mono text-[0.7rem] leading-relaxed text-fg-subtle">
              {mode === "tsne" ? (
                <>
                  rzut t-SNE wektorów {data.dim}-wymiarowych (metryka cosinusowa)
                  <br />
                  model: {data.model.split("/").pop()}
                  <br />
                  zachowane sąsiedztwa; odległości na płaszczyźnie przybliżone
                </>
              ) : (
                <>
                  odległość od „{w.word}” = 1 − cos ({data.dim} wymiarów)
                  <br />
                  kierunek: grupa słowa, bez znaczenia
                  <br />
                  kliknięcie słowa przenosi je do środka
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-muted">
              {data.groups.map((g, i) => (
                <span key={g} className="flex items-center gap-1.5">
                  <i className="size-2.5 rounded-full" style={{ background: GROUP_COLOR[i] }} />
                  {g}
                </span>
              ))}
            </div>
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
    </div>
  );
}
