"use client";

import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";
import { reactLoop } from "@/content/lesson03/snippets";

const LINES = reactLoop.split("\n");
const find = (s: string) => LINES.findIndex((l) => l.includes(s)) + 1;

// kroki react(): który element harnessu działa i które linie kodu (1-based) mu odpowiadają
const MODEL_LINES = [find("completions.create"), find("msg = resp")];
const STOP_LINE = find("if not msg.tool_calls");
const STEPS: { part: string; label: string; lines: number[] }[] = [
  { part: "history", label: "historia: system prompt + pytanie", lines: [find("messages = [")] },
  { part: "loop", label: "pętla z limitem kroków", lines: [find("for step in range")] },
  { part: "model", label: "model dostaje całą historię i narzędzia", lines: MODEL_LINES },
  { part: "stop", label: "warunek końca: są tool_calls, więc pętla działa dalej", lines: [STOP_LINE] },
  { part: "history", label: "prośba modelu trafia do historii", lines: [find("model_dump")] },
  { part: "tools", label: "harness wykonuje narzędzie", lines: [find("calls = ["), find("for call, args"), find("result = TOOLS")] },
  { part: "history", label: "wynik narzędzia trafia do historii", lines: [find('"role": "tool"')] },
  { part: "model", label: "kolejny obieg pętli: model dostaje dłuższą historię", lines: [find("for step in range"), ...MODEL_LINES] },
  { part: "stop", label: "warunek końca: brak tool_calls, harness zwraca odpowiedź", lines: [STOP_LINE, STOP_LINE + 1, STOP_LINE + 2] },
];

const PARTS: Record<string, { title: string; text: string; cls: string }> = {
  history: { title: "historia / kontekst", text: "lista messages wysyłana w każdym wywołaniu", cls: "lg:col-start-1 lg:row-start-1" },
  loop: { title: "pętla + limit", text: "max_steps chroni przed zapętleniem", cls: "lg:col-start-3 lg:row-start-1" },
  tools: { title: "wykonanie narzędzi", text: "parsowanie argumentów, wywołanie funkcji", cls: "lg:col-start-3 lg:row-start-3" },
  stop: { title: "warunek końca", text: "brak tool_calls = odpowiedź", cls: "lg:col-start-1 lg:row-start-3" },
};

/** Organizm: agent harness, czyli kod wokół modelu. Kroki react() podświetlają element diagramu i linie kodu. */
export function HarnessViz() {
  const st = useStepper(STEPS.length, { interval: 1800 });
  const { ref, step } = st;
  const cur = STEPS[step];
  const box = (on: boolean) => cn("rounded-xl border p-3 transition-all duration-500", on ? "border-focus/60 bg-focus/[0.07]" : "border-[var(--line)]");
  return (
    <div ref={ref}>
      <Panel className="space-y-4 p-4 md:p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid grid-cols-2 gap-2 lg:grid-cols-[1fr_1.1fr_1fr] lg:grid-rows-[auto_auto_auto]">
            {Object.entries(PARTS).map(([k, p]) => (
              <div key={k} className={cn(box(cur.part === k), p.cls)}>
                <p className={cn("font-mono text-xs", cur.part === k ? "text-focus" : "text-brand-300")}>{p.title}</p>
                <p className="mt-1 text-xs text-fg-muted">{p.text}</p>
              </div>
            ))}
            <div className={cn(box(cur.part === "model"), "col-span-2 flex flex-col items-center justify-center text-center lg:col-span-1 lg:col-start-2 lg:row-start-2")}>
              <p className={cn("font-mono text-base", cur.part === "model" ? "text-focus" : "text-fg")}>model</p>
              <p className="mt-1 text-xs text-fg-muted">tylko decyduje: tekst albo tool_calls</p>
            </div>
          </div>
          <pre className="overflow-x-auto rounded-xl bg-ink-950/60 py-3 font-mono text-[0.72rem] leading-relaxed">
            <div className="inline-block min-w-full">
              {LINES.map((l, i) => (
                <div key={i} className={cn("px-3 transition-colors duration-300", cur.lines.includes(i + 1) ? "bg-focus/15 text-fg" : "text-fg-subtle")}>
                  {l || " "}
                </div>
              ))}
            </div>
          </pre>
        </div>
        <StepControls stepper={st} label={cur.label} labels={STEPS.map((x) => x.label)} />
      </Panel>
    </div>
  );
}
