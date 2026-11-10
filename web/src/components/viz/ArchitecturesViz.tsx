"use client";

import { useState } from "react";
import { ToggleGroup } from "radix-ui";
import { ReplayFlow, type FlowEdge, type FlowEvent, type FlowLayout } from "@/components/viz/ReplayFlow";
import { StableHeight } from "@/components/molecules/StableHeight";
import { cn } from "@/lib/cn";
import { CRITIC, MODELS, PARALLEL, TRACE } from "@/content/lesson05/snippets";

const NAMES: Record<string, string> = { projects: "projects", hr: "hr", it: "helpdesk" };
const short = (t: string, n = 240) => (t.length > n ? t.slice(0, n).trimEnd() + " …" : t);

// wspólne wymiary: każda architektura ma ten sam viewBox, więc przełączanie nie zmienia wysokości
const WIDE = { W: 1000, H: 420, font: 24, nodeW: 200, nodeH: 70, token: 10 };
const NARROW = { W: 560, H: 630, font: 26, nodeW: 165, nodeH: 74, token: 12 };
const START = { id: "start", label: "__start__", terminal: true };
const END = { id: "end", label: "__end__", terminal: true };

type Arch = {
  id: string;
  label: string;
  how: React.ReactNode;
  layouts: { wide: FlowLayout; narrow: FlowLayout };
  edges: FlowEdge[];
  events: FlowEvent[];
  caption: string;
};

// ---------- supervisor: zapisany przebieg z notebooka ----------

const supervisor: Arch = {
  id: "supervisor",
  label: "supervisor",
  how: (
    <>
      Supervisor woła podagentów jak narzędzia i dostaje od nich tylko streszczenia; sterowanie zawsze wraca do niego. Kiedy: kilka dziedzin, każda z własnymi narzędziami i promptem.
    </>
  ),
  layouts: {
    wide: {
      ...WIDE,
      nodes: [
        { ...START, x: 130, y: 70 },
        { id: "supervisor", label: "supervisor", x: 430, y: 210, w: 230 },
        { ...END, x: 130, y: 350 },
        { id: "projects", label: NAMES.projects, x: 840, y: 70 },
        { id: "hr", label: NAMES.hr, x: 840, y: 210 },
        { id: "it", label: NAMES.it, x: 840, y: 350 },
      ],
    },
    narrow: {
      ...NARROW,
      nodes: [
        { ...START, x: 140, y: 60 },
        { ...END, x: 420, y: 60 },
        { id: "supervisor", label: "supervisor", x: 280, y: 240, w: 240 },
        { id: "projects", label: NAMES.projects, x: 100, y: 440 },
        { id: "hr", label: NAMES.hr, x: 460, y: 440 },
        { id: "it", label: NAMES.it, x: 280, y: 570 },
      ],
    },
  },
  edges: [
    ["start", "supervisor"],
    ["supervisor", "projects", "cond"],
    ["projects", "supervisor"],
    ["supervisor", "hr", "cond"],
    ["hr", "supervisor"],
    ["supervisor", "it", "cond"],
    ["it", "supervisor"],
    ["supervisor", "end", "cond"],
  ],
  events: (() => {
    // zapisany przebieg: supervisor zlecił trzy zadania w jednej odpowiedzi, podagenci działali równolegle
    const of = (kind: string) => TRACE.events.filter((e) => e.kind === kind);
    const line = (e: { agent: string; text: string }, n: number) => `${NAMES[e.agent] ?? e.agent}: ${short(e.text, n)}`;
    const agents = ["projects", "hr", "it"];
    return [
      { node: "supervisor", tag: "__start__ → supervisor", text: "Zadanie: projekty, które wydały co najmniej 90% budżetu, ich zespoły, urlopy i otwarte zgłoszenia IT." },
      { node: "projects", also: ["hr", "it"], tag: "supervisor → 3 podagentów", text: of("task").map((e) => line(e, 110)).join("\n") },
      { node: "projects", also: ["hr", "it"], tag: "podagenci · narzędzia MCP", text: of("tool").map((e) => line(e, 80)).join("\n") },
      { node: "supervisor", tag: "podagenci → supervisor", text: of("result").map((e) => line(e, 120)).join("\n\n") },
      { node: "supervisor", tag: "supervisor · raport", text: short(of("answer")[0]?.text ?? "", 420) },
      { node: "end", tag: "supervisor → __end__", text: "Supervisor nie woła już podagentów: koniec." },
    ].map((e) => ({ ...e, also: e.also?.filter((x) => agents.includes(x)) }));
  })(),
  caption: `${MODELS.agent} · zapisany przebieg z notebooka · ${TRACE.stats}`,
};

