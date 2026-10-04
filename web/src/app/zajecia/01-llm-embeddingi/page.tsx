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
import { SamplingViz } from "@/components/viz/SamplingViz";
import { TokenizerViz } from "@/components/viz/TokenizerViz";
import { EmbeddingSpace } from "@/components/viz/EmbeddingSpace";
import { VectorSpace3D } from "@/components/viz/VectorSpace3D";
import { VectorSearchViz } from "@/components/viz/VectorSearchViz";
import { MiniGraph } from "@/components/viz/MiniGraph";
import { ContextSpace } from "@/components/viz/ContextSpace";
import * as S from "@/content/lesson01/snippets";
import { colabUrl } from "@/lib/paths";

export const metadata: Metadata = { title: "Zajęcia 1 · LLM i embeddingi" };

const AGENDA = [
  { label: "Generowanie tekstu", id: "generowanie" },
  { label: "Tokeny", id: "tokeny" },
  { label: "Wywołanie z Pythona", id: "api" },
  { label: "Prosty agent", id: "agent" },
  { label: "Koszt", id: "koszt" },
  { label: "Embeddingi", id: "embedding" },
  { label: "Mapa słów", id: "przestrzen" },
  { label: "Miary podobieństwa", id: "miary" },
  { label: "Kontekst", id: "kontekst" },
  { label: "Wyszukiwanie wektorowe", id: "wyszukiwanie" },
  { label: "Projekt", id: "projekt" },
  { label: "Zadanie", id: "zadanie" },
];

// Funkcja agent() bez definicji narzędzi — na slajd wystarczy pętla.
const agentLoop = S.NB.agent.code.includes("def agent") ? `def agent${S.NB.agent.code.split("def agent")[1]}` : S.NB.agent.code;
const searchFn = S.NB.search.code.split("\n\nfor q in")[0].split("D = embed(docs)\n\n")[1] ?? S.NB.search.code;

