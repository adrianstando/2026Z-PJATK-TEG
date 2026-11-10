import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, ExternalLink, Mail, SquarePen } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { Slide } from "@/components/site/Slide";
import { HeroTitle } from "@/components/lesson/HeroTitle";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { CodeBlock } from "@/components/molecules/CodeBlock";
import { Terminal } from "@/components/molecules/Terminal";
import { Callout } from "@/components/molecules/Callout";
import { Reveal } from "@/components/motion/Reveal";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { GraphModelViz } from "@/components/viz/GraphModelViz";
import { CypherNotationViz } from "@/components/viz/CypherNotationViz";
import { CypherSyntaxViz } from "@/components/viz/CypherSyntaxViz";
import { ExtractionViz } from "@/components/viz/ExtractionViz";
import { DedupViz } from "@/components/viz/DedupViz";
import { TalentGraph } from "@/components/viz/TalentGraph";
import { MatchQueryViz } from "@/components/viz/MatchQueryViz";
import { AgentLoopViz } from "@/components/viz/AgentLoopViz";
import { RagCompareViz } from "@/components/viz/RagCompareViz";
import { parseReact } from "@/content/lesson03/snippets";
import * as S from "@/content/lesson04/snippets";
import { colabUrl } from "@/lib/paths";
import { cn } from "@/lib/cn";

export const metadata: Metadata = { title: "Zajęcia 4 · GraphRAG i grafy wiedzy" };

const AGENDA = [
  { label: "Graf", id: "graf" },
  { label: "Zapis w Cypherze", id: "zapis" },
  { label: "Składnia Cypher", id: "cypher" },
  { label: "Ekstrakcja grafu wiedzy", id: "ekstrakcja" },
  { label: "Schemat", id: "schemat" },
  { label: "Spójność encji", id: "spojnosc" },
  { label: "Graf TalentMatch", id: "talentmatch" },
  { label: "Trudniejsze zapytanie", id: "dopasowanie" },
  { label: "Agentic GraphRAG", id: "agent" },
  { label: "RAG, structured RAG, GraphRAG", id: "porownanie" },
  { label: "Kiedy które", id: "kiedy" },
  { label: "Zadanie", id: "zadanie" },
];

// Ściąga składni: to samo co tabela w sekcji 2 notebooka, skrócona do najczęstszych elementów.
const SYNTAX_TABLE: [string, string, string][] = [
  ["MATCH", "znajdź wszystkie dopasowania wzorca", "SELECT … FROM … JOIN"],
  ["OPTIONAL MATCH", "brak dopasowania daje null", "LEFT JOIN"],
  ["WHERE", "filtr na właściwościach węzłów i relacji", "WHERE"],
  ["RETURN … AS …", "kolumny wyniku i ich nazwy", "lista w SELECT"],
  ["count, avg, sum, collect", "agregacje; collect zbiera wartości w listę", "COUNT, AVG, GROUP BY"],
  ["ORDER BY, LIMIT", "sortowanie i limit", "to samo"],
  ["WITH", "kończy etap: dalej idą tylko podane zmienne", "podzapytanie, HAVING"],
  ["CREATE", "zawsze tworzy nowy węzeł albo relację", "INSERT"],
  ["MERGE", "znajdź albo utwórz", "INSERT … ON CONFLICT"],
  ["SET", "ustawia właściwości", "UPDATE … SET"],
  ["DETACH DELETE", "usuwa węzeł razem z relacjami", "DELETE z kaskadą"],
  ["UNWIND $lista AS x", "lista z Pythona → wiersze", "unnest()"],
  ["$param", "parametr przekazany z Pythona", "? / %s"],
  ["coalesce(a, b)", "pierwsza wartość różna od null", "COALESCE"],
  ["[x IN lista WHERE … | …]", "filtr i przekształcenie listy", "—"],
];

