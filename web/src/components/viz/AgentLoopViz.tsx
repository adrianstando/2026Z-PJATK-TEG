"use client";

import { ReplayFlow, type FlowEvent, type FlowLayout } from "@/components/viz/ReplayFlow";
import { REACT, type LoopEvent } from "@/content/lesson03/snippets";

// Cykl thinking → action → observation wraca do thinking; wyjście z pętli to odpowiedź tekstem.
const node = (W: number, H: number, nodeW: number, nodeH: number) => (id: string, label: string, sub: string, fx: number, fy: number, terminal = false) => ({
  id,
  label,
  sub,
  x: nodeW / 2 + 8 + fx * (W - nodeW - 16),
  y: nodeH / 2 + 4 + fy * (H - nodeH - 8),
  terminal,
});
const wide = (() => {
  const W = 1000, H = 400, nodeW = 240;
  const n = node(W, H, nodeW, 76);
  return { W, H, font: 26, nodeW, nodeH: 76, token: 10, nodes: [n("q", "question", "użytkownik", 0, 0, true), n("think", "thinking", "LLM", 0.38, 0), n("act", "action", "LLM prosi o narzędzie", 1, 0), n("observe", "observation", "aplikacja: wynik", 1, 1), n("answer", "answer", "LLM", 0.38, 1, true)] } satisfies FlowLayout;
})();
const narrow = (() => {
  const W = 560, H = 560, nodeW = 250;
  const n = node(W, H, nodeW, 88);
  return { W, H, font: 30, nodeW, nodeH: 88, token: 12, nodes: [n("q", "question", "użytkownik", 0, 0, true), n("think", "thinking", "LLM", 0, 0.5), n("act", "action", "prośba o narzędzie", 1, 0), n("observe", "observation", "aplikacja: wynik", 1, 1), n("answer", "answer", "LLM", 0, 1, true)] } satisfies FlowLayout;
})();

const TAG = { think: "thinking", act: "action", observe: "observation", answer: "answer" } as const;
// liczba tokenów wysłanych do modelu przy pierwszym zdarzeniu każdego kroku (zawsze thinking)
const loopEvents = (raw: LoopEvent[]): FlowEvent[] =>
  raw.map((e) => ({
    node: e.kind,
    tag: e.kind === "answer" ? TAG.answer : `${TAG[e.kind]} · krok ${e.step}`,
    text: e.text,
    meta: e.kind === "think" ? `wysłano ${e.tokens} tok.` : undefined,
  }));

/**
 * Organizm: pętla ReAct odtworzona z zapisanego przebiegu agenta w notebooku.
 * Domyślnie `react()` z zajęć 3; `events` pozwala odtworzyć inny przebieg w tym samym formacie (np. agent z run_cypher).
 */
export function AgentLoopViz({ model, events, caption }: { model: string; events?: LoopEvent[]; caption?: string }) {
  return (
    <ReplayFlow
      layouts={{ wide, narrow }}
      edges={[["q", "think"], ["think", "act"], ["act", "observe"], ["observe", "think"], ["think", "answer"]]}
      events={loopEvents(events ?? REACT)}
      start="q"
      label="Pętla ReAct"
      caption={caption ?? `${model} · zapisany przebieg z notebooka`}
    />
  );
}
