"use client";

import { useState } from "react";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { CypherCode } from "@/components/molecules/CypherCode";
import { StableHeight } from "@/components/molecules/StableHeight";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";
import { SYNTAX } from "@/content/lesson04/snippets";
import { SMALL, SmallGraphSvg, edgeKey } from "./SmallGraph";

type Step = { mark: string | string[]; nodes?: string[]; edges?: string[]; result?: string[]; text: string; extra?: boolean; removed?: boolean };

const P = ["anna", "piotr", "ewa", "marek"];
const E = (rel: string, f: (e: (typeof SMALL.edges)[number]) => boolean = () => true) => SMALL.edges.filter((e) => e.rel === rel && f(e)).map(edgeKey);
const ends = (keys: string[]) => [...new Set(SMALL.edges.filter((e) => keys.includes(edgeKey(e))).flatMap((e) => [e.s, e.t]))];
const HS = E("HAS_SKILL");
const HS4 = E("HAS_SKILL", (e) => ((e.props as { years?: number }).years ?? 0) >= 4);
const HSpy = E("HAS_SKILL", (e) => e.t === "py");
const WA = E("WORKED_AT");
const piotrE = SMALL.edges.filter((e) => e.s === "piotr" || e.t === "piotr").map(edgeKey);
const OLA = "ola-HAS_SKILL-py";

