import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenText, ExternalLink, Mail, SquarePen } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { Slide } from "@/components/site/Slide";
import { HeroTitle } from "@/components/lesson/HeroTitle";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { CodeBlock } from "@/components/molecules/CodeBlock";
import { CodeTabs } from "@/components/molecules/CodeTabs";
import { Terminal } from "@/components/molecules/Terminal";
import { Callout } from "@/components/molecules/Callout";
import { Reveal } from "@/components/motion/Reveal";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { AgentLoopViz } from "@/components/viz/AgentLoopViz";
import { ContextGrowthViz } from "@/components/viz/ContextGrowthViz";
import { GraphRunViz } from "@/components/viz/GraphRunViz";
import { RagVsAgenticViz } from "@/components/viz/RagVsAgenticViz";
import { ToolCallAnatomyViz } from "@/components/viz/ToolCallAnatomyViz";
import { ChainViz } from "@/components/viz/ChainViz";
import { ParallelCallsViz } from "@/components/viz/ParallelCallsViz";
import { HarnessViz } from "@/components/viz/HarnessViz";
import { MemoryViz } from "@/components/viz/MemoryViz";
import * as S from "@/content/lesson03/snippets";
import { colabUrl } from "@/lib/paths";

export const metadata: Metadata = { title: "Zajęcia 3 · Agenci i tool calling" };

const AGENDA = [
  { label: "Tool calling", id: "tool-calling" },
  { label: "Pętla ReAct", id: "react" },
  { label: "Równoległe wywołania", id: "rownolegle" },
  { label: "Harness", id: "harness" },
  { label: "Kontekst", id: "kontekst" },
  { label: "LangChain", id: "langchain" },
  { label: "LangGraph", id: "langgraph" },
  { label: "create_agent", id: "create-agent" },
  { label: "Pamięć", id: "pamiec" },
  { label: "Agentic RAG", id: "agentic-rag" },
  { label: "Wyszukiwanie w sieci", id: "siec" },
  { label: "Zadanie", id: "zadanie" },
];

// Na slajd: sama budowa grafu, bez importów i rysowania.
const graphBuild = S.NB.graph.code.includes("builder = StateGraph") ? S.NB.graph.code.slice(S.NB.graph.code.indexOf("llm_with_tools")).split("\n\nprint(")[0] : S.NB.graph.code;
const createAgent = S.NB["create-agent"].code.split("\n\nresult =")[0];
const memoryCode = S.NB.memory.code.split("\nstate = ")[0];

