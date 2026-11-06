"use client";

import { ReplayFlow, type FlowEvent, type FlowLayout } from "@/components/viz/ReplayFlow";
import { GRAPH_STEPS } from "@/content/lesson03/snippets";

// Graf z draw_mermaid(): __start__ → model ⇄ tools, model → __end__.
const wide: FlowLayout = {
  W: 1000, H: 400, font: 26, nodeW: 230, nodeH: 76, token: 10,
  nodes: [
    { id: "start", label: "__start__", x: 125, y: 110, terminal: true },
    { id: "model", label: "model", x: 500, y: 110 },
    { id: "tools", label: "tools", x: 870, y: 110 },
    { id: "end", label: "__end__", x: 500, y: 320, terminal: true },
  ],
};
const narrow: FlowLayout = {
  W: 560, H: 520, font: 30, nodeW: 230, nodeH: 80, token: 12,
  nodes: [
    { id: "start", label: "__start__", x: 140, y: 60, terminal: true },
    { id: "model", label: "model", x: 140, y: 260 },
    { id: "tools", label: "tools", x: 415, y: 260 },
    { id: "end", label: "__end__", x: 140, y: 460, terminal: true },
  ],
};

// po każdym kroku węzeł dopisuje do stanu jedną wiadomość (model: AIMessage, tools: ToolMessage)
const EVENTS: FlowEvent[] = [
  ...GRAPH_STEPS.map((s, i) => ({
    node: s.node,
    tag: s.node === "model" ? (s.toolCall ? "model → tool_calls" : "model → odpowiedź") : "tools → wynik",
    text: s.text,
    meta: `stan: ${i + 2} wiad.`,
  })),
  { node: "end", tag: "tools_condition → __end__", text: "Ostatnia wiadomość nie ma tool_calls: koniec grafu." },
];

/** Organizm: przejście stanu przez graf LangGraph, odtworzone z graph.stream(stream_mode="updates"). */
export function GraphRunViz({ model }: { model: string }) {
  return (
    <ReplayFlow
      layouts={{ wide, narrow }}
      edges={[["start", "model"], ["model", "tools"], ["tools", "model"], ["model", "end"]]}
      events={EVENTS}
      start="start"
      label="Graf LangGraph"
      caption={`${model} · graph.stream(stream_mode="updates")`}
      state={(i) => `stan (MessagesState): ${i < 0 ? 1 : Math.min(i + 2, GRAPH_STEPS.length + 1)} wiadomości`}
    />
  );
}
