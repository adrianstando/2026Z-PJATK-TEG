"use client";

import { useState } from "react";
import { ToggleGroup } from "radix-ui";
import { Check, X } from "lucide-react";
import data from "@/data/talentmatch.json";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";

const C = data.compare;
type Item = (typeof C.items)[number];
const fmt = (v: unknown) => (Array.isArray(v) ? (v.length ? v.join(", ") : "nikt") : String(v));
// odpowiedzi modelu są w markdownie; na slajdzie zwykły tekst
const plain = (t: string) => t.replace(/\*\*/g, "").replace(/^#+\s*/gm, "").trim();
const whereText = (w: unknown): string => {
  if (!w) return "bez filtra";
  const o = w as Record<string, unknown>;
  if (Array.isArray(o.$and)) return o.$and.map(whereText).join(" AND ");
  return Object.entries(o)
    .map(([k, v]) => (typeof v === "object" && v ? Object.entries(v as Record<string, unknown>).map(([op, x]) => `${k} ${op === "$lt" ? "<" : op} ${x}`).join("") : `${k} = '${v}'`))
    .join(" AND ");
};

function Verdict({ ok }: { ok: boolean }) {
  return ok ? (
    <Badge tone="hit">
      <Check className="size-3" /> poprawnie
    </Badge>
  ) : (
    <Badge tone="miss">
      <X className="size-3" /> błędnie
    </Badge>
  );
}

const SYSTEMS = [
  { key: "rag", title: "RAG", sub: `top-4 z ${C.docs.length} CV, tylko wektory` },
  { key: "structured", title: "Structured RAG", sub: "filtr po metadanych + wektory" },
  { key: "graph", title: "GraphRAG", sub: "agent + zapytania Cypher" },
] as const;

/**
 * Organizm: to samo pytanie w trzech systemach z notebooka: RAG (k=4 najbliższe CV), structured RAG
 * (filtr metadanych ułożony przez LLM, potem wektory) i agent z narzędziem run_cypher.
 * Każda kolumna pokazuje, co system zobaczył, i jego odpowiedź; kolumny mają stałą wysokość.
 */
export function RagCompareViz() {
  const [i, setI] = useState(7);
  const it = C.items[i];
  const score = (k: "rag" | "structured" | "graph") => C.items.filter((x) => x[k].correct).length;
  return (
    <div className="space-y-4">
      <ToggleGroup.Root type="single" value={String(i)} onValueChange={(v) => v && setI(Number(v))} className="flex flex-wrap gap-2 xl:grid xl:grid-cols-5" aria-label="Pytanie">
        {C.items.map((x, k) => (
          <ToggleGroup.Item
            key={k}
            value={String(k)}
            className="flex items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] px-3.5 py-1.5 text-sm text-fg-muted transition-all hover:text-fg data-[state=on]:border-focus data-[state=on]:bg-focus/10 data-[state=on]:text-focus"
          >
            {x.kind}
            {C.items.filter((y) => y.kind === x.kind).length > 1 && ` ${C.items.slice(0, k + 1).filter((y) => y.kind === x.kind).length}`}
            <span className="font-mono text-xs tracking-tighter">
              {(["rag", "structured", "graph"] as const).map((s) => (
                <span key={s} className={x[s].correct ? "text-hit" : "text-miss"}>
                  {x[s].correct ? "✓" : "✗"}
                </span>
              ))}
            </span>
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>

      <Panel className="flex min-h-[4.5rem] flex-wrap items-baseline gap-x-4 gap-y-1 p-4">
        <span className="text-lg text-fg">{it.question}</span>
        <span className="font-mono text-sm text-hit">poprawnie: {fmt(it.expected)}</span>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-3">
        {SYSTEMS.map((sys) => (
          <Panel key={sys.key} className="flex h-[30rem] flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-brand-400">{sys.title}</p>
                <p className="text-xs text-fg-subtle">{sys.sub}</p>
              </div>
              <Verdict ok={it[sys.key].correct} />
            </div>
            <div className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
              {sys.key === "rag" && <Hits it={it} hits={it.rag.hits} />}
              {sys.key === "structured" && (
                <>
                  <p className="font-mono text-xs">
                    <span className="text-fg-subtle">filtr: </span>
                    <span className={cn("rounded px-1.5 py-0.5", it.structured.where ? "bg-focus/15 text-focus" : "text-fg-muted")}>{whereText(it.structured.where)}</span>
                  </p>
                  <p className="font-mono text-xs text-fg-muted">
                    <span className="text-fg-subtle">wektory: </span>„{it.structured.query}”
                  </p>
                  <Hits it={it} hits={it.structured.hits} />
                </>
              )}
              {sys.key === "graph" && (
                <>
                  <p className="font-mono text-xs text-fg-subtle">zapytania agenta: {it.graph.cypher.length}</p>
                  {it.graph.cypher.map((q, k) => (
                    <div key={k} className="space-y-1">
                      <pre className="whitespace-pre-wrap break-words rounded-lg bg-ink-950/60 p-2 font-mono text-[0.7rem] leading-relaxed text-fg">{q}</pre>
                      {it.graph.rows[k] && <p className="break-words rounded-lg border border-[var(--line)] bg-[var(--panel-hi)] px-2 py-1 font-mono text-[0.7rem] text-fg">→ {it.graph.rows[k]}</p>}
                    </div>
                  ))}
                </>
              )}
              <div className="border-t border-[var(--line)] pt-3">
                <p className="mb-1 font-mono text-[0.7rem] uppercase tracking-widest text-fg-subtle">odpowiedź</p>
                <p className="whitespace-pre-line text-sm leading-relaxed text-fg">{plain(it[sys.key].answer)}</p>
              </div>
            </div>
          </Panel>
        ))}
      </div>
      <p className="font-mono text-[0.7rem] text-fg-subtle">
        razem: RAG {score("rag")}/{C.items.length}, structured RAG {score("structured")}/{C.items.length}, GraphRAG {score("graph")}/{C.items.length} · filtr i ekstrakcja: {C.model.chat}, agent i odpowiedzi: {C.model.agent}, embeddingi: {C.model.embed} · ocena: czy odpowiedź zawiera poprawną liczbę albo dokładnie poprawne osoby (ground_truth.json)
      </p>
    </div>
  );
}

function Hits({ it, hits }: { it: Item; hits: { name: string; score: number }[] }) {
  const exp = Array.isArray(it.expected) ? (it.expected as string[]) : [];
  return (
    <ul className="space-y-1">
      {hits.map((h) => (
        <li key={h.name} className={cn("flex items-center justify-between rounded-md border px-2 py-1 text-xs", exp.includes(h.name) ? "border-hit/50 bg-hit/10 text-fg" : "border-[var(--line)] text-fg-muted")}>
          {h.name}
          <span className="font-mono tabular-nums text-fg-subtle">{h.score.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}
