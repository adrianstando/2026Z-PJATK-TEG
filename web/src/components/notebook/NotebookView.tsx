import { CodeBlock } from "@/components/molecules/CodeBlock";
import { Markdown } from "@/components/molecules/Markdown";
import { Panel } from "@/components/ui/Panel";
import type { Output, Section } from "@/lib/notebooks";

/**
 * Organizm: notebook Jupytera w stylu strony. Każda sekcja (# / ##) to plansza
 * z `data-slide`, więc działają strzałki ← →. Wyniki to zapisane outputy z .ipynb.
 */
export function NotebookView({ sections, baseDir }: { sections: Section[]; baseDir: string }) {
  return (
    <div>
      {sections.map((s, si) => (
        <section key={s.id} id={s.id} data-slide className="scroll-mt-28 py-8">
          <div className="space-y-5">
            {s.cells.map((c, i) =>
              c.type === "markdown" ? (
                <div key={i} className={si === 0 && i === 0 ? "" : "[&>h2:first-child]:mt-6"}>
                  <Markdown source={c.source} baseDir={baseDir} />
                </div>
              ) : (
                <CodeCell key={i} source={c.source} n={c.n} outputs={c.outputs} />
              ),
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

function CodeCell({ source, n, outputs }: { source: string; n: number; outputs: Output[] }) {
  if (!source.trim()) {
    return (
      <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--line-strong)] px-5 py-4 font-mono text-xs text-fg-subtle">
        [{n}] miejsce na własny kod
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <CodeBlock code={source} title={`In [${n}]`} />
      {outputs.map((o, i) =>
        o.kind === "image" ? (
          <Panel key={i} className="overflow-hidden bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:${o.mime};base64,${o.data}`} alt={`Wykres z komórki ${n}`} className="mx-auto h-auto max-w-full" />
          </Panel>
        ) : (
          <Panel key={i} className="bg-ink-950/60">
            <pre
              className={`max-h-[26rem] overflow-auto whitespace-pre-wrap px-5 py-4 font-mono text-[0.8rem] leading-relaxed ${
                o.kind === "error" ? "text-miss" : "text-fg-muted"
              }`}
            >
              {o.text.trimEnd()}
            </pre>
          </Panel>
        ),
      )}
    </div>
  );
}
