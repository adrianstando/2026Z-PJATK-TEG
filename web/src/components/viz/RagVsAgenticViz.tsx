"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ToggleGroup } from "radix-ui";
import { ArrowDown, Search } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { RAG_CASES, type RagSearch } from "@/content/lesson03/snippets";

const SHORT = ["rachunek", "jeden dokument", "dwa tematy"];
const plural = (n: number) => (n === 1 ? "1 wyszukiwanie" : n >= 2 && n <= 4 ? `${n} wyszukiwania` : `${n} wyszukiwań`);
const FILL = "grid h-full auto-rows-fr gap-2";
const ANSWER = "h-full rounded-xl border border-[var(--line)] p-3 text-sm leading-snug text-fg-muted";

/**
 * Molekuła lokalna: obszar tak wysoki jak najwyższa treść ze wszystkich pytań, na każdej szerokości.
 * Niewidoczne kopie rezerwują miejsce, w tej samej komórce siatki stoi aktywna treść.
 */
function Fit({ active, render }: { active: number; render: (k: number) => React.ReactNode }) {
  return (
    <div className="grid">
      {RAG_CASES.map((_, k) => (
        <div key={k} aria-hidden className="invisible min-w-0 [grid-area:1/1]">{render(k)}</div>
      ))}
      <div key={`active-${active}`} className="min-w-0 [grid-area:1/1]">{render(active)}</div>
    </div>
  );
}

/**
 * Organizm: to samo pytanie w klasycznym RAG (zawsze jedno wyszukiwanie, zapytanie = pytanie)
 * i w agentic RAG (model sam decyduje, czy i czego szukać). Przełączanie pytań nie przesuwa strony
 * (Fit), karty wypełniają przygotowane miejsce, a wiersze obu paneli są wyrównane przez subgrid.
 * Dane: komórka web:agentic-rag.
 */
export function RagVsAgenticViz() {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  if (!RAG_CASES[i]) return null;
  const item = (d: number) => ({
    initial: reduced ? false : ({ opacity: 0, y: 10 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: d },
  });
  const search = (s: RagSearch, k: number, agent: boolean) => (
    <motion.div key={k} {...item(0.1 + k * 0.2)} className={cn("flex flex-col justify-center rounded-xl border p-3", agent ? "border-focus/40 bg-focus/[0.05]" : "border-[var(--line)]")}>
      <p className={cn("flex items-start gap-2 text-sm", agent ? "text-focus" : "text-brand-300")}>
        <Search className="mt-0.5 size-3.5 shrink-0" /> <span className="break-words">{agent ? "search_policy" : "retrieve"}(„{s.query}”)</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {s.docs.map((d) => (
          <Badge key={d} tone="neutral">{d}</Badge>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-5">
      <ToggleGroup.Root type="single" value={String(i)} onValueChange={(v) => v && setI(Number(v))} className="flex flex-wrap gap-2" aria-label="Pytanie">
        {RAG_CASES.map((x, k) => (
          <ToggleGroup.Item
            key={k}
            value={String(k)}
            className="rounded-full border border-[var(--line-strong)] px-4 py-2 text-sm text-fg-muted transition-all hover:text-fg data-[state=on]:border-focus data-[state=on]:bg-focus/10 data-[state=on]:text-focus"
          >
            {SHORT[k] ?? `pytanie ${k + 1}`}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <Fit active={i} render={(k) => <p className="font-mono text-sm text-focus">„{RAG_CASES[k].question}”</p>} />

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="row-span-4 grid grid-rows-subgrid gap-y-2 p-5">
          <p className="mb-2 text-xs uppercase tracking-wider text-fg-subtle">RAG · zawsze {plural(1)}</p>
          <Fit active={i} render={(k) => <div className={FILL}>{RAG_CASES[k].rag ? search(RAG_CASES[k].rag, 0, false) : null}</div>} />
          <ArrowDown className="mx-auto size-4 text-fg-subtle" />
          <Fit active={i} render={(k) => <motion.p {...item(0.4)} className={ANSWER}>{RAG_CASES[k].ragAnswer}</motion.p>} />
        </Panel>

        <Panel className="row-span-4 grid grid-rows-subgrid gap-y-2 p-5">
          <p className="mb-2 text-xs uppercase tracking-wider text-fg-subtle">Agentic RAG · {plural(RAG_CASES[i].agent.length)}</p>
          <Fit
            active={i}
            render={(k) => {
              const found = RAG_CASES[k].agent;
              return (
                <div className={FILL}>
                  {found.length === 0 ? (
                    <motion.div {...item(0.1)} className="flex items-center rounded-xl border border-hit/40 bg-hit/[0.06] p-3 text-sm text-hit">
                      bez wyszukiwania: pytanie nie dotyczy bazy wiedzy
                    </motion.div>
                  ) : (
                    found.map((s, n) => search(s, n, true))
                  )}
                </div>
              );
            }}
          />
          <ArrowDown className="mx-auto size-4 text-fg-subtle" />
          <Fit active={i} render={(k) => <motion.p {...item(0.4 + RAG_CASES[k].agent.length * 0.2)} className={ANSWER}>{RAG_CASES[k].agentAnswer}</motion.p>} />
        </Panel>
      </div>
      <p className="font-mono text-[0.7rem] text-fg-subtle">wyszukiwanie wektorowe top-2 w 10 dokumentach (embeddinggemma) · zapisany wynik komórki web:agentic-rag</p>
    </div>
  );
}
