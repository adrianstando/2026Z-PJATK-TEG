"use client";

import { motion, useReducedMotion } from "motion/react";
import steps from "@/data/rag-steps.json";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";

const B = steps.bm25;
const TOKENS = B.idf.map((t) => t.token);
const COLORS = ["var(--color-cat-1)", "var(--color-cat-2)", "var(--color-cat-3)", "var(--color-cat-4)"];
const MAX_IDF = Math.max(...B.idf.map((t) => t.idf), 1);
const MAX_SCORE = Math.max(...B.chunks.map((c) => c.total), 1);
const LABELS = [
  "pytanie podzielone na słowa",
  "stop-słowa wypadają, reszta przycięta do 6 znaków (prymitywny stemming)",
  `IDF: im rzadsze słowo w ${B.n_chunks} chunkach, tym więcej waży; słowo spoza korpusu waży 0`,
  "wynik chunku = suma punktów za słowa z pytania, które w nim występują",
];

/**
 * Organizm: BM25 krok po kroku dla jednego pytania: tokenizacja, IDF, suma punktów chunku.
 * Wartości z rank_bm25 (k1=1.5, b=0.75), scripts/generate_rag_steps.py.
 */
export function Bm25StepsViz() {
  const st = useStepper(LABELS.length);
  const reduce = useReducedMotion();
  const spring = { type: "spring" as const, stiffness: 120, damping: 20 };

  return (
    <div ref={st.ref} className="space-y-4">
      <StepControls stepper={st} label={LABELS[st.step]} labels={LABELS} />
      <Panel className="min-h-[18rem] p-5 md:p-6">
        <div className="flex flex-wrap gap-2">
          {B.raw.map((w, i) => {
            const stop = st.step >= 1 && !w.token;
            const cut = st.step >= 1 && w.token && w.token !== w.word;
            return (
              <motion.span key={i} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: stop ? 0.3 : 1, y: 0 }} transition={{ delay: reduce ? 0 : i * 0.05 }} className={cn("rounded-lg border px-2.5 py-1 font-mono text-sm", stop ? "border-transparent text-fg-subtle line-through" : "border-[var(--line-strong)]")}>
                {cut ? (
                  <>
                    <span className="text-focus">{w.token}</span>
                    <span className="text-fg-subtle/60">{w.word.slice(w.token!.length)}</span>
                  </>
                ) : (
                  w.word
                )}
              </motion.span>
            );
          })}
        </div>

        {st.step >= 2 && (
          <div className="mt-6 space-y-2">
            {B.idf.map((t, i) => (
              <div key={t.token} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 font-mono text-xs">
                <span style={{ color: COLORS[i % 4] }}>{t.token}</span>
                <div className="h-2.5 rounded-full bg-[var(--panel-hi)]">
                  <motion.div className="h-full rounded-full" style={{ background: COLORS[i % 4] }} initial={reduce ? false : { width: 0 }} animate={{ width: `${(t.idf / MAX_IDF) * 100}%` }} transition={{ ...spring, delay: i * 0.1 }} />
                </div>
                <span className="tabular-nums text-fg-muted">
                  IDF {t.idf.toFixed(2)} · df {t.df}
                </span>
              </div>
            ))}
          </div>
        )}

        {st.step >= 3 && (
          <div className="mt-6 space-y-2">
            {B.chunks.map((c, ci) => (
              <div key={c.id} className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3 font-mono text-xs">
                <span className={c.id.startsWith("benefity") ? "text-hit" : "text-fg-muted"}>{c.id}</span>
                <div className="flex h-4 overflow-hidden rounded bg-[var(--panel-hi)]">
                  {TOKENS.map((t, i) => (
                    <motion.div key={t} style={{ background: COLORS[i % 4] }} initial={reduce ? false : { width: 0 }} animate={{ width: `${((c.parts as Record<string, number>)[t] / MAX_SCORE) * 100}%` }} transition={{ ...spring, delay: ci * 0.15 + i * 0.1 }} />
                  ))}
                </div>
                <span className="text-right tabular-nums text-fg">{c.total.toFixed(2)}</span>
              </div>
            ))}
            <p className="pt-1 font-mono text-[0.7rem] text-fg-subtle">kolor odcinka = słowo z pytania; „pieniędzy” i „wydać” nie występują w korpusie, więc nic nie wnoszą</p>
          </div>
        )}
      </Panel>
    </div>
  );
}