// Kroki każdego przykładu: podświetlony fragment zapytania i to, co w tym momencie obejmuje dopasowanie.
// Klucz: tytuł przykładu z notebooka (EXAMPLES w komórce web:cypher-syntax).
const STEPS: Record<string, Step[]> = {
  "wszystkie węzły z etykietą": [
    { mark: "MATCH (p:Person)", nodes: P, text: "MATCH szuka wzorca; (p:Person) pasuje do każdego węzła z etykietą Person. Każde dopasowanie to jeden wiersz z zmienną p." },
    { mark: "RETURN p.name AS name, p.city AS city ORDER BY name", nodes: P, result: P, text: "RETURN wybiera kolumny (jak lista w SELECT), AS nadaje nazwę, ORDER BY sortuje." },
  ],
  "filtr WHERE": [
    { mark: "MATCH (p:Person)", nodes: P, text: "Najpierw wszystkie osoby." },
    { mark: "WHERE p.city = 'Kraków'", nodes: ["piotr", "marek"], text: "WHERE odrzuca wiersze, które nie spełniają warunku na właściwości węzła." },
    { mark: "RETURN p.name AS name", nodes: ["piotr", "marek"], result: ["piotr", "marek"], text: "Zostały dwie osoby z Krakowa." },
  ],
  "wzorzec z relacją": [
    { mark: "(p:Person)", nodes: P, text: "(p:Person): kandydaci na początek ścieżki." },
    { mark: "-[r:HAS_SKILL]->", nodes: ends(HS), edges: HS, text: "-[r:HAS_SKILL]->: od każdej osoby wychodzące relacje tego typu; zmienna r pozwala czytać ich właściwości." },
    { mark: "(s:Skill {name: 'Python'})", nodes: ends(HSpy), edges: HSpy, text: "Zostają ścieżki kończące się w węźle Python. Właściwości w nawiasie klamrowym działają jak WHERE." },
    { mark: "RETURN p.name AS name, r.years AS years ORDER BY years DESC", nodes: ends(HSpy), edges: HSpy, result: ["anna", "marek", "ewa"], text: "r.years to właściwość relacji; sortowanie malejąco po stażu." },
  ],
  "filtr na właściwości relacji": [
    { mark: "MATCH (p:Person)-[r:HAS_SKILL]->(s:Skill)", nodes: ends(HS), edges: HS, text: "Każda para osoba–umiejętność to osobny wiersz: 5 relacji, 5 wierszy." },
    { mark: "WHERE r.years >= 4", nodes: ends(HS4), edges: HS4, text: "Filtr na właściwości relacji, nie węzła: zostają połączenia z co najmniej 4 latami." },
    { mark: "RETURN p.name AS name, s.name AS skill, r.years AS years", nodes: ends(HS4), edges: HS4, result: ["anna", "piotr", "marek"], text: "W wyniku kolumny z obu węzłów i z relacji." },
  ],
  agregacja: [
    { mark: "MATCH (p:Person)-[r:HAS_SKILL]->(s:Skill)", nodes: ends(HS), edges: HS, text: "5 wierszy (osoba, relacja, umiejętność)." },
    { mark: ["s.name AS skill", "count(p) AS people", "avg(r.years) AS avg_years"], nodes: ends(HS), edges: HS, result: ["py", "k8s"], text: "Agregacja grupuje po kolumnach bez funkcji (tu s.name), jak GROUP BY w SQL: Python 3 osoby, Kubernetes 2." },
    { mark: "ORDER BY people DESC", nodes: ends(HS), edges: HS, result: ["py", "k8s"], text: "Sortowanie po nazwie kolumny z RETURN." },
  ],
  "collect: lista w wyniku": [
    { mark: "MATCH (p:Person)-[:WORKED_AT]->(c:Company)", nodes: ends(WA), edges: WA, text: "Relacja bez zmiennej: [:WORKED_AT]. Cztery wiersze osoba–firma." },
    { mark: "collect(p.name) AS people", nodes: ends(WA), edges: WA, result: ["nb", "cf"], text: "collect zbiera wartości z grupy w listę: jeden wiersz na firmę." },
  ],
  "dwa kroki po relacjach": [
    { mark: "(:Person {name: 'Anna'})", nodes: ["anna"], text: "Węzeł bez zmiennej: nie trzeba go zwracać, tylko od niego zacząć." },
    { mark: "-[:WORKED_AT]->(c:Company)", nodes: ["anna", "nb"], edges: ["anna-WORKED_AT-nb"], text: "Pierwszy krok: firma Anny." },
    { mark: "<-[:WORKED_AT]-(p:Person)", nodes: ["anna", "nb", "ewa"], edges: ["anna-WORKED_AT-nb", "ewa-WORKED_AT-nb"], text: "Drugi krok w przeciwną stronę strzałki: inne osoby z tej firmy. Neo4j nie zwraca tej samej relacji dwa razy w jednym wzorcu, więc Anny nie ma w wyniku." },
    { mark: "RETURN p.name AS colleague, c.name AS company", nodes: ["anna", "nb", "ewa"], edges: ["anna-WORKED_AT-nb", "ewa-WORKED_AT-nb"], result: ["ewa"], text: "Wynik: Ewa z Northbyte." },
  ],
  "dowolna relacja, dowolny kierunek": [
    { mark: "(:Person {name: 'Piotr'})", nodes: ["piotr"], text: "Start od Piotra." },
    { mark: "-[r]-(x)", nodes: ends(piotrE), edges: piotrE, text: "-[r]-: bez typu i bez strzałki, czyli każda relacja w obie strony. Łapie też KNOWS wchodzące od Anny." },
    { mark: "RETURN type(r) AS rel, x.name AS neighbour", nodes: ends(piotrE), edges: piotrE, result: ["cf", "anna", "k8s"], text: "type(r) zwraca typ relacji jako tekst." },
  ],
  "ścieżka zmiennej długości": [
    { mark: "(:Person {name: 'Ewa'})", nodes: ["ewa"], text: "Start od Ewy, cel: Piotr." },
    { mark: "-[*1..3]-", nodes: ["ewa", "py", "nb", "anna", "piotr"], edges: ["ewa-HAS_SKILL-py", "anna-HAS_SKILL-py", "ewa-WORKED_AT-nb", "anna-WORKED_AT-nb", "anna-KNOWS-piotr"], text: "-[*1..3]-: od 1 do 3 dowolnych relacji w dowolnym kierunku. Dwie ścieżki mają 3 kroki, przez Python i przez Northbyte." },
    { mark: "RETURN [n IN nodes(path) | n.name] AS path", nodes: ["ewa", "py", "nb", "anna", "piotr"], edges: ["ewa-HAS_SKILL-py", "anna-HAS_SKILL-py", "ewa-WORKED_AT-nb", "anna-WORKED_AT-nb", "anna-KNOWS-piotr"], result: ["piotr"], text: "path = … zapisuje całą ścieżkę; nodes(path) to lista węzłów, a [n IN … | n.name] zamienia ją na listę nazw." },
  ],
  "WITH: filtr po agregacji": [
    { mark: "MATCH (p:Person)-[:HAS_SKILL]->(s:Skill)", nodes: ends(HS), edges: HS, text: "5 par osoba–umiejętność." },
    { mark: "WITH p, count(s) AS skills", nodes: ends(HS), edges: HS, text: "WITH kończy etap zapytania: dalej idą tylko p i skills. Anna 2, pozostali po 1." },
    { mark: "WHERE skills >= 2", nodes: ["anna", "py", "k8s"], edges: E("HAS_SKILL", (e) => e.s === "anna"), text: "WHERE po WITH filtruje wynik agregacji (jak HAVING w SQL)." },
    { mark: "RETURN p.name AS name, skills", nodes: ["anna", "py", "k8s"], edges: E("HAS_SKILL", (e) => e.s === "anna"), result: ["anna"], text: "Tylko Anna zna dwie technologie." },
  ],
  "parametr $city": [
    { mark: "$city", nodes: P, text: "$city to parametr: wartość przychodzi z Pythona, cypher(query, city=\"Kraków\"). Nie skleja się tekstu zapytania, więc nie ma ryzyka wstrzyknięcia." },
    { mark: "RETURN p.name AS name", nodes: ["piotr", "marek"], result: ["piotr", "marek"], text: "{city: $city} w węźle działa jak WHERE p.city = $city." },
  ],
  "MERGE: znajdź albo utwórz": [
    { mark: "MERGE (p:Person {name: 'Ola'}) SET p.city = 'Poznań'", nodes: ["ola"], extra: true, text: "MERGE szuka osoby Ola; nie ma jej, więc tworzy węzeł. SET ustawia właściwość (jak UPDATE)." },
    { mark: "MERGE (s:Skill {name: 'Python'})", nodes: ["ola", "py"], extra: true, text: "Python już jest: MERGE go znajduje i nie tworzy drugiego węzła. CREATE utworzyłby duplikat." },
    { mark: "MERGE (p)-[:HAS_SKILL {years: 1}]->(s)", nodes: ["ola", "py"], edges: [OLA], extra: true, text: "Relacji jeszcze nie ma, więc powstaje." },
    { mark: "RETURN count(DISTINCT x) AS python_nodes, count(p) AS people", nodes: ["ola", "py", "anna", "ewa", "marek"], edges: [OLA, ...HSpy], extra: true, result: ["py"], text: "Sprawdzenie: nadal jeden węzeł Python, a zna go już 4 osoby." },
  ],
  "DETACH DELETE": [
    { mark: "MATCH (p:Person {name: 'Ola'})", nodes: ["ola"], edges: [OLA], extra: true, text: "Węzeł do usunięcia razem z jego relacją." },
    { mark: "DETACH DELETE p", nodes: [], extra: true, removed: true, text: "DETACH usuwa najpierw relacje węzła, potem sam węzeł. Samo DELETE zwróciłoby błąd, bo węzeł ma relację." },
    { mark: "MATCH (n) RETURN count(n) AS nodes", text: "Znowu 8 węzłów, jak po CREATE z sekcji 1." },
  ],
};

