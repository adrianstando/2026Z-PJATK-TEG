"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Slider } from "radix-ui";
import { MousePointerClick, RotateCcw } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

// Logity są ILUSTRACYJNE (ręcznie dobrane), ale mechanika jest prawdziwa:
// softmax(logit / T) -> top-k -> top-p (nucleus) -> renormalizacja -> losowanie.
const PROMPT = "Najlepszym przyjacielem człowieka jest";
const CANDIDATES = [
  { t: "pies", logit: 5.2 },
  { t: "kot", logit: 3.9 },
  { t: "książka", logit: 3.1 },
  { t: "drugi", logit: 2.6 },
  { t: "zaufanie", logit: 2.0 },
  { t: "rower", logit: 1.5 },
  { t: "ChatGPT", logit: 1.1 },
  { t: "czekolada", logit: 0.6 },
  { t: "kalkulator", logit: 0.1 },
  { t: "poniedziałek", logit: -0.6 },
];

type Row = { t: string; base: number; final: number; reason: null | "top-k" | "top-p" };
type Pick = { n: number; T: number; k: number; p: number; token: string; prob: number };

function distribution(T: number, k: number, p: number): Row[] {
  const s = CANDIDATES.map((c) => c.logit / T);
  const m = Math.max(...s);
  const e = s.map((x) => Math.exp(x - m));
  const z = e.reduce((a, b) => a + b, 0);
  const rows: Row[] = CANDIDATES.map((c, i) => ({ t: c.t, base: e[i] / z, final: 0, reason: null }));
  // kandydaci są już posortowani malejąco po logicie
  let cum = 0;
  rows.forEach((r, i) => {
    if (i >= k) r.reason = "top-k";
    else if (cum >= p) r.reason = "top-p"; // pierwszy token zawsze przechodzi
    if (!r.reason) cum += r.base;
  });
  const kept = rows.filter((r) => !r.reason).reduce((a, r) => a + r.base, 0);
  rows.forEach((r) => (r.final = r.reason ? 0 : r.base / kept));
  return rows;
}

