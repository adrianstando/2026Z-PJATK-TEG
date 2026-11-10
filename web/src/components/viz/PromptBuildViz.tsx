"use client";

import { motion, useReducedMotion } from "motion/react";
import steps from "@/data/rag-steps.json";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";

const P = steps.prompt;
const N = P.context.length;
const LABELS = [
  "szablon: instrukcja systemowa „tylko z kontekstu”",
  ...P.context.map((c, i) => `chunk ${i + 1}/${N} wklejony do kontekstu z identyfikatorem`),
  "na końcu pytanie użytkownika; tyle tokenów płaci się za każde pytanie",
];

/**
 * Organizm: budowa promptu RAG z prawdziwych chunków (top-3 z filtrem rok ≥ 2025), z licznikiem
 * tokenów o200k_base. Dane: scripts/generate_rag_steps.py.
 */
export function PromptBuildViz() {
  const st = useStepper(LABELS.length);
  const reduce = useReducedMotion();
  const nCtx = Math.min(st.step, N);
  const withQ = st.step === N + 1;
  const tokens = P.system_tokens + P.context.slice(0, nCtx).reduce((s, c) => s + c.tokens, 0) + (withQ ? P.q_tokens : 0);
  const max = P.system_tokens + P.context.reduce((s, c) => s + c.tokens, 0) + P.q_tokens;

  return (
    <div ref={st.ref} className="space-y-4">
      <StepControls stepper={st} label={LABELS[st.step]} labels={LABELS} />
      <Panel className="overflow-hidden">
        <div className="flex items-center gap-4 border-b border-[var(--line)] px-4 py-2.5">
          <span className="font-mono text-xs text-fg-subtle">prompt</span>
          <div className="h-2 grow rounded-full bg-[var(--panel-hi)]">
            <motion.div className="h-full rounded-full bg-focus" initial={false} animate={{ width: `${(tokens / max) * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
          </div>
          <span className="font-mono text-sm tabular-nums text-focus">{tokens} tokenów</span>
        </div>
        <pre className="max-h-[26rem] overflow-auto whitespace-pre-wrap px-4 py-3 font-mono text-[0.72rem] leading-relaxed text-fg-muted sm:text-[0.8rem]">
          <span className="text-brand-300">system: </span>
          {P.system}
          {"\n\n"}
          <span className="text-brand-300">user: </span>Kontekst:
          {P.context.slice(0, nCtx).map((c) => (
            <motion.span key={c.id} className="block" initial={reduce ? false : { opacity: 0, x: -10, backgroundColor: "rgba(62,224,164,0.18)" }} animate={{ opacity: 1, x: 0, backgroundColor: "rgba(62,224,164,0)" }} transition={{ duration: 0.8 }}>
              {"\n"}
              <span className="text-hit">[{c.id}]</span> {c.text}
              <span className="text-fg-subtle"> ({c.tokens} tok.)</span>
            </motion.span>
          ))}
          {withQ && (
            <motion.span className="block" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }}>
              {"\n"}Pytanie: <span className="text-focus">{P.q}</span>
            </motion.span>
          )}
        </pre>
      </Panel>
      <p className="font-mono text-[0.7rem] text-fg-subtle">tokeny: tiktoken o200k_base (tokenizer gpt-5-nano); więcej chunków = wyższy koszt i więcej szumu dla modelu</p>
    </div>
  );
}