// wszystkie opisy kroków, zapytania i wyniki: rezerwa wysokości na najdłuższy, więc zmiana przykładu ani kroku nie przesuwa strony
const ALL_TEXTS = Object.values(STEPS).flatMap((x) => x.map((y) => y.text));
const fmtResult = (r: string) => r.replace(/\}, \{/g, "},\n{");
const resultCls = "whitespace-pre-wrap break-words font-mono text-[0.78rem] leading-relaxed";

/**
 * Organizm: przykłady składni Cypher z notebooka. Lewa kolumna: lista zapytań; prawa: zapytanie
 * z podświetlonym fragmentem, ten fragment na małym grafie i zapisany wynik z Neo4j w ostatnim kroku.
 * Wszystkie panele mają stałą wysokość.
 */
export function CypherSyntaxViz() {
  const [i, setI] = useState(0);
  const ex = SYNTAX[i];
  const steps = STEPS[ex.title] ?? [{ mark: "", text: "" }];
  return <Explorer key={i} i={i} setI={setI} ex={ex} steps={steps} />;
}

function Explorer({ i, setI, ex, steps }: { i: number; setI: (i: number) => void; ex: (typeof SYNTAX)[number]; steps: Step[] }) {
  const s = useStepper(steps.length, { interval: 2200 });
  const st = steps[s.step];
  const last = s.step === steps.length - 1;
  return (
    <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
      <nav aria-label="Przykłady zapytań" className="flex flex-wrap gap-1.5 lg:flex-col lg:flex-nowrap">
        {SYNTAX.map((x, k) => (
          <button
            key={x.title}
            type="button"
            onClick={() => setI(k)}
            aria-current={k === i}
            className={cn(
              "flex shrink-0 items-baseline gap-2 rounded-lg border px-3 py-1.5 text-left text-sm transition-colors",
              k === i ? "border-focus bg-focus/10 text-focus" : "border-[var(--line)] text-fg-muted hover:text-fg",
            )}
          >
            <span className="font-mono text-xs text-fg-subtle tabular-nums">{String(k + 1).padStart(2, "0")}</span>
            {x.title}
          </button>
        ))}
      </nav>
      <div ref={s.ref} className="min-w-0 space-y-3">
        <StepControls stepper={s} label={st.text} labels={ALL_TEXTS} />
        <StableHeight variants={SYNTAX.map((x) => <CypherCode key={x.title} wrap code={x.query} />)} mode="fill">
          <CypherCode wrap code={ex.query} mark={st.mark} />
        </StableHeight>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <Panel className="p-3">
            <SmallGraphSvg nodes={st.nodes ?? []} edges={st.edges ?? []} result={st.result ?? []} extra={!!st.extra} removed={!!st.removed} props={false} compact />
          </Panel>
          <Panel className="p-3">
            <span className="font-mono text-[0.7rem] uppercase tracking-widest text-brand-400">wynik</span>
            <StableHeight variants={SYNTAX.map((x) => <pre key={x.title} className={resultCls}>{fmtResult(x.result)}</pre>)} mode="hug" className="mt-2">
              <pre className={cn(resultCls, "transition-opacity", last ? "text-fg" : "text-fg-subtle opacity-40")}>{last ? fmtResult(ex.result) : "…"}</pre>
            </StableHeight>
          </Panel>
        </div>
      </div>
    </div>
  );
}
