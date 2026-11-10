"use client";

import { ArrowDown, ArrowRight } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { JsonBlock } from "@/components/molecules/JsonBlock";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";
import { SEARCH_SPEC, TOOL_CALL } from "@/content/lesson03/snippets";

const STEPS = [
  "definicja narzędzia trafia do modelu razem z promptem (tools=)",
  "model odsyła wiadomość z prośbą: nazwa, argumenty jako tekst JSON i id",
  "kod aplikacji parsuje argumenty i sam wykonuje funkcję",
  "wynik wraca do modelu jako wiadomość role=tool z tym samym id",
];

// w wąskiej karcie skrócone id; pełne jest w wyniku komórki pod spodem
const SHORT_ID = `${TOOL_CALL.id.slice(0, 12)}…`;

const MODEL_MESSAGE = `{
  "role": "assistant",
  "content": null,
  "tool_calls": [{
    "id": "${SHORT_ID}",
    "function": {
      "name": "${TOOL_CALL.name}",
      "arguments": ${JSON.stringify(TOOL_CALL.args)}
    }
  }]
}`;

const APP_CODE = `args = json.loads(arguments)
result = ${TOOL_CALL.name}(**args)`;

const TOOL_MESSAGE = `{
  "role": "tool",
  "tool_call_id": "${SHORT_ID}",
  "content": ${TOOL_CALL.toolMsg.split('"content": ')[1] ?? '""'}
}`;

/** Organizm: jeden tool call krok po kroku, od definicji narzędzia do wiadomości role=tool. Dane: web:tools, web:tool-call. */
export function ToolCallAnatomyViz({ model }: { model: string }) {
  const st = useStepper(STEPS.length, { interval: 1900 });
  const { ref, step } = st;
  const idClass = cn("rounded px-0.5 transition-colors duration-500", step >= 3 ? "bg-focus/20 text-focus ring-1 ring-focus" : "text-fg");
  const card = (i: number) => cn("flex min-w-0 flex-col rounded-xl border p-3 transition-all duration-500", step === i ? "border-focus/60 bg-focus/[0.05]" : "border-[var(--line)]", step < i && "opacity-25");
  const head = "mb-2 font-mono text-[0.7rem] uppercase tracking-wider text-brand-300";
  const arrow = (i: number) => (
    <div className={cn("flex items-center justify-center text-fg-subtle transition-opacity duration-500", step < i && "opacity-20")}>
      <ArrowRight className="hidden size-5 lg:block" />
      <ArrowDown className="size-5 lg:hidden" />
    </div>
  );
  return (
    <div ref={ref}>
      <Panel className="space-y-4 p-4 md:p-5">
        <div className="grid gap-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)]">
          <div className={card(0)}>
            <p className={head}>1 · definicja narzędzia</p>
            <JsonBlock text={SEARCH_SPEC} />
            <p className="mt-auto pt-2 text-xs text-fg-subtle">tools=: model czyta to jak część system promptu</p>
          </div>
          {arrow(1)}
          <div className={card(1)}>
            <p className={head}>2 · wiadomość modelu</p>
            <JsonBlock text={MODEL_MESSAGE} mark={SHORT_ID} markClass={idClass} />
            <p className="mt-auto pt-2 text-xs text-fg-subtle">finish_reason: {TOOL_CALL.finish}</p>
          </div>
          {arrow(2)}
          <div className={card(2)}>
            <p className={head}>3 · kod aplikacji</p>
            <JsonBlock text={APP_CODE} />
            <p className="mt-auto pt-2 text-xs text-fg-subtle">model niczego nie uruchamia</p>
          </div>
          {arrow(3)}
          <div className={card(3)}>
            <p className={head}>4 · wiadomość tool</p>
            <JsonBlock text={TOOL_MESSAGE} mark={SHORT_ID} markClass={idClass} />
            <p className="mt-auto pt-2 text-xs text-fg-subtle">to samo id łączy wynik z prośbą</p>
          </div>
        </div>
        <StepControls stepper={st} label={STEPS[step]} labels={STEPS} />
      </Panel>
      <p className="mt-2 font-mono text-[0.7rem] text-fg-subtle">{model} · zapisany wynik komórki web:tool-call</p>
    </div>
  );
}
