"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion, useInView } from "motion/react";
import { Slider, ToggleGroup } from "radix-ui";
import { Search } from "lucide-react";
import data from "@/data/search.json";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { useNarrow } from "@/lib/useMediaQuery";
import { layoutLabels } from "@/lib/labelLayout";

const dot = (a: number[], b: number[]) => a.reduce((s, v, i) => s + v * b[i], 0);

// Układ radialny zamiast rzutu PCA: PCA zachowuje tu tylko ~24% wariancji, więc punkty
// bliskie na płaszczyźnie wcale nie musiały być bliskie w 768 wymiarach. Tutaj zapytanie
// jest w środku, a odległość dokumentu od środka to dokładnie 1 − cos (wspólna skala dla
// wszystkich zapytań). Kąt nic nie znaczy: dokumenty mają stałe, równo rozłożone kierunki.
// Szeroki układ (projektor) i wysoki (telefon); czcionki w jednostkach viewBox.
const LAYOUT = {
  wide: { W: 1000, H: 620, PAD: 60, R_MIN: 70, EX: 1.45, label: 16, rank: 12, ring: 12, q: 15, dot: 9, hit: 12 },
  narrow: { W: 560, H: 640, PAD: 40, R_MIN: 52, EX: 0.85, label: 19, rank: 16, ring: 17, q: 21, dot: 11, hit: 15 },
};
type Layout = (typeof LAYOUT)["wide"];
const ALL_COS = data.queries.flatMap((q) => data.docs.map((d) => dot(q.v, d.v)));
const COS_HI = Math.max(...ALL_COS);
const COS_LO = Math.min(...ALL_COS);
const ANGLE = new Map(
  [...data.docs]
    .sort((a, b) => Math.atan2(a.y - 0.5, a.x - 0.5) - Math.atan2(b.y - 0.5, b.x - 0.5))
    .map((d, i, arr) => [d.id, (i / arr.length) * 2 * Math.PI - Math.PI / 2]),
);
const ringR = (L: Layout, cos: number) => L.R_MIN + ((COS_HI - cos) / (COS_HI - COS_LO)) * (L.H / 2 - L.PAD - L.R_MIN);
const place = (L: Layout, id: number, cos: number) => {
  const r = ringR(L, cos);
  const a = ANGLE.get(id)!;
  return { x: L.W / 2 + r * Math.cos(a) * L.EX, y: L.H / 2 + r * Math.sin(a) };
};

type Phase = "idle" | "drop" | "scan" | "rank";

/**
 * Organizm: jak działa wyszukiwanie w bazie wektorowej.
 * 1) zapytanie zamieniamy na wektor, 2) liczymy cosinus z KAŻDYM dokumentem
 * (brute force), 3) bierzemy k najlepszych. Wyniki są liczone na żywo
 * z prawdziwych wektorów (EmbeddingGemma, 768 wymiarów) — nic nie jest "ustawione".
 * Odległość od zapytania na rysunku = 1 − cos (dokładnie), kierunek jest umowny.
 */
