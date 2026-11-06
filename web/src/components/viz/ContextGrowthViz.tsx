"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { Panel } from "@/components/ui/Panel";
import { CONTEXT, type ContextRow } from "@/content/lesson03/snippets";

const PARTS: { key: keyof ContextRow; label: string; color: string }[] = [
  { key: "rest", label: "definicje narzędzi i narzut", color: "var(--color-cat-1)" },
  { key: "system", label: "system prompt", color: "var(--color-fg-subtle)" },
  { key: "user", label: "pytanie", color: "var(--color-cat-2)" },
  { key: "calls", label: "wywołania narzędzi", color: "var(--color-cat-4)" },
  { key: "results", label: "wyniki narzędzi", color: "var(--color-focus)" },
];

/**
 * Organizm: okno kontekstu w kolejnych wywołaniach modelu w pętli agenta.
 * Każdy pasek to jedno wywołanie API; pasek rośnie, bo historia jest wysyłana od nowa.
 * Liczby z komórki web:context (prompt_tokens z API, części policzone tokenizerem o200k_base).
 */
export function ContextGrowthViz({ model }: { model: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduced = useReducedMotion();
  const max = Math.max(1, ...CONTEXT.map((r) => r.total));
  const sum = CONTEXT.reduce((s, r) => s + r.total, 0);
  const show = inView || reduced;

  return (
    <div ref={ref}>
      <Panel className="p-5 md:p-7">
        <ol className="space-y-5">
          {CONTEXT.map((r, i) => (
            <li key={r.call}>
              <div className="mb-1.5 flex items-baseline justify-between font-mono text-xs text-fg-subtle">
                <span>wywołanie {r.call}</span>
                <span className="tabular-nums text-fg">{r.total} tok.</span>
              </div>
              <motion.div
                className="flex h-9 overflow-hidden rounded-lg bg-[var(--panel-hi)]"
                initial={reduced ? false : { width: "0%" }}
                animate={show ? { width: `${(r.total / max) * 100}%` } : {}}
                transition={{ duration: 0.8, delay: 0.3 + i * 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                {PARTS.map((p) => (
                  <div key={p.key} title={`${p.label}: ${r[p.key]}`} style={{ width: `${((r[p.key] as number) / r.total) * 100}%`, background: p.color, opacity: 0.85 }} />
                ))}
              </motion.div>
            </li>
          ))}
        </ol>
        <motion.p
          className="mt-6 font-mono text-sm tabular-nums"
          initial={reduced ? false : { opacity: 0 }}
          animate={show ? { opacity: 1 } : {}}
          transition={{ delay: 0.5 + CONTEXT.length * 0.7 }}
        >
          suma wejścia: <span className="text-focus">{sum}</span> tokenów, ostatnie wywołanie: {CONTEXT.at(-1)?.total ?? 0}
        </motion.p>
      </Panel>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-fg-muted">
        {PARTS.map((p) => (
          <span key={p.key} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ background: p.color }} /> {p.label}
          </span>
        ))}
      </div>
      <p className="mt-2 font-mono text-[0.7rem] text-fg-subtle">{model} · prompt_tokens z API; części: tokenizer o200k_base, reszta = definicje narzędzi i narzut formatu</p>
    </div>
  );
}
