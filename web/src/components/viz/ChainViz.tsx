import { ArrowDown, ArrowRight } from "lucide-react";
import { Fragment } from "react";
import { Panel } from "@/components/ui/Panel";

const STEPS = [
  { name: "pytanie", text: "wejście łańcucha" },
  { name: "wyszukiwanie", text: "dokumenty z bazy, np. retriever Chroma" },
  { name: "prompt", text: "szablon z kontekstem i pytaniem" },
  { name: "llm", text: "wywołanie modelu" },
  { name: "parser", text: "odpowiedź jako zwykły tekst" },
];

/** Organizm: łańcuch LangChain jako stała sekwencja kroków, bez rozgałęzień i pętli. */
export function ChainViz() {
  return (
    <Panel className="p-4 md:p-5">
      <div className="grid items-stretch gap-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto_1fr]">
        {STEPS.map((s, i) => (
          <Fragment key={s.name}>
            {i > 0 && (
              <div className="flex items-center justify-center text-fg-subtle">
                <ArrowRight className="hidden size-5 lg:block" />
                <ArrowDown className="size-5 lg:hidden" />
              </div>
            )}
            <div className="rounded-xl border border-[var(--line)] p-3">
              <p className="font-mono text-sm text-brand-300">{s.name}</p>
              <p className="mt-1 text-xs text-fg-muted">{s.text}</p>
            </div>
          </Fragment>
        ))}
      </div>
    </Panel>
  );
}