const CONSISTENCY = [
  { title: "Słownik nazw kanonicznych", text: "'k8s' → 'Kubernetes'. Układa go kod albo LLM, a człowiek może go przejrzeć i poprawić." },
  { title: "Lista dozwolonych wartości", text: "Literal[…] albo enum w schemacie Pydantic. Pewne, ale nowa technologia spoza listy przepada." },
  { title: "Normalizacja i fuzzy matching", text: "Wielkość liter, spacje, kropki; podobieństwo napisów (np. rapidfuzz) do nazw, które już są w grafie." },
  { title: "Istniejące węzły w prompcie", text: "Model dostaje listę nazw z grafu albo najbliższe nazwy znalezione po embeddingach i wybiera istniejący węzeł." },
  { title: "Unikalny klucz i MERGE", text: "Ograniczenie UNIQUE w Neo4j i MERGE przy ładowaniu: ta sama nazwa nigdy nie da drugiego węzła." },
];

type Mark = "ok" | "part" | "no";
const WHEN: { q: string; rag: [Mark, string]; st: [Mark, string]; graph: [Mark, string] }[] = [
  { q: "Fakt z jednego dokumentu", rag: ["ok", "wystarcza"], st: ["ok", "wystarcza"], graph: ["ok", "jeśli fakt jest w schemacie"] },
  { q: "Treść opisowa, pytania otwarte", rag: ["ok", "naturalne"], st: ["ok", "naturalne"], graph: ["no", "poza schematem"] },
  { q: "Filtr + treść („kto z Krakowa … płatności”)", rag: ["no", "filtr tylko przypadkiem"], st: ["ok", "filtr metadanych, potem wektory"], graph: ["no", "treść poza schematem"] },
  { q: "Zliczanie, agregacja", rag: ["no", "widzi tylko top-k"], st: ["no", "nadal top-k"], graph: ["ok", "liczy baza"] },
  { q: "Relacje wielokrokowe", rag: ["no", "fakty w różnych CV"], st: ["no", "fakty w różnych CV"], graph: ["ok", "ścieżka w grafie"] },
  { q: "Koszt przygotowania", rag: ["ok", "chunking + embeddingi"], st: ["part", "+ metadane z ekstrakcji"], graph: ["no", "schemat, ekstrakcja, spójność encji"] },
];
const markClass: Record<Mark, string> = { ok: "text-hit", part: "text-focus", no: "text-miss" };

// narzędzie i graf; make_llm (wybór klienta Azure/OpenAI) zostaje w notebooku
const agentCode = [S.between(S.NB.agent.code, "@tool", "def make_llm"), S.between(S.NB.agent.code, "llm_with_tools")].join("\n\n");
const agentEvents = parseReact(S.NB["agent-run"].output);
const agentQuestion = S.NB["agent-run"].code.match(/ask\("([^"]+)"\)/)?.[1] ?? "";