// ---------- handoff: schemat ----------

const handoff: Arch = {
  id: "handoff",
  label: "handoff",
  how: (
    <>
      Agent triage (ang. segregacja, jak w izbie przyjęć; bywa też nazywany routerem) tylko rozpoznaje sprawę i przekazuje rozmowę innemu agentowi (<code>Command(goto=…)</code>); dalej odpowiada nowy agent, bez pośrednika. Kiedy: obsługa klienta, np. rejestracja → technik → reklamacje.
    </>
  ),
  layouts: {
    wide: {
      ...WIDE,
      nodes: [
        { ...START, x: 115, y: 210 },
        { id: "front", label: "triage", x: 370, y: 210 },
        { id: "it", label: NAMES.it, x: 640, y: 90 },
        { id: "hr", label: NAMES.hr, x: 640, y: 330 },
        { ...END, x: 885, y: 210 },
      ],
    },
    narrow: {
      ...NARROW,
      nodes: [
        { ...START, x: 280, y: 60 },
        { id: "front", label: "triage", x: 280, y: 220 },
        { id: "it", label: NAMES.it, x: 110, y: 400 },
        { id: "hr", label: NAMES.hr, x: 450, y: 400 },
        { ...END, x: 280, y: 570 },
      ],
    },
  },
  edges: [
    ["start", "front"],
    ["front", "it", "cond"],
    ["front", "hr", "cond"],
    ["front", "end", "cond"],
    ["it", "end"],
    ["hr", "end"],
  ],
  events: [
    { node: "front", tag: "__start__ → triage", text: "Pytanie: „Od rana VPN odrzuca logowanie, co robić?”. Agent triage nie ma narzędzi IT." },
    { node: "it", tag: "triage → helpdesk", text: 'triage wywołuje transfer_to_helpdesk, które zwraca Command(goto="helpdesk"): triage kończy, aktywny jest helpdesk. Historia rozmowy idzie razem.' },
    { node: "it", tag: "helpdesk · narzędzie MCP", text: 'list_tickets({"status": "otwarte"}) → zgłoszenie #101 „Brak dostępu do VPN”' },
    { node: "end", tag: "helpdesk → __end__", text: "Odpowiada helpdesk. Stan pamięta aktywnego agenta, więc kolejne pytanie trafi od razu do helpdesku." },
  ],
  caption: "schemat przepływu (bez zapisanego przebiegu)",
};

// ---------- orchestrator–workers: zapisany przebieg z notebooka ----------