export default function Lesson01() {
  return (
    <>
      <SiteNav />
      <main>
        {/* ---------- Otwarcie ---------- */}
        <Slide id="start">
          <HeroTitle eyebrow="Zajęcia 1 z 8" lines={["LLM", "i embeddingi"]} accentLine={0} lead="Generowanie tekstu, tokeny i koszt wywołania modelu. Embeddingi, miary podobieństwa i wyszukiwanie wektorowe." />
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

        {/* ---------- Generowanie ---------- */}
        <Slide id="generowanie">
          <SectionHeading
            eyebrow="01 · Generowanie tekstu"
            accent="Proces generowania:"
            title="token po tokenie, losowo"
            lead="Model wyznacza prawdopodobieństwo każdego możliwego kolejnego tokenu, a następnie losuje jeden z nich. Temperatura, top-k i top-p zmieniają rozkład, z którego odbywa się losowanie."
          />
          <Reveal delay={0.2} className="mt-12">
            <SamplingViz />
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <Callout kind="warning">
              Modele rozumujące (GPT-5, Claude Opus 5.5) nie przyjmują parametrów <code>temperature</code> ani <code>top_p</code>: wywołanie kończy się błędem 400. Eksperymenty z temperaturą wymagają modelu bez rozumowania, np. <code>gpt-4.1-mini</code> albo lokalnego modelu w Ollamie.
            </Callout>
          </Reveal>
        </Slide>

        {/* ---------- Tokeny ---------- */}
        <Slide id="tokeny">
          <SectionHeading
            eyebrow="02 · Tokeny"
            accent="Token"
            title="jest podstawową jednostką"
            lead="Tokenizer dzieli tekst na fragmenty ze słownika (ok. 200 tys. pozycji). Słownik powstał na korpusie zdominowanym przez angielski, więc angielski dzieli się na mniej, dłuższych fragmentów. Ten sam tekst po polsku to więcej tokenów: wyższy koszt i mniej miejsca w kontekście."
          />
          <Reveal delay={0.2} className="mt-12">
            <TokenizerViz />
          </Reveal>
        </Slide>

        {/* ---------- Wywołanie ---------- */}
        <Slide id="api">
          <SectionHeading
            eyebrow="03 · API"
            accent="Wywołanie modelu"
            title="z Pythona"
            lead="System prompt ustawia rolę i format, wiadomość użytkownika zawiera pytanie. Ten sam kod działa z OpenAI, Azure, Ollamą i proxy dla subskrypcji; zmienia się tylko adres klienta."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <CodeTabs
                tabs={[
                  { label: "OpenAI API", content: <CodeBlock code={S.NB["first-call"].code} title="notebook.ipynb" highlight={[4]} /> },
                  { label: "Anthropic API", content: <CodeBlock code={S.anthropicCall} title="Anthropic SDK" highlight={[8]} /> },
                ]}
              />
            </Reveal>
            <Reveal delay={0.3} className="lg:mt-[3.25rem]">
              <Terminal output={S.NB["first-call"].output} title={`${S.MODELS.chat} · ${S.PROVIDERS.chat}`} />
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Agent ---------- */}
        <Slide id="agent">
          <SectionHeading
            eyebrow="04 · Prosty agent"
            accent="Agent"
            title="= model + narzędzia + pętla"
            lead="Model nie zna dzisiejszej daty. Może jednak poprosić o wywołanie funkcji: zwraca jej nazwę i argumenty, kod ją wykonuje i odsyła wynik. Pętla trwa, dopóki model nie odpowie tekstem."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-[1.25fr_1fr]">
            <Reveal delay={0.1}>
              <CodeBlock code={agentLoop} title="notebook.ipynb · agent()" highlight={[4, 5, 6, 9, 10, 11]} />
            </Reveal>
            <div className="space-y-4">
              <Reveal delay={0.25}>
                <Terminal output={S.NB.agent.output} title={`${S.MODELS.chat} · tool calling`} />
              </Reveal>
              <Reveal delay={0.4}>
                <Callout>API jest bezstanowe: historia rozmowy i wyniki narzędzi są wysyłane w każdym kolejnym wywołaniu. Długa rozmowa kosztuje coraz więcej.</Callout>
              </Reveal>
            </div>
          </div>
        </Slide>

        {/* ---------- Koszt ---------- */}
        <Slide id="koszt">
          <div className="grid items-start gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <SectionHeading
                eyebrow="05 · Koszt"
                accent="Koszt generowania"
                title="obejmuje też rozumowanie"
                lead={`Modele rozumujące przed odpowiedzią generują ukryte tokeny rozumowania. W przykładzie obok ${S.USAGE.reasoning} z ${S.USAGE.completion} tokenów odpowiedzi to rozumowanie. Rozliczane są wszystkie.`}
              />
              <Reveal delay={0.3} className="mt-8">
                <Callout kind="warning">
                  Limit długości (<code>max_completion_tokens</code>) obejmuje też rozumowanie. Przy zbyt niskim limicie rozumowanie może go wyczerpać i odpowiedź będzie pusta. Nowsze modele same dobierają długość rozumowania do zadania (adaptive thinking), ale limit nadal liczy wszystkie tokeny.
                </Callout>
              </Reveal>
            </div>
            <div className="space-y-4">
              <Reveal delay={0.1}>
                <Terminal output={S.NB.usage.output} title={`${S.MODELS.chat} · pierwsze wywołanie`} />
              </Reveal>
              <Reveal delay={0.25}>
                <ReasoningBar />
              </Reveal>
              <Reveal delay={0.4}>
                <Terminal output={S.NB.limit.output} title="limit długości: model klasyczny i rozumujący" />
              </Reveal>
            </div>
          </div>
        </Slide>

        {/* ---------- Embedding ---------- */}
        <Slide id="embedding">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <SectionHeading
              eyebrow="06 · Embeddingi"
              accent="Znaczenie"
              title="jako punkt w przestrzeni"
              lead="Model embeddingów zamienia tekst na wektor o stałej długości: 1536 liczb w text-embedding-3-small, 768 w lokalnej EmbeddingGemmie. Teksty o podobnym znaczeniu dają bliskie wektory."
            />
            <div className="space-y-4">
              <Reveal delay={0.1}>
                <CodeBlock code={S.NB.embedding.code} title="notebook.ipynb · embed()" highlight={[9]} />
              </Reveal>
              <Reveal delay={0.25}>
                <Terminal output={S.NB.embedding.output} title={`${S.MODELS.embed} · ${S.PROVIDERS.embed}`} />
              </Reveal>
            </div>
          </div>
        </Slide>

        <Slide id="przestrzen">
          <SectionHeading
            eyebrow="07 · Przestrzeń"
            accent="24 słowa,"
            title="cztery grupy bez etykiet"
            lead="Model nie dostał informacji, że „pociąg” i „autobus” to transport. Grupy wynikają z tego, jak słowa są używane w tekstach."
          />
          <Reveal delay={0.2} className="mt-12">
            <EmbeddingSpace />
          </Reveal>
        </Slide>

        <Slide id="miary">
          <SectionHeading
            eyebrow="08 · Miary podobieństwa"
            accent="Cosinus, iloczyn,"
            title="odległość"
            lead="Cosinus zależy tylko od kąta między wektorami. Iloczyn skalarny i odległości zależą też od długości. Dla wektorów o długości 1, takich jak embeddingi z API, wszystkie dają ten sam ranking. Cosinus ma zakres od −1 do 1, a odległość cosinusowa (1 − cos) od 0 do 2."
          />
          <Reveal delay={0.2} className="mt-12">
            <VectorSpace3D />
          </Reveal>
        </Slide>

        <Slide id="kontekst">
          <SectionHeading
            eyebrow="09 · Kontekst"
            accent="Kot"
            title="bliżej psa czy kotka?"
            lead="Liczymy embeddingi słów „cat”, „dog” i „kitten”: najpierw samych, potem wstawionych w trzy zdania (np. „I love my [X] very much”). Pytanie: czy „cat” jest bliżej „kitten” (to samo zwierzę), czy „dog” (inne zwierzę domowe)? W text-embedding-3-small samo słowo „cat” wypada bliżej „dog”; dopiero w zdaniu bliżej jest „kitten”. W EmbeddingGemmie „kitten” wygrywa w każdym wariancie."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
            <div className="space-y-4">
              {S.CONTEXT.map((c, i) => (
                <Reveal key={c.model} delay={0.1 + i * 0.15}>
                  <Terminal output={c.output} title={c.model} wrap={false} />
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.2}>
              <ContextSpace />
            </Reveal>
          </div>
          <Reveal delay={0.4} className="mt-6">
            <Callout>Relacje między słowami zależą od modelu. Zmiana modelu oznacza ponowne policzenie embeddingów całej bazy. W RAG embeddingi liczy się dla fragmentów tekstu, a nie pojedynczych słów.</Callout>
          </Reveal>
        </Slide>

        {/* ---------- Wyszukiwanie ---------- */}
        <Slide id="wyszukiwanie">
          <SectionHeading
            eyebrow="10 · Baza wektorowa"
            accent="Wyszukiwanie"
            title="to porównanie wektora z wektorami"
            lead="Zapytanie → embedding → cosinus z każdym dokumentem → k najlepszych. Bazy wektorowe przyspieszają ostatni krok, żeby nie porównywać zapytania z milionem wektorów po kolei."
          />
          <Reveal delay={0.2} className="mt-12">
            <VectorSearchViz />
          </Reveal>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <CodeBlock code={searchFn} title="notebook.ipynb · search()" highlight={[3, 4]} />
            </Reveal>
            <Reveal delay={0.2}>
              <Callout kind="warning">
                Pytanie „Dlaczego jabłko spada na ziemię?” zwraca na pierwszym miejscu Darwina i dżdżownice, a nie Newtona. Embedding łączy „ziemię” z „glebą”, ale nie rozumie pytania. Poprawki na zajęciach 2: wyszukiwanie hybrydowe z BM25 i reranking.
              </Callout>
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Projekt ---------- */}
        <Slide id="projekt">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <SectionHeading
                eyebrow="11 · Projekt"
                accent="GraphRAG:"
                title="wiedza zapisana jako graf"
                lead="Dokumenty zamienione na graf encji i relacji (Neo4j). System odpowiada na pytania wymagające połączenia kilku faktów, z którymi zwykłe wyszukiwanie fragmentów tekstu sobie nie radzi. Szczegóły i zasady projektu na kolejnych zajęciach."
              />
              <Reveal delay={0.3} className="mt-8">
                <Callout>
                  Korzystanie z agentów kodujących jest dozwolone pod warunkiem rzetelnej konfiguracji: skille, pliki <code>CLAUDE.md</code> / <code>AGENTS.md</code>, pluginy, opis sposobu pracy w repozytorium.
                </Callout>
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <Panel className="p-6">
                <MiniGraph />
              </Panel>
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Koniec ---------- */}
        <Slide id="zadanie">
          <SectionHeading eyebrow="12 · Do pracy" accent="Notebook" title="i zadanie" />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <EndCard delay={0.1} icon={<BookOpenText className="size-5" />} title="Notebook z przykładami" text="Kod z prezentacji z zapisanymi wynikami." href="/notebook/01-llm-embeddingi/" internal />
            <EndCard delay={0.2} icon={<ExternalLink className="size-5" />} title="Notebook w Colabie" text="Uruchomienie bez instalacji." href={colabUrl("01-llm-embeddingi/notebook.ipynb")} />
            <EndCard delay={0.3} icon={<SquarePen className="size-5" />} title="Zadanie w Colabie" text="Dostęp do LLM, koszt w tokenach, własna mini-wyszukiwarka." href={colabUrl("01-llm-embeddingi/zadanie.ipynb")} badge="Zadanie" />
          </div>
          <Reveal delay={0.4} className="mt-6">
            <Panel className="flex flex-wrap items-center gap-x-6 gap-y-2 p-5">
              <span className="flex items-center gap-2 text-sm text-brand-300">
                <Mail className="size-4" /> Oddanie mailem
              </span>
              <span className="font-mono">[TEG] lab-01</span>
              <span className="text-sm text-fg-muted">notebook z wynikami komórek, bez kluczy API, przed zajęciami 2</span>
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

function ReasoningBar() {
  const { prompt, completion, reasoning } = S.USAGE;
  const total = prompt + completion;
  const answer = completion - reasoning;
  if (!total) return null;
  return (
    <Panel className="p-5">
      <div className="flex h-10 overflow-hidden rounded-lg font-mono text-xs">
        <div className="bg-cat-1/80" style={{ width: `${(prompt / total) * 100}%` }} />
        <div className="flex items-center justify-center bg-focus/80 text-ink-950" style={{ width: `${(reasoning / total) * 100}%` }}>
          rozumowanie {reasoning}
        </div>
        <div className="flex items-center justify-center bg-cat-2/80 text-ink-950" style={{ width: `${(answer / total) * 100}%` }}>
          odpowiedź {answer}
        </div>
      </div>
      <p className="mt-3 text-xs text-fg-subtle">
        prompt: {prompt} tokenów · razem: {total} · wywołanie bez limitu: {reasoning} to tyle, ile model sam zużył na rozumowanie, a nie stały budżet
      </p>
    </Panel>
  );
}