export default function Lesson04() {
  return (
    <>
      <SiteNav />
      <main>
        <Slide id="start">
          <HeroTitle
            eyebrow="Zajęcia 4 z 8"
            lines={["GraphRAG", "i grafy wiedzy"]}
            accentLine={0}
            lead="Wiedza z dokumentów zapisana jako graf encji i relacji. Neo4j i język Cypher, ekstrakcja grafu przez LLM, agent, który sam pisze zapytania do grafu, i porównanie RAG, structured RAG i GraphRAG."
          />
          <Reveal delay={1} className="mt-12 flex flex-wrap gap-2">
            {AGENDA.map((a, i) => (
              <a
                key={a.id}
                href={`#${a.id}`}
                className="rounded-full border border-[var(--line)] bg-[var(--panel)] px-3.5 py-1.5 text-sm text-fg-muted transition-colors hover:border-brand-400 hover:text-fg"
              >
                <span className="mr-2 font-mono text-brand-400">{String(i + 1).padStart(2, "0")}</span>
                {a.label}
              </a>
            ))}
          </Reveal>
        </Slide>

        <Slide id="graf">
          <SectionHeading
            eyebrow="01 · Graf"
            accent="Węzły i krawędzie"
            title="jako model danych"
            lead="Węzeł ma etykietę i właściwości, relacja ma typ, kierunek i też może mieć właściwości: lata doświadczenia to cecha połączenia osoby z umiejętnością, a nie samej osoby. Te same dane da się zapisać w tabelach; w grafie tabela łącząca staje się krawędzią."
          />
          <Reveal delay={0.2} className="mt-12">
            <GraphModelViz />
          </Reveal>
        </Slide>

        <Slide id="zapis">
          <SectionHeading
            eyebrow="02 · Zapis w Cypherze"
            accent="Każdy element"
            title="ma swój zapis"
            lead="Cypher to język zapytań bazy Neo4j. Węzeł zapisuje się w nawiasach okrągłych, relację w kwadratowych, kierunek strzałką. Dane węzłów i relacji to właściwości w nawiasach klamrowych."
          />
          <Reveal delay={0.2} className="mt-12">
            <CypherNotationViz />
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <CodeBlock code={S.CREATE_CODE} lang="cypher" title="cały graf jednym CREATE: te same zapisy oddzielone przecinkami" />
          </Reveal>
        </Slide>

        <Slide id="cypher">
          <SectionHeading
            eyebrow="03 · Składnia Cypher"
            accent="Wzorzec,"
            title="filtr, wynik"
            lead="Zapytanie opisuje wzorzec do znalezienia w grafie, a Neo4j zwraca wszystkie jego dopasowania jako wiersze."
          />
          <Reveal delay={0.2} className="mt-12">
            <CypherSyntaxViz />
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <Panel className="overflow-x-auto p-2">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="font-mono text-xs uppercase tracking-widest text-fg-subtle">
                  <tr>
                    <th className="p-2.5">Cypher</th>
                    <th className="p-2.5">Znaczenie</th>
                    <th className="p-2.5">Odpowiednik w SQL</th>
                  </tr>
                </thead>
                <tbody>
                  {SYNTAX_TABLE.map(([c, m, sql]) => (
                    <tr key={c} className="border-t border-[var(--line)]">
                      <td className="whitespace-nowrap p-2.5 font-mono text-brand-300">{c}</td>
                      <td className="p-2.5 text-fg-muted">{m}</td>
                      <td className="p-2.5 font-mono text-xs text-fg-subtle">{sql}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </Reveal>
        </Slide>

        <Slide id="ekstrakcja">
          <SectionHeading
            eyebrow="04 · Ekstrakcja grafu wiedzy"
            accent="Z tekstu"
            title="do grafu"
            lead="Graf można wypełnić ręcznie (formularz, import z istniejącej bazy) albo automatycznie z dokumentów. Wtedy LLM czyta tekst i wypełnia podany schemat: jakie węzły, relacje i właściwości mają powstać. Kod zamienia wynik na węzły i krawędzie."
          />
          <Reveal delay={0.2} className="mt-12">
            <ExtractionViz />
          </Reveal>
        </Slide>

        <Slide id="schemat">
          <SectionHeading
            eyebrow="05 · Schemat"
            accent="Pydantic"
            title="i structured outputs"
            lead="Pydantic to klasa Pythona z typami pól, podobna do dataclass, ale przy tworzeniu obiektu sprawdza i konwertuje typy, obsługuje modele zagnieżdżone i generuje JSON Schema. Przekazana jako response_format wymusza na modelu odpowiedź zgodną ze schematem; wynik od razu jest obiektem."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1} className="h-full">
              <CodeBlock code={S.NB.schema.code} title="notebook.ipynb · schemat" highlight={[5, 17]} className="h-full" />
            </Reveal>
            <div className="flex flex-col gap-4">
              <Reveal delay={0.2}>
                <CodeBlock code={S.between(S.NB.extract.code, "def extract", "cv = extract")} title="extract()" highlight={[2, 5, 7]} />
              </Reveal>
              <Reveal delay={0.3} className="flex-1">
                <Terminal output={S.NB.extract.output} title={`${S.MODELS.chat} · ${S.MODELS.provider}`} className="h-full" />
              </Reveal>
            </div>
          </div>
        </Slide>

        <Slide id="spojnosc">
          <SectionHeading
            eyebrow="06 · Spójność encji"
            accent="Jedna encja,"
            title="jeden węzeł"
            lead="Przy ręcznym wpisywaniu formularz z listą wyboru pilnuje jednej nazwy. LLM zapisuje nazwy tak, jak w tekście: „K8s” i „Kubernetes” to wtedy dwa węzły, a zapytanie o Kubernetes pomija część osób. O spójności trzeba pomyśleć już przy projektowaniu ekstrakcji."
          />
          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {CONSISTENCY.map((c, i) => (
              <Reveal key={c.title} delay={0.1 + i * 0.05} className="h-full">
                <Panel className="h-full p-4">
                  <p className="font-medium text-fg">{c.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{c.text}</p>
                </Panel>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.3} className="mt-6">
            <DedupViz />
          </Reveal>
        </Slide>

        <Slide id="talentmatch">
          <SectionHeading
            eyebrow="07 · Graf TalentMatch"
            accent="Przykładowy graf"
            title="w projekcie TalentMatch"
            lead="Tak może wyglądać graf w projekcie typu TalentMatch: 14 CV i 3 zapytania ofertowe (RFP) po ekstrakcji. Każda linia zapytania Cypher zawęża zbiór węzłów: od punktu startowego, przez relacje, do wyniku. Kliknięcie węzła pokazuje jego sąsiadów."
          />
          <Reveal delay={0.2} className="mt-12">
            <TalentGraph />
          </Reveal>
        </Slide>

        <Slide id="dopasowanie">
          <SectionHeading
            eyebrow="08 · Trudniejsze zapytanie"
            accent="Dopasowanie do RFP"
            title="krok po kroku"
            lead="Jedno dłuższe zapytanie łączy wymagania RFP, staż w każdej technologii i dostępność. WITH dzieli je na etapy, collect zwija wiersze w listę, a operacje na listach liczą spełnione wymagania. Wynik wynika z jawnych reguł, więc wiadomo, dlaczego ktoś odpada."
          />
          <Reveal delay={0.2} className="mt-12">
            <MatchQueryViz />
          </Reveal>
        </Slide>

        <Slide id="agent">
          <SectionHeading
            eyebrow="09 · Agentic GraphRAG"
            accent="Agent pisze Cypher,"
            title="baza liczy"
            lead="Ta sama pętla ReAct co na zajęciach 3, tylko narzędziem jest baza grafowa. Agent dostaje narzędzie run_cypher i w system prompcie schemat grafu: węzły, relacje, właściwości. Sam układa zapytania, czyta wyniki i decyduje, czy potrzebuje kolejnego."
          />
          <Reveal delay={0.15} className="mt-12">
            <Panel className="mb-4 p-4 text-lg text-fg">
              <span className="mr-3 font-mono text-xs uppercase tracking-widest text-brand-400">pytanie</span>
              {agentQuestion}
            </Panel>
            <AgentLoopViz model={S.MODELS.agent} events={agentEvents} caption={`${S.MODELS.agent} · LangGraph`} />
          </Reveal>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <Reveal delay={0.2}>
              <CodeBlock code={agentCode} title="notebook.ipynb · narzędzie i graf LangGraph" highlight={[1, 2, 10, 19]} />
            </Reveal>
            <div className="space-y-4">
              <Reveal delay={0.3}>
                <CodeBlock code={S.NB["agent-schema"].code} title="notebook.ipynb · schemat grafu w system prompcie" highlight={[1, 12]} />
              </Reveal>
            </div>
          </div>
        </Slide>

        <Slide id="porownanie">
          <SectionHeading
            eyebrow="10 · RAG, structured RAG, GraphRAG"
            accent="Trzy podejścia,"
            title="te same pytania"
            lead="Baza wektorowa i graf zbudowane z tych samych 14 CV. RAG szuka tylko po embeddingach. Structured RAG najpierw filtruje po metadanych z ekstrakcji (miasto, dostępność), a potem szuka wektorowo; filtr układa LLM z pytania. GraphRAG to agent z poprzedniego slajdu."
          />
          <Reveal delay={0.2} className="mt-12">
            <RagCompareViz />
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <Callout>
              Filtr po metadanych przed wyszukiwaniem wektorowym obsługują m.in. Chroma (<code>where</code>), pgvector (zwykły <code>WHERE</code> w SQL obok operatora odległości), Azure AI Search i Azure Cosmos DB.
            </Callout>
          </Reveal>
        </Slide>

        <Slide id="kiedy">
          <SectionHeading
            eyebrow="11 · Wybór"
            accent="Każde podejście"
            title="wygrywa gdzie indziej"
            lead="Graf odpowiada na pytania o wiele dokumentów naraz i o relacje między nimi, ale tylko w granicach schematu. Wyszukiwanie wektorowe radzi sobie z treścią, a filtr po metadanych dokłada do niego twarde warunki. W praktyce często łączy się te podejścia (Neo4j ma też indeksy wektorowe)."
          />
          <Reveal delay={0.2} className="mt-12">
            <Panel className="overflow-x-auto p-2">
              <table className="w-full min-w-[44rem] text-left text-sm">
                <thead className="font-mono text-xs uppercase tracking-widest text-fg-subtle">
                  <tr>
                    <th className="p-3">Pytanie</th>
                    <th className="p-3">RAG</th>
                    <th className="p-3">Structured RAG</th>
                    <th className="p-3">GraphRAG</th>
                  </tr>
                </thead>
                <tbody>
                  {WHEN.map((r) => (
                    <tr key={r.q} className="border-t border-[var(--line)]">
                      <td className="p-3 text-fg">{r.q}</td>
                      {[r.rag, r.st, r.graph].map(([m, t], k) => (
                        <td key={k} className={cn("p-3", markClass[m])}>
                          {t}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </Reveal>
        </Slide>

        <Slide id="zadanie">
          <SectionHeading
            eyebrow="12 · Do pracy"
            accent="Notebook"
            title="i zadanie"
            lead="Zadanie: własna baza Neo4j, graf z pięciu przepisów wyodrębniony przez LLM według podanego schematu i agent ReAct z jednym narzędziem do zapytań Cypher, który podpowiada, co ugotować z posiadanych składników."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <EndCard delay={0.1} icon={<BookOpenText className="size-5" />} title="Notebook z przykładami" text="Kod z prezentacji z zapisanymi wynikami." href="/notebook/04-graphrag/" internal />
            <EndCard delay={0.2} icon={<ExternalLink className="size-5" />} title="Notebook w Colabie" text="Wymaga Neo4j: Docker Compose albo AuraDB Free." href={colabUrl("04-graphrag/notebook.ipynb")} />
            <EndCard delay={0.3} icon={<SquarePen className="size-5" />} title="Zadanie w Colabie" text="Neo4j, graf przepisów z LLM, agent z narzędziem run_cypher." href={colabUrl("04-graphrag/zadanie.ipynb")} badge="Zadanie" />
          </div>
          <Reveal delay={0.4} className="mt-6">
            <Panel className="flex flex-wrap items-center gap-x-6 gap-y-2 p-5">
              <span className="flex items-center gap-2 text-sm text-brand-300">
                <Mail className="size-4" /> Oddanie mailem
              </span>
              <span className="font-mono">[TEG] lab-04</span>
              <span className="text-sm text-fg-muted">notebook z wynikami komórek i pliki z przepisami, bez kluczy API, przed zajęciami 5</span>
            </Panel>
          </Reveal>
        </Slide>
      </main>
    </>
  );
}

function EndCard(props: { delay: number; icon: React.ReactNode; title: string; text: string; href: string; internal?: boolean; badge?: string }) {
  const inner = (
    <Panel className="h-full p-6 transition-colors hover:border-brand-400 hover:bg-[var(--panel-hi)]">
      <div className="flex items-center justify-between text-brand-300">
        {props.icon}
        {props.badge && <Badge tone="focus">{props.badge}</Badge>}
      </div>
      <p className="mt-4 text-lg font-medium">{props.title}</p>
      <p className="mt-1 text-sm text-fg-muted">{props.text}</p>
    </Panel>
  );
  return (
    <Reveal delay={props.delay} className="h-full">
      {props.internal ? (
        <Link href={props.href} className="block h-full">
          {inner}
        </Link>
      ) : (
        <a href={props.href} className="block h-full">
          {inner}
        </a>
      )}
    </Reveal>
  );
}