const finish = PARALLEL.done.slice().sort((a, b) => a.s - b.s);
const orchestrator: Arch = {
  id: "orchestrator",
  label: "orchestrator–workers",
  how: (
    <>
      Orchestrator raz dzieli zadanie na podzadania (fan-out), workerzy wykonują je równolegle i nie wracają do niego, synthesizer łączy wyniki (fan-in). Różnica wobec supervisora: plan powstaje raz na początku, a nie w pętli po każdym wyniku. W LangGraph krawędzie z jednego węzła do kilku uruchamiają je równolegle, a wspólne pole stanu potrzebuje reduktora (<code>Annotated[list, operator.add]</code>); gdy liczbę podzadań zna dopiero orchestrator, zwraca listę <code>Send</code>.
    </>
  ),
  layouts: {
    wide: {
      ...WIDE,
      nodes: [
        { ...START, x: 150, y: 60 },
        { id: "plan", label: "orchestrator", x: 150, y: 230, w: 250 },
        { id: "projects", label: NAMES.projects, sub: "worker", x: 480, y: 70 },
        { id: "hr", label: NAMES.hr, sub: "worker", x: 480, y: 210 },
        { id: "it", label: NAMES.it, sub: "worker", x: 480, y: 350 },
        { id: "synth", label: "synthesizer", x: 850, y: 210, w: 240 },
        { ...END, x: 850, y: 360 },
      ],
    },
    narrow: {
      ...NARROW,
      nodes: [
        { ...START, x: 280, y: 50 },
        { id: "plan", label: "orchestrator", x: 280, y: 180, w: 270 },
        { id: "projects", label: NAMES.projects, sub: "worker", x: 92, y: 340, w: 176 },
        { id: "hr", label: NAMES.hr, sub: "worker", x: 280, y: 340, w: 176 },
        { id: "it", label: NAMES.it, sub: "worker", x: 468, y: 340, w: 176 },
        { id: "synth", label: "synthesizer", x: 280, y: 470, w: 260 },
        { ...END, x: 280, y: 585 },
      ],
    },
  },
  edges: [
    ["start", "plan"],
    ["plan", "projects", "cond"],
    ["plan", "hr", "cond"],
    ["plan", "it", "cond"],
    ["projects", "synth"],
    ["hr", "synth"],
    ["it", "synth"],
    ["synth", "end"],
  ],
  events: [
    { node: "plan", tag: "__start__ → orchestrator", text: "Zadanie: projekty, które wydały co najmniej 90% budżetu, ich zespoły, urlopy i otwarte zgłoszenia IT." },
    {
      node: "projects",
      also: ["hr", "it"],
      tag: `orchestrator → ${PARALLEL.plan.length} × Send`,
      text: PARALLEL.plan.map((p, i) => `${i + 1}. [${NAMES[p.worker] ?? p.worker}] ${short(p.task, 90)}`).join("\n"),
    },
    {
      node: "synth",
      tag: "workerzy → synthesizer",
      text: "Wszyscy workerzy startują w tym samym kroku; zakończenie (sekundy od startu grafu):\n" + finish.map((d) => `${d.s.toFixed(1)} s · [${NAMES[d.worker] ?? d.worker}] ${short(d.task, 70)}`).join("\n"),
    },
    { node: "synth", tag: "synthesizer · odpowiedź", text: short(PARALLEL.synthesis, 360) },
    { node: "end", tag: "synthesizer → __end__", text: "Jedna odpowiedź z wyników wszystkich workerów." },
  ],
  caption: `${MODELS.agent} · zapisany przebieg z notebooka`,
};

// ---------- writer–critic: zapisany przebieg z notebooka ----------