/** Organizm: proces generowania — rozkład następnego tokenu i trzy parametry, które go zmieniają. */
export function SamplingViz() {
  const [T, setT] = useState(1);
  const [k, setK] = useState(10);
  const [p, setP] = useState(1);
  const [picks, setPicks] = useState<Pick[]>([]);
  const rows = useMemo(() => distribution(T, k, p), [T, k, p]);

  const pick = () => {
    let r = Math.random();
    let i = rows.findIndex((row) => (r -= row.final) <= 0);
    if (i < 0) i = rows.findIndex((row) => row.final > 0);
    setPicks((prev) => [{ n: (prev[0]?.n ?? 0) + 1, T, k, p, token: rows[i].t, prob: rows[i].final }, ...prev].slice(0, 8));
  };

  return (
    <Panel className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-wrap items-center gap-4">
        <p className="font-mono text-lg md:text-2xl">
          <span className="text-fg-muted">{PROMPT} </span>
          <AnimatePresence mode="popLayout">
            <motion.span
              key={picks[0]?.n ?? 0}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              className="inline-block rounded-md bg-focus/15 px-1.5 text-focus"
            >
              {picks[0]?.token ?? "▍"}
            </motion.span>
          </AnimatePresence>
        </p>
        <div className="ml-auto flex gap-2">
          <Button onClick={pick}>
            <MousePointerClick className="size-4" /> Wybierz token
          </Button>
          <Button variant="ghost" onClick={() => setPicks([])} aria-label="Wyczyść historię">
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_17rem]">
        <div className="space-y-2">
          {rows.map((r) => (
            <motion.div
              key={r.t}
              layout
              className={cn("grid grid-cols-[5.25rem_minmax(0,1fr)_2.75rem_2.75rem] items-center gap-2 sm:grid-cols-[7.5rem_1fr_3.5rem_3.5rem] sm:gap-3 transition-opacity", r.reason && "opacity-35")}
            >
              <span className="truncate font-mono text-sm text-fg-muted">{r.t}</span>
              <div className="relative h-6 overflow-hidden rounded-md bg-[var(--panel-hi)]">
                {/* rozkład po temperaturze */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-md bg-brand-500/30"
                  animate={{ width: `${r.base * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
                {/* rozkład końcowy, z którego losujemy */}
                <motion.div
                  className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-brand-500 to-cyan-400"
                  animate={{ width: `${r.final * 100}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
                {r.reason && <span className="absolute inset-y-0 right-2 flex items-center font-mono text-[0.7rem] text-miss">{r.reason}</span>}
              </div>
              <span className="text-right font-mono text-xs tabular-nums text-fg-subtle">{(r.base * 100).toFixed(1)}%</span>
              <span className="text-right font-mono text-sm tabular-nums">{r.reason ? "—" : `${(r.final * 100).toFixed(1)}%`}</span>
            </motion.div>
          ))}
          <div className="grid grid-cols-[5.25rem_minmax(0,1fr)_2.75rem_2.75rem] gap-2 sm:grid-cols-[7.5rem_1fr_3.5rem_3.5rem] sm:gap-3 pt-1 text-[0.7rem] uppercase tracking-wider text-fg-subtle">
            <span />
            <span className="flex gap-4">
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-brand-500/40" /> po temperaturze</span>
              <span className="flex items-center gap-1.5"><i className="size-2 rounded-sm bg-cyan-400" /> po top-k i top-p</span>
            </span>
            <span className="text-right">p(T)</span>
            <span className="text-right">p</span>
          </div>
        </div>

        <div className="space-y-6">
          <Param label="temperature" value={T.toFixed(2)} min={0.05} max={2} step={0.05} v={T} set={setT} hint={["ostro", "płasko"]} />
          <Param label="top_k" value={String(k)} min={1} max={10} step={1} v={k} set={setK} hint={["1 token", "wszystkie"]} />
          <Param label="top_p" value={p.toFixed(2)} min={0.05} max={1} step={0.05} v={p} set={setP} hint={["najpewniejsze", "wszystkie"]} />
        </div>
      </div>

      <div className="mt-8 overflow-x-auto border-t border-[var(--line)] pt-5">
        <table className="w-full font-mono text-xs">
          <thead className="text-left text-fg-subtle">
            <tr>
              <th className="pb-2 font-normal">generowanie</th>
              <th className="pb-2 font-normal">temperature</th>
              <th className="pb-2 font-normal">top_k</th>
              <th className="pb-2 font-normal">top_p</th>
              <th className="pb-2 font-normal">wybrany token</th>
              <th className="pb-2 text-right font-normal">p</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {picks.map((x, i) => (
                <motion.tr
                  key={x.n}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: i === 0 ? 1 : 0.6, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="border-t border-[var(--line)]"
                >
                  <td className="py-1.5 text-fg-subtle">#{x.n}</td>
                  <td>{x.T.toFixed(2)}</td>
                  <td>{x.k}</td>
                  <td>{x.p.toFixed(2)}</td>
                  <td className={x.token === "pies" ? "text-fg" : "text-focus"}>{x.token}</td>
                  <td className="text-right tabular-nums">{(x.prob * 100).toFixed(1)}%</td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {!picks.length && (
              <tr>
                <td colSpan={6} className="py-2 text-fg-subtle">
                  Kolejne kliknięcia „Wybierz token” dopisują wiersze.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Param(props: { label: string; value: string; min: number; max: number; step: number; v: number; set: (v: number) => void; hint: [string, string] }) {
  return (
    <div>
      <div className="mb-2.5 flex justify-between font-mono text-sm">
        <span className="text-fg-muted">{props.label}</span>
        <span className="text-focus">{props.value}</span>
      </div>
      <Slider.Root
        className="relative flex h-5 touch-none select-none items-center"
        min={props.min}
        max={props.max}
        step={props.step}
        value={[props.v]}
        onValueChange={([x]) => props.set(x)}
        aria-label={props.label}
      >
        <Slider.Track className="relative h-1.5 grow rounded-full bg-[var(--panel-hi)]">
          <Slider.Range className="absolute h-full rounded-full bg-gradient-to-r from-brand-500 to-focus" />
        </Slider.Track>
        <Slider.Thumb aria-label={props.label} className="block size-4.5 rounded-full border-2 border-focus bg-ink-950 outline-none focus-visible:ring-4 focus-visible:ring-focus/30" />
      </Slider.Root>
      <div className="mt-1.5 flex justify-between text-[0.7rem] text-fg-subtle">
        <span>{props.hint[0]}</span>
        <span>{props.hint[1]}</span>
      </div>
    </div>
  );
}