export function VectorSearchViz() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25% 0px" });
  const [q, setQ] = useState(0);
  const [k, setK] = useState(3);
  const [phase, setPhase] = useState<Phase>("idle");
  const L = useNarrow() ? LAYOUT.narrow : LAYOUT.wide;

  const query = data.queries[q];
  const ranked = useMemo(
    () => data.docs.map((d) => ({ ...d, score: dot(query.v, d.v) })).sort((a, b) => b.score - a.score),
    [query],
  );
  const top = new Set(ranked.slice(0, k).map((d) => d.id));
  const rankOf = new Map(ranked.map((d, i) => [d.id, i + 1]));
  const pos = new Map(ranked.map((d) => [d.id, place(L, d.id, d.score)]));
  const shortName = (d: { source: string }) => d.source.split(" ").slice(-1)[0];
  // podpisy omijają zapytanie w środku i jego etykietę
  const qBox = { x0: L.W / 2 - 70, y0: L.H / 2 - 20, x1: L.W / 2 + 70, y1: L.H / 2 + 30 + L.q };
  const labelPos = new Map(
    layoutLabels(
      data.docs.map((d) => ({ ...pos.get(d.id)!, text: shortName(d) })),
      { font: L.label, r: L.hit, width: L.W, height: L.H, avoid: [
        qBox,
        ...[COS_HI, (COS_HI + COS_LO) / 2, COS_LO].map((c) => {
          const y = L.H / 2 - ringR(L, c) - 6;
          return { x0: L.W / 2, y0: y - L.ring, x1: L.W / 2 + L.ring * 6, y1: y + 2 };
        }),
      ] },
    ).map((l, i) => [data.docs[i].id, l]),
  );

  useEffect(() => {
    if (!inView) return;
    setPhase("drop");
    const t1 = setTimeout(() => setPhase("scan"), 600);
    const t2 = setTimeout(() => setPhase("rank"), 600 + 1300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [q, inView]);

  const qx = L.W / 2;
  const qy = L.H / 2;

  return (
    <div ref={ref} className="space-y-5">
      <ToggleGroup.Root
        type="single"
        value={String(q)}
        onValueChange={(v) => v && setQ(Number(v))}
        className="flex flex-wrap gap-2"
        aria-label="Zapytanie"
      >
        {data.queries.map((x, i) => (
          <ToggleGroup.Item
            key={i}
            value={String(i)}
            className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] px-4 py-2 text-sm text-fg-muted transition-all hover:text-fg data-[state=on]:border-focus data-[state=on]:bg-focus/10 data-[state=on]:text-focus"
          >
            <Search className="size-3.5" /> {x.text}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>

      <div className="grid gap-5 lg:grid-cols-[1fr_26rem]">
        <Panel className="relative overflow-hidden p-2">
          <svg viewBox={`0 0 ${L.W} ${L.H}`} className="h-auto w-full" role="img" aria-label="Wyszukiwanie najbliższych wektorów">
            {/* pierścienie skali: odległość od środka = 1 − cos */}
            {[COS_HI, (COS_HI + COS_LO) / 2, COS_LO].map((c) => {
              const r = ringR(L, c);
              return (
                <g key={c}>
                  <ellipse cx={qx} cy={qy} rx={r * L.EX} ry={r} fill="none" stroke="var(--line)" strokeDasharray="4 6" />
                  <text x={qx + 6} y={qy - r - 6} className="fill-fg-subtle font-mono" style={{ fontSize: L.ring }}>
                    cos {c.toFixed(2)}
                  </text>
                </g>
              );
            })}

            {/* skan: zapytanie porównywane z każdym dokumentem */}
            <AnimatePresence>
              {phase === "scan" &&
                data.docs.map((d, i) => (
                  <motion.line
                    key={`scan-${q}-${d.id}`}
                    x1={qx}
                    y1={qy}
                    x2={pos.get(d.id)!.x}
                    y2={pos.get(d.id)!.y}
                    stroke="var(--color-brand-400)"
                    strokeWidth={1.2}
                    initial={{ pathLength: 0, opacity: 0.9 }}
                    animate={{ pathLength: 1, opacity: 0.35 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.05 }}
                  />
                ))}
            </AnimatePresence>

            {/* top-k */}
            {phase === "rank" &&
              ranked.slice(0, k).map((d, i) => (
                <motion.line
                  key={`hit-${q}-${d.id}`}
                  x1={qx}
                  y1={qy}
                  x2={pos.get(d.id)!.x}
                  y2={pos.get(d.id)!.y}
                  stroke="var(--color-hit)"
                  strokeWidth={4 - i * 0.5}
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.55, delay: i * 0.15, ease: [0.16, 1, 0.3, 1] }}
                />
              ))}

            {data.docs.map((d) => {
              const hit = phase === "rank" && top.has(d.id);
              const dim = phase === "rank" && !hit;
              return (
                <motion.g
                  key={d.id}
                  initial={{ opacity: 0, x: pos.get(d.id)!.x, y: pos.get(d.id)!.y }}
                  animate={inView ? { opacity: dim ? 0.3 : 1, x: pos.get(d.id)!.x, y: pos.get(d.id)!.y } : {}}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], opacity: { duration: 0.4, delay: inView && phase === "idle" ? d.id * 0.04 : 0 } }}
                >
                  {/* Powiększenie przez promień, nie przez scale grupy — scale przesuwał punkty względem linii. */}
                  <circle
                    cx={0}
                    cy={0}
                    r={hit ? L.hit : L.dot}
                    fill={hit ? "var(--color-hit)" : "var(--color-fg-subtle)"}
                    style={{ transition: "r 300ms, fill 300ms" }}
                  />
                  <text x={labelPos.get(d.id)!.dx} y={labelPos.get(d.id)!.dy} textAnchor={labelPos.get(d.id)!.anchor} className="fill-fg-muted" style={{ fontSize: L.label }}>
                    {shortName(d)}
                  </text>
                  {hit && (
                    <motion.text
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      x={0}
                      y={L.rank * 0.38}
                      textAnchor="middle"
                      className="fill-ink-950 font-mono font-bold"
                      style={{ fontSize: L.rank }}
                    >
                      {rankOf.get(d.id)}
                    </motion.text>
                  )}
                </motion.g>
              );
            })}

            {/* zapytanie: spada z góry i "pinguje" */}
            <motion.g key={`q-${q}`} initial={{ y: -80, opacity: 0 }} animate={inView ? { y: 0, opacity: 1 } : {}} transition={{ type: "spring", stiffness: 160, damping: 14 }}>
              {[0, 1, 2].map((r) => (
                <motion.circle
                  key={r}
                  cx={qx}
                  cy={qy}
                  r={10}
                  fill="none"
                  stroke="var(--color-focus)"
                  strokeWidth={2}
                  initial={{ r: 10, opacity: 0.8 }}
                  animate={{ r: 120, opacity: 0 }}
                  transition={{ duration: 2.2, repeat: 1, delay: r * 0.7, ease: "easeOut" }}
                />
              ))}
              <circle cx={qx} cy={qy} r={13} fill="var(--color-focus)" />
              <text x={qx} y={qy + 22 + L.q} textAnchor="middle" className="fill-focus font-mono font-semibold" style={{ fontSize: L.q }}>
                zapytanie
              </text>
            </motion.g>
          </svg>
          <div className="px-3 pb-2 font-mono text-[0.7rem] text-fg-subtle md:absolute md:left-5 md:top-4 md:p-0 md:text-xs">
            {phase === "scan" ? `porównanie z ${data.docs.length} wektorami…` : phase === "rank" ? `top-${k} z ${data.docs.length}` : ""}
            <span className="block">odległość od zapytania = 1 − cos (768 wymiarów), kierunek bez znaczenia</span>
          </div>
        </Panel>

        <Panel className="flex flex-col p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-fg-subtle">ranking: cosine similarity</p>
            <div className="flex w-36 items-center gap-3">
              <span className="font-mono text-sm text-hit">k={k}</span>
              <Slider.Root className="relative flex h-5 grow touch-none items-center" min={1} max={5} step={1} value={[k]} onValueChange={([v]) => setK(v)} aria-label="k">
                <Slider.Track className="relative h-1 grow rounded-full bg-[var(--panel-hi)]">
                  <Slider.Range className="absolute h-full rounded-full bg-hit" />
                </Slider.Track>
                <Slider.Thumb aria-label="k" className="block size-4 rounded-full border-2 border-hit bg-ink-950 outline-none" />
              </Slider.Root>
            </div>
          </div>
          <LayoutGroup>
            <ol className="space-y-1.5">
              {(phase === "rank" ? ranked : data.docs.map((d) => ({ ...d, score: NaN }))).slice(0, 7).map((d, i) => (
                <motion.li
                  layout
                  key={d.id}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm transition-colors",
                    phase === "rank" && i < k ? "border-hit/40 bg-hit/[0.07]" : "border-transparent opacity-50",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-xs text-fg-subtle">{d.source}</span>
                    <span className="font-mono text-xs tabular-nums text-hit">{Number.isNaN(d.score) ? "…" : d.score.toFixed(3)}</span>
                  </div>
                  <p className="mt-1 leading-snug">{d.text}</p>
                </motion.li>
              ))}
            </ol>
          </LayoutGroup>
        </Panel>
      </div>
    </div>
  );
}