const critic: Arch = {
  id: "critic",
  label: "writer i critic",
  how: (
    <>
      Writer pisze odpowiedź, critic ją ocenia i odsyła uwagi, aż przejdzie albo skończy się limit rund. Critic ma czysty kontekst (nie widział, jak powstawała odpowiedź) i sprawdza inaczej niż writer: tutaj działa na modelu rozumującym i sam liczy z danych, które projekty spełniają warunek.
    </>
  ),
  layouts: {
    wide: {
      ...WIDE,
      nodes: [
        { ...START, x: 130, y: 100 },
        { id: "author", label: "writer", x: 450, y: 100 },
        { id: "critic", label: "critic", x: 450, y: 320 },
        { ...END, x: 820, y: 320 },
      ],
    },
    narrow: {
      ...NARROW,
      nodes: [
        { ...START, x: 280, y: 60 },
        { id: "author", label: "writer", x: 280, y: 220 },
        { id: "critic", label: "critic", x: 280, y: 410 },
        { ...END, x: 280, y: 570 },
      ],
    },
  },
  edges: [
    ["start", "author"],
    ["author", "critic"],
    ["critic", "author", "cond"],
    ["critic", "end", "cond"],
  ],
  events: CRITIC.steps.length
    ? [
        ...CRITIC.steps.map(
          (st, i): FlowEvent => ({
            node: st.who === "writer" ? "author" : "critic",
            tag: st.who === "writer" ? (i === 0 ? "__start__ → writer" : "critic → writer") : "writer → critic",
            meta: st.who === "critic" ? (st.ok ? "ok" : "są uwagi") : undefined,
            text: (st.calls.length ? `narzędzia: ${callSummary(st.calls)}\n\n` : "") + short(st.text, 320),
          }),
        ),
        {
          node: "end",
          tag: "critic → __end__",
          text: !CRITIC.steps.at(-1)?.ok
            ? "Limit rund: koniec mimo uwag."
            : CRITIC.steps.filter((st) => st.who === "writer").length > 1
              ? "Poprawiona wersja przechodzi recenzję: krawędź warunkowa prowadzi do końca."
              : "Brak uwag: krawędź warunkowa prowadzi do końca.",
        },
      ]
    : [
        { node: "author", tag: "__start__ → writer", text: "Szkic raportu." },
        { node: "critic", tag: "writer → critic", text: "Critic sprawdza raport z danymi z narzędzi." },
        { node: "end", tag: "critic → __end__", text: "Brak uwag: koniec." },
      ],
  caption: CRITIC.steps.length ? `writer: ${MODELS.agent}, critic: ${MODELS.chat} · zapisany przebieg · ${CRITIC.stats}` : "schemat przepływu (bez zapisanego przebiegu)",
};

/** Wywołania narzędzi w skrócie: nazwa × liczba, argumenty tylko list_projects (od nich zależy wynik). */
function callSummary(calls: string[]) {
  const count = new Map<string, number>();
  for (const c of calls) {
    const name = c.startsWith("list_projects") ? c : c.slice(0, c.indexOf("("));
    count.set(name, (count.get(name) ?? 0) + 1);
  }
  return [...count].map(([n, k]) => (k > 1 ? `${n} × ${k}` : n)).join(", ");
}

const ARCHS = [supervisor, handoff, orchestrator, critic];

/**
 * Organizm: typowe architektury systemów wieloagentowych jako grafy LangGraph (węzły, krawędzie
 * warunkowe przerywane). Wszystkie warianty w jednej komórce siatki, więc przełączanie nie zmienia wysokości.
 */
export function ArchitecturesViz() {
  const [id, setId] = useState(ARCHS[0].id);
  return (
    <div>
      <ToggleGroup.Root
        type="single"
        value={id}
        onValueChange={(v) => v && setId(v)}
        className="mb-4 inline-flex flex-wrap gap-1.5 rounded-xl border border-[var(--line)] p-1"
        aria-label="Architektura"
      >
        {ARCHS.map((a) => (
          <ToggleGroup.Item key={a.id} value={a.id} className="rounded-lg px-3 py-1.5 text-sm text-fg-muted transition-colors data-[state=on]:bg-brand-500 data-[state=on]:text-white">
            {a.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <StableHeight variants={ARCHS.map((a) => <p key={a.id}>{a.how}</p>)} mode="hug" className="mb-5 max-w-4xl text-fg-muted">
        <p>{ARCHS.find((a) => a.id === id)!.how}</p>
      </StableHeight>
      <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
        {ARCHS.map((a) => (
          <div key={a.id} className={cn("self-start", a.id !== id && "invisible")} inert={a.id !== id} aria-hidden={a.id !== id}>
            <ReplayFlow layouts={a.layouts} edges={a.edges} events={a.events} start="start" label={`Architektura: ${a.label}`} caption={a.caption} />
          </div>
        ))}
      </div>
      <p className="mt-2 font-mono text-[0.7rem] text-fg-subtle">linia ciągła: zwykła krawędź · przerywana: krawędź warunkowa (o następnym węźle decyduje model albo funkcja)</p>
    </div>
  );
}
