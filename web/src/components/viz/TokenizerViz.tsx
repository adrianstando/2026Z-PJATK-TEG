"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ToggleGroup } from "radix-ui";
import data from "@/data/tokens.json";
import { Panel } from "@/components/ui/Panel";

const TINTS = ["bg-cat-1/20 text-cat-1", "bg-cat-2/20 text-cat-2", "bg-cat-3/20 text-cat-3", "bg-cat-4/20 text-cat-4"];
const LABEL: Record<string, string> = { pl: "polski", en: "angielski", code: "kod" };

/**
 * Organizm: tekst pocięty na tokeny prawdziwym tokenizerem (tiktoken, o200k_base —
 * ten sam, którego używają modele GPT-4o/GPT-5). Dane: scripts/generate_data.py.
 */
export function TokenizerViz() {
  const [i, setI] = useState(0);
  const [showIds, setShowIds] = useState(false);
  const s = data.samples[i];
  const chars = s.text.length;
  return (
    <Panel className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ToggleGroup.Root
          type="single"
          value={String(i)}
          onValueChange={(v) => v && setI(Number(v))}
          className="flex flex-wrap gap-1.5 rounded-xl border border-[var(--line)] p-1"
          aria-label="Przykład"
        >
          {data.samples.map((x, k) => (
            <ToggleGroup.Item
              key={k}
              value={String(k)}
              className="rounded-lg px-3 py-1.5 text-sm text-fg-muted transition-colors data-[state=on]:bg-brand-500 data-[state=on]:text-white"
            >
              {LABEL[x.lang]} {k === 2 ? "(rekord)" : ""}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-fg-muted">
          <input type="checkbox" checked={showIds} onChange={(e) => setShowIds(e.target.checked)} className="accent-brand-500" />
          pokaż ID tokenów
        </label>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={i + String(showIds)}
          className="mt-8 flex min-h-28 flex-wrap content-start gap-1.5"
          initial="hidden"
          animate="show"
          exit={{ opacity: 0 }}
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
        >
          {s.tokens.map((t, k) => (
            <motion.span
              key={k}
              variants={{ hidden: { opacity: 0, y: 14, scale: 0.8 }, show: { opacity: 1, y: 0, scale: 1 } }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`whitespace-pre rounded-[var(--radius-chip)] px-2 py-1.5 font-mono text-xl md:text-2xl ${TINTS[k % 4]}`}
            >
              {showIds ? t.id : t.t.replace(/ /g, "·")}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 grid grid-cols-3 gap-4 border-t border-[var(--line)] pt-6 text-center">
        <Stat label="znaków" value={chars} />
        <Stat label="tokenów" value={s.tokens.length} accent />
        <Stat label="znaków / token" value={(chars / s.tokens.length).toFixed(1)} />
      </div>
    </Panel>
  );
}

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div>
      <motion.p key={String(value)} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`font-mono text-3xl tabular-nums ${accent ? "text-gradient" : ""}`}>
        {value}
      </motion.p>
      <p className="mt-1 text-xs uppercase tracking-wider text-fg-subtle">{label}</p>
    </div>
  );
}