export default function Lesson03() {
  const model = S.MODELS.agent;
  return (
    <>
      <SiteNav />
      <main>
        {/* ---------- Otwarcie ---------- */}
        <Slide id="start">
          <HeroTitle eyebrow="Zajęcia 3 z 8" lines={["Agenci", "i tool calling"]} accentLine={0} lead="Model, który prosi o wywołanie funkcji. Pętla ReAct napisana ręcznie i w LangGraph, pamięć rozmowy i agent, który sam decyduje, kiedy szukać w bazie wiedzy." />
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

        {/* ---------- Tool calling ---------- */}
        <Slide id="tool-calling">
          <SectionHeading
            eyebrow="01 · Tool calling"
            accent="Model nie wywołuje funkcji,"
            title="tylko o to prosi"
            lead="Do zapytania dołącza się listę narzędzi: nazwę, opis i schemat argumentów. Model zwraca nazwę funkcji i argumenty jako tekst JSON. Funkcję uruchamia kod aplikacji i odsyła wynik z tym samym id."
          />
          <Reveal delay={0.2} className="mt-12">
            <ToolCallAnatomyViz model={model} />
          </Reveal>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <CodeTabs
                tabs={[
                  { label: "OpenAI API", content: <CodeBlock code={S.NB["tool-call"].code} title="notebook.ipynb" highlight={[4]} /> },
                  { label: "Anthropic API", content: <CodeBlock code={S.anthropicTools} title="Anthropic SDK" highlight={[7, 18]} /> },
                ]}
              />
            </Reveal>
            <div className="space-y-4 lg:mt-[3.25rem]">
              <Reveal delay={0.25}>
                <Terminal output={S.NB["tool-call"].output} title={`${model} · tool call`} />
              </Reveal>
              <Reveal delay={0.4}>
                <Callout kind="warning">
                  Argumenty to <strong>tekst</strong>, który trzeba sparsować i sprawdzić. Gdy potrzebny jest sam JSON zgodny ze schematem, bez wywoływania funkcji, służą do tego structured outputs: <a className="underline" href="https://developers.openai.com/api/docs/guides/structured-outputs">OpenAI</a>, <a className="underline" href="https://platform.claude.com/docs/en/build-with-claude/structured-outputs">Anthropic</a>.
                </Callout>
              </Reveal>
            </div>
          </div>
        </Slide>

        {/* ---------- ReAct ---------- */}
        <Slide id="react">
          <SectionHeading
            eyebrow="02 · Pętla ReAct"
            accent="Thinking, action, observation,"
            title="aż do odpowiedzi"
            lead="ReAct (Reason + Act): LLM myśli i prosi o narzędzie, aplikacja je wywołuje, a wynik wraca do LLM, które znów decyduje. Kod pętli nie zna kolejności kroków, zna tylko narzędzia. Poniżej zapisany przebieg z notebooka, po jednym narzędziu na krok."
          />
          <Reveal delay={0.2} className="mt-12">
            <AgentLoopViz model={model} />
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <CodeBlock code={S.reactLoop} title="notebook.ipynb · react() (bez wydruków)" highlight={[5, 8, 14, 15]} />
          </Reveal>
        </Slide>

        <Slide id="rownolegle">
          <SectionHeading
            eyebrow="03 · Równoległe wywołania"
            accent="Kilka narzędzi"
            title="w jednym kroku"
            lead="Jedna odpowiedź modelu może zawierać kilka tool_calls. Aplikacja wykonuje wszystkie i odsyła wszystkie wyniki przed kolejnym wywołaniem modelu: mniej kroków, mniej wysyłania historii."
          />
          <Reveal delay={0.2} className="mt-12">
            <ParallelCallsViz model={model} />
          </Reveal>
        </Slide>

        <Slide id="harness">
          <SectionHeading
            eyebrow="04 · Agent harness"
            accent="Harness"
            title="to kod wokół modelu"
            lead="Agent to działający program z modelem w środku. Harness to aplikacja wokół modelu: pętla, wykonanie narzędzi, historia i kontekst, limity, warunek końca. Jeden harness można podłączyć do różnych modeli, np. własnej Gemmy, Opusa albo Fable: agent zachowuje się wtedy inaczej, a kod harnessu się nie zmienia."
          />
          <Reveal delay={0.2} className="mt-12">
            <HarnessViz />
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <Callout>
              <code>react()</code> to minimalny harness. Claude Code i Codex to harnessy rozbudowane: zarządzanie kontekstem, uprawnienia do narzędzi, zatwierdzanie przez człowieka (zajęcia 6).
            </Callout>
          </Reveal>
        </Slide>

        <Slide id="kontekst">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <SectionHeading
                eyebrow="05 · Kontekst"
                accent="Każdy krok"
                title="wysyła całą historię od nowa"
                lead="API jest bezstanowe. Definicje narzędzi, pytanie, wywołania i wyniki wyszukiwania trafiają do modelu przy każdym kroku. Koszt agenta to suma wejść wszystkich wywołań."
              />
              <Reveal delay={0.3} className="mt-8">
                <Callout>
                  Wyniki narzędzi rosną najszybciej. Pomagają krótsze wyniki, usuwanie starych obserwacji i streszczanie historii (w LangChain: <code>SummarizationMiddleware</code>, <code>ContextEditingMiddleware</code>).
                </Callout>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <ContextGrowthViz model={model} />
            </Reveal>
          </div>
        </Slide>

        {/* ---------- LangChain ---------- */}
        <Slide id="langchain">
          <SectionHeading
            eyebrow="06 · LangChain"
            accent="Łańcuch"
            title="to stała sekwencja kroków"
            lead="Operator | łączy kroki: wynik jednego staje się wejściem następnego. Krokiem może być wyszukiwanie w bazie, prompt, model, także z narzędziami, albo parser. Ścieżka jest zawsze ta sama i nie ma pętli, więc model nie decyduje, co dalej."
          />
          <Reveal delay={0.2} className="mt-12">
            <ChainViz />
          </Reveal>
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <Reveal delay={0.1}>
              <CodeBlock code={S.NB.chain.code} title="notebook.ipynb · łańcuch RAG" highlight={[14, 15, 16, 17]} />
            </Reveal>
            <Reveal delay={0.25}>
              <Terminal output={S.plain(S.NB.chain.output)} title={`${model} · chain.invoke()`} />
            </Reveal>
          </div>
        </Slide>

        {/* ---------- LangGraph ---------- */}
        <Slide id="langgraph">
          <SectionHeading
            eyebrow="07 · LangGraph"
            accent="Ta sama pętla"
            title="jako graf: model ⇄ tools"
            lead="Stan może być dowolną strukturą zdefiniowaną w kodzie; tutaj wystarcza historia wiadomości. Węzeł model wywołuje LLM, węzeł tools wykonuje narzędzia. Krawędź warunkowa tools_condition sprawdza, czy ostatnia wiadomość ma tool_calls: jeśli tak, idzie do tools, jeśli nie, kończy."
          />
          <Reveal delay={0.2} className="mt-12">
            <GraphRunViz model={model} />
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <CodeBlock code={graphBuild} title="notebook.ipynb · StateGraph" highlight={[9, 10, 11, 12]} />
          </Reveal>
        </Slide>

        <Slide id="create-agent">
          <SectionHeading
            eyebrow="08 · create_agent"
            accent="create_agent"
            title="buduje ten graf w jednej linii"
            lead="Wystarczy podać model (instancję LLM), narzędzia i system prompt, a powstaje agent do wielokrotnego użycia. Wynik to skompilowany graf LangGraph z tymi samymi węzłami; limity, streszczanie historii czy zatwierdzanie przez człowieka dokłada się jako middleware."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <CodeBlock code={createAgent} title="notebook.ipynb" highlight={[3]} />
            </Reveal>
            <Reveal delay={0.25}>
              <Terminal output={S.NB["create-agent"].output} title={`${model} · agent.invoke()`} />
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Pamięć ---------- */}
        <Slide id="pamiec">
          <SectionHeading
            eyebrow="09 · Pamięć"
            accent="Pamięć"
            title="to zapisany stan i osobny magazyn"
            lead="Krótkoterminowa: checkpointer automatycznie zapisuje historię wiadomości pod thread_id; nowy wątek zaczyna od zera. Długoterminowa: store, wspólny dla wątków. Harness może go zapełniać narzędziami, w tle albo wsadowo, analizując zakończone rozmowy; pamięć może też mieć postać grafu."
          />
          <Reveal delay={0.2} className="mt-12">
            <MemoryViz model={model} />
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <CodeBlock code={memoryCode} title="notebook.ipynb · checkpointer" highlight={[3, 6]} />
          </Reveal>
        </Slide>

        {/* ---------- Agentic RAG ---------- */}
        <Slide id="agentic-rag">
          <SectionHeading
            eyebrow="10 · Agentic RAG"
            accent="Agent decyduje,"
            title="czy, czego i ile razy szukać"
            lead={
              <>
                Klasyczny RAG <strong className="text-fg">zawsze wykonuje jedno wyszukiwanie</strong> z całym pytaniem jako zapytaniem. W agentic RAG wyszukiwanie jest narzędziem: model może je pominąć, przeformułować zapytanie albo powtórzyć dla kilku tematów.
              </>
            }
          />
          <Reveal delay={0.2} className="mt-12">
            <RagVsAgenticViz />
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <Callout>
              Agent rozbija pytanie o dwa tematy na osobne wyszukiwania i znajduje dokumenty do obu. Klasyczny RAG szuka całym pytaniem, więc wynik zależy od tematu, który w nim przeważy.
            </Callout>
          </Reveal>
        </Slide>

        <Slide id="siec">
          <SectionHeading
            eyebrow="11 · Wyszukiwanie w sieci"
            accent="Narzędziem"
            title="może być dowolna funkcja"
            lead="W Pythonie biblioteka ddgs wywołuje DuckDuckGo bez klucza API, z limitami zapytań. Tyle wystarczy, żeby dać agentowi wyszukiwanie w sieci."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <CodeBlock code={S.NB["web-search"].code} title="notebook.ipynb · web_search" highlight={[3, 4, 13]} />
            </Reveal>
            <div className="space-y-4">
              <Reveal delay={0.25}>
                <Terminal output={S.NB["web-search"].output} title={`${model} · ddgs`} />
              </Reveal>
              <Reveal delay={0.4}>
                <Callout kind="warning">
                  Treść stron trafia do kontekstu i może zawierać polecenia dla modelu (prompt injection). Wyniki narzędzi to dane, nie instrukcje; narzędzia, które coś wysyłają lub usuwają, wymagają zatwierdzenia przez człowieka.
                </Callout>
              </Reveal>
            </div>
          </div>
        </Slide>

        {/* ---------- Koniec ---------- */}
        <Slide id="zadanie">
          <SectionHeading eyebrow="12 · Do pracy" accent="Notebook" title="i zadanie" lead="Zadanie: własny agent kodujący w LangGraph. Narzędzia do plików i poleceń, jedno polecenie od użytkownika, a na końcu działająca mała aplikacja FastAPI z bazą SQLite i testami." />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <EndCard delay={0.1} icon={<BookOpenText className="size-5" />} title="Notebook z przykładami" text="Kod z prezentacji z zapisanymi wynikami." href="/notebook/03-agenci/" internal />
            <EndCard delay={0.2} icon={<ExternalLink className="size-5" />} title="Notebook w Colabie" text="Uruchomienie bez instalacji; ćwiczenia w sekcjach 2 i 9." href={colabUrl("03-agenci/notebook.ipynb")} />
            <EndCard delay={0.3} icon={<SquarePen className="size-5" />} title="Zadanie w Colabie" text="Własny agent kodujący: narzędzia, pętla w LangGraph, aplikacja z testami." href={colabUrl("03-agenci/zadanie.ipynb")} badge="Zadanie" />
          </div>
          <Reveal delay={0.4} className="mt-6">
            <Panel className="flex flex-wrap items-center gap-x-6 gap-y-2 p-5">
              <span className="flex items-center gap-2 text-sm text-brand-300">
                <Mail className="size-4" /> Oddanie mailem
              </span>
              <span className="font-mono">[TEG] lab-03</span>
              <span className="text-sm text-fg-muted">notebook z wynikami komórek, bez kluczy API, przed zajęciami 4</span>
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
