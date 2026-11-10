"use client";

import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { CypherCode } from "@/components/molecules/CypherCode";
import { StableHeight } from "@/components/molecules/StableHeight";
import { useStepper } from "@/lib/useStepper";
import { SMALL, SmallGraphSvg, edgeKey, nodeById, propsText } from "./SmallGraph";

const node = (id: string) => {
  const n = nodeById(id)!;
  return `(${id}:${n.kind} ${propsText(n.props as Record<string, unknown>)})`;
};
const edge = (s: string, rel: string, t: string) => {
  const e = SMALL.edges.find((x) => x.s === s && x.t === t && x.rel === rel)!;
  const pr = propsText(e.props as Record<string, unknown>);
  return { key: edgeKey(e), code: `(${s})-[:${rel}${pr ? " " + pr : ""}]->(${t})`, pr };
};

type Part = { mark: string; text: string };
type Step = { title: string; code: string; parts: Part[]; nodes: string[]; edges: string[] };

const anna = nodeById("anna")!;
const hs = edge("anna", "HAS_SKILL", "py");
const wa = edge("anna", "WORKED_AT", "nb");
const kn = edge("anna", "KNOWS", "piotr");

const STEPS: Step[] = [
  {
    title: "węzeł",
    code: node("anna"),
    nodes: ["anna"],
    edges: [],
    parts: [
      { mark: "anna", text: "zmienna: nazwa węzła w tym zapytaniu, w bazie jej nie ma" },
      { mark: ":Person", text: "etykieta: typ węzła (PascalCase)" },
      { mark: propsText(anna.props as Record<string, unknown>), text: "właściwości: pary klucz: wartość, jak kolumny w wierszu" },
    ],
  },
  {
    title: "węzeł innego typu",
    code: node("py"),
    nodes: ["py"],
    edges: [],
    parts: [
      { mark: ":Skill", text: "inna etykieta, inny zestaw właściwości: schemat nie jest sztywny" },
      { mark: "{name: 'Python'}", text: "tylko nazwa; staż nie jest cechą umiejętności, tylko osoby, która ją zna" },
    ],
  },
  {
    title: "relacja z właściwością",
    code: hs.code,
    nodes: ["anna", "py"],
    edges: [hs.key],
    parts: [
      { mark: "(anna)", text: "początek: węzeł wskazany zmienną" },
      { mark: ":HAS_SKILL", text: "typ relacji (UPPER_SNAKE_CASE)" },
      { mark: hs.pr, text: "właściwość relacji: lata doświadczenia Anny w Pythonie" },
      { mark: "->", text: "kierunek: od osoby do umiejętności" },
    ],
  },
  {
    title: "relacja z datą",
    code: wa.code,
    nodes: ["anna", "nb"],
    edges: [wa.key],
    parts: [
      { mark: ":WORKED_AT", text: "inny typ relacji między tymi samymi rodzajami węzłów co w tabeli łączącej" },
      { mark: wa.pr, text: "od kiedy: właściwość połączenia, nie osoby ani firmy" },
    ],
  },
  {
    title: "relacja bez właściwości",
    code: kn.code,
    nodes: ["anna", "piotr"],
    edges: [kn.key],
    parts: [
      { mark: ":KNOWS", text: "relacja między dwoma osobami; właściwości są opcjonalne" },
      { mark: "->", text: "kierunek jest zawsze zapisany, ale w zapytaniu można go pominąć: -[:KNOWS]-" },
    ],
  },
];

function Notation({ st }: { st: Step }) {
  return (
    <div className="space-y-4">
      <CypherCode wrap code={st.code} mark={st.parts.map((p) => p.mark)} className="text-sm sm:text-base" />
      <ul className="space-y-2.5 text-sm leading-relaxed">
        {st.parts.map((p, i) => (
          <li key={i} className="flex items-start gap-3">
            <code className="shrink-0 self-start rounded bg-focus/15 px-1.5 py-0.5 font-mono text-xs text-focus">{p.mark}</code>
            <span className="text-fg-muted">{p.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Organizm: jak zapisać w Cypherze każdy element małego grafu. Krok podświetla węzeł albo relację
 * na rysunku i rozkłada jej zapis na części (zmienna, etykieta, typ, właściwości, kierunek).
 * Panel z zapisem ma wysokość najdłuższego kroku (StableHeight), więc kroki nie przesuwają strony.
 * Pełne CREATE całego grafu jest na slajdzie pod animacją.
 */
export function CypherNotationViz() {
  const s = useStepper(STEPS.length, { interval: 2400 });
  const st = STEPS[s.step];
  return (
    <div ref={s.ref} className="space-y-4">
      <StepControls stepper={s} label={st.title} labels={STEPS.map((x) => x.title)} />
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Panel className="flex items-center p-4 md:p-5">
          <SmallGraphSvg nodes={st.nodes} edges={st.edges} props />
        </Panel>
        <Panel className="p-5">
          <StableHeight variants={STEPS.map((x) => <Notation key={x.title} st={x} />)} mode="hug">
            <Notation st={st} />
          </StableHeight>
        </Panel>
      </div>
    </div>
  );
}
