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
import { Formula } from "@/components/molecules/Formula";
import { StableSteps } from "@/components/molecules/StableSteps";
import { Reveal } from "@/components/motion/Reveal";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { ChunkingViz } from "@/components/viz/ChunkingViz";
import { RagPipelineViz } from "@/components/viz/RagPipelineViz";
import { HybridRankViz } from "@/components/viz/HybridRankViz";
import { RerankViz } from "@/components/viz/RerankViz";
import { QuerySpaceViz } from "@/components/viz/QuerySpaceViz";
import { ChromaRecordsViz } from "@/components/viz/ChromaRecordsViz";
import { Bm25StepsViz } from "@/components/viz/Bm25StepsViz";
import { TfIdfViz } from "@/components/viz/TfIdfViz";
import { RrfStepsViz } from "@/components/viz/RrfStepsViz";
import { PromptBuildViz } from "@/components/viz/PromptBuildViz";
import { EvalMetricsViz } from "@/components/viz/EvalMetricsViz";
import { JudgeViz } from "@/components/viz/JudgeViz";
import * as S from "@/content/lesson02/snippets";
import { colabUrl } from "@/lib/paths";

export const metadata: Metadata = { title: "Zajęcia 2 · RAG" };

const AGENDA = [
  { label: "Po co RAG", id: "po-co" },
  { label: "Chunking", id: "chunking" },
  { label: "Przestrzeń chunków", id: "przestrzen" },
  { label: "Chroma i metadane", id: "chroma" },
  { label: "Pipeline", id: "pipeline" },
  { label: "TF-IDF", id: "tfidf" },
  { label: "BM25", id: "bm25" },
  { label: "Hybryda i RRF", id: "hybryda" },
  { label: "Reranking", id: "reranking" },
  { label: "Ewaluacja", id: "ewaluacja" },
  { label: "LLM jako sędzia", id: "sedzia" },
  { label: "Zadanie", id: "zadanie" },
];

const ragFn = S.slice(S.NB.rag.code, "def rag(", "for q in");
const filterCode = S.slice(S.NB.chroma.code, "def vector_search(", "for cid") + "\n\n" + S.NB.filter.code;
const rrfFn = S.slice(S.NB.rrf.code, "def rrf(", "q = ");
const rerankCall = `candidates = hybrid_search(q, k=10)        # etap 1: szybko, szeroko
scores = reranker.predict([(q, TEXT[cid]) for cid in candidates])
best = [candidates[i] for i in np.argsort(-scores)[:3]]  # etap 2: dokładnie`;
const evalFn = S.slice(S.NB.eval.code, "def doc_rank(", "METHODS = {");
const judgePrompt = `JUDGE = """Oceniasz odpowiedź systemu RAG. Zwróć wyłącznie JSON:
{"faithful": 0 albo 1, "correct": 0 albo 1, "reason": "jedno zdanie"}
faithful = 1, jeśli każde twierdzenie odpowiedzi wynika z kontekstu.
correct = 1, jeśli odpowiedź zawiera informację z odpowiedzi wzorcowej."""

verdict = client.chat.completions.create(model=CHAT,
    response_format={"type": "json_object"},
    messages=[{"role": "system", "content": JUDGE},
              {"role": "user", "content": f"Pytanie: ...\\nKontekst: ...\\n"
                                          f"Odpowiedź wzorcowa: ...\\nOdpowiedź systemu: ..."}])`;

export default function Lesson02() {
  return (
    <>
      <SiteNav />
      <main>
        {/* ---------- Otwarcie ---------- */}
        <Slide id="start">
          <HeroTitle eyebrow="Zajęcia 2 z 8" lines={["RAG", "od podstaw do ewaluacji"]} accentLine={0} lead="Model odpowiada na podstawie dokumentów, których nie widział w treningu. Chunking, baza wektorowa z metadanymi, wyszukiwanie hybrydowe, reranking i pomiar jakości." />
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

        {/* ---------- Po co ---------- */}
        <Slide id="po-co">
          <SectionHeading
            eyebrow="01 · Po co RAG"
            accent="Model nie zna"
            title="dokumentów firmy"
            lead={"Korpus na zajęciach to 15 dokumentów fikcyjnej firmy: regulaminy i dokumentacja produktu. Bez kontekstu model odpowiada ogólnikiem. RAG wyszukuje pasujące fragmenty i dokleja je do promptu."}
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <p className="text-2xl font-semibold md:text-3xl">Bez kontekstu</p>
              <p className="mb-4 mt-1 text-fg-muted">Model dostaje samo pytanie.</p>
              <Terminal output={S.NB["no-rag"].output} title={S.MODELS.chat} />
            </Reveal>
            <Reveal delay={0.3}>
              <p className="text-2xl font-semibold md:text-3xl">
                <span className="text-gradient">System RAG</span>
              </p>
              <p className="mb-4 mt-1 text-fg-muted">Model dostaje pytanie i znalezione fragmenty dokumentów.</p>
              <Terminal output={S.NB.rag.output.split("\n\n")[0]} title={S.MODELS.chat} />
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Chunking ---------- */}
        <Slide id="chunking">
          <SectionHeading
            eyebrow="02 · Chunking"
            accent="Rozmiar chunku"
            title="decyduje, co trafi do promptu"
            lead="Dokument dzieli się na fragmenty i liczy embedding dla każdego. Za małe chunki gubią kontekst, za duże mieszają tematy. Overlap powtarza koniec poprzedniego chunku, żeby zdanie na granicy nie straciło sensu."
          />
          <Reveal delay={0.2} className="mt-12">
            <ChunkingViz />
          </Reveal>
        </Slide>

        {/* ---------- Przestrzeń ---------- */}
        <Slide id="przestrzen">
          <SectionHeading
            eyebrow="03 · Wyszukiwanie"
            accent="Pytanie ląduje"
            title="między chunkami"
            lead="Pytanie przechodzi przez ten sam model embeddingów co chunki. Wyszukiwanie to wybór k chunków o największym cosinusie z wektorem pytania."
          />
          <Reveal delay={0.2} className="mt-12">
            <StableSteps steps={[0, 1, 2, 3]}><QuerySpaceViz /></StableSteps>
          </Reveal>
        </Slide>

        {/* ---------- Chroma ---------- */}
        <Slide id="chroma">
          <SectionHeading
            eyebrow="04 · Chroma"
            accent="Metadane"
            title="rozstrzygają, która wersja obowiązuje"
            lead="ChromaDB to jedna z wektorowych baz danych; oprócz wektora przechowuje też treść chunku i jego metadane. Przykład: firma ma dwie wersje polityki pracy zdalnej, obowiązujące w różnych latach. Obie zostają w bazie, bo użytkownicy pytają też o wcześniejsze ustalenia. Filtr where (filtrowanie po metadanych) sprawia, że do kontekstu trafiają tylko fragmenty z pasujących dokumentów."
          />
          <Reveal delay={0.2} className="mt-12">
            <StableSteps><ChromaRecordsViz /></StableSteps>
          </Reveal>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <CodeBlock code={filterCode} title="notebook.ipynb · vector_search()" highlight={[2]} />
            </Reveal>
            <div className="space-y-4">
              <Reveal delay={0.2}>
                <Terminal output={S.NB.chroma.output} title={`bez filtra · ${S.MODELS.embed}`} wrap={false} />
              </Reveal>
              <Reveal delay={0.35}>
                <Terminal output={S.NB.filter.output} title="z filtrem where" wrap={false} />
              </Reveal>
            </div>
          </div>
          <Reveal delay={0.4} className="mt-6">
            <Callout kind="warning">Najbliższy fragment pochodzi z nieaktualnej polityki z 2024 roku (dwa dni zamiast trzech). Bez metadanych system odpowiedziałby pewnie i błędnie.</Callout>
          </Reveal>
        </Slide>

        {/* ---------- Pipeline ---------- */}
        <Slide id="pipeline">
          <SectionHeading
            eyebrow="05 · Pipeline"
            accent="Pytanie → fragmenty"
            title="→ prompt → odpowiedź"
            lead="Cały RAG to kilka linii: wyszukanie, sklejenie kontekstu, jedno wywołanie modelu. Instrukcja wymaga odpowiedzi tylko z kontekstu, „Nie wiem” przy braku informacji i podania źródeł."
          />
          <Reveal delay={0.2} className="mt-12">
            <StableSteps steps={[0, 1, 2, 3, 4]}><RagPipelineViz answer={S.RAG_ANSWER} model={S.MODELS.chat} /></StableSteps>
          </Reveal>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Reveal delay={0.1}>
                <CodeBlock code={ragFn} title="notebook.ipynb · rag()" highlight={[2, 4, 5, 6, 7]} />
              </Reveal>
              <Reveal delay={0.25}>
                <Terminal output={S.NB.rag.output.split("\n\n").slice(1).join("\n\n")} title={`${S.MODELS.chat} · pytanie spoza korpusu`} />
              </Reveal>
            </div>
            <Reveal delay={0.2}>
              <StableSteps>
                <PromptBuildViz />
              </StableSteps>
            </Reveal>
          </div>
        </Slide>

        {/* ---------- TF-IDF ---------- */}
        <Slide id="tfidf">
          <SectionHeading
            eyebrow="06 · TF-IDF"
            accent="Rzadkie słowo"
            title="mówi więcej niż częste"
            lead="TF-IDF to klasyczna metoda z przetwarzania tekstu i uczenia maszynowego, starsza od embeddingów. Słowo dostaje wagę: jak często występuje w dokumencie (TF) razy jak rzadkie jest w całym korpusie (IDF). Wynik dokumentu dla pytania to suma wag słów z pytania."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
            <Reveal delay={0.1}>
              <Formula
                tex={String.raw`\mathrm{tfidf}(t, d) = \mathrm{tf}(t, d)\cdot \ln\frac{N}{\mathrm{df}(t)}`}
                legend={[
                  [String.raw`\mathrm{tf}(t, d)`, "liczba wystąpień słowa t w dokumencie d"],
                  [String.raw`\mathrm{df}(t)`, "liczba dokumentów, w których jest słowo t"],
                  ["N", "liczba dokumentów w korpusie"],
                ]}
              />
            </Reveal>
            <Reveal delay={0.25}>
              <TfIdfViz />
            </Reveal>
          </div>
        </Slide>

        {/* ---------- BM25 ---------- */}
        <Slide id="bm25">
          <SectionHeading
            eyebrow="07 · BM25"
            accent="Słowa kluczowe"
            title="widzą to, co gubi embedding"
            lead="BM25 to ulepszony TF-IDF: kolejne powtórzenia słowa dodają coraz mniej, a długi chunk dostaje karę, bo słowa trafiają się w nim częściej przypadkiem. Polska fleksja przeszkadza („kursy” ≠ „kursów”), więc słowa sprowadza się do wspólnej formy: lematyzacją albo, jak w notebooku, uproszczonym stemmingiem. Kody z cyframi zostają w całości."
          />
          <Reveal delay={0.15} className="mt-12">
            <Formula
              tex={String.raw`\mathrm{BM25}(q, d) = \sum_{t \in q} \mathrm{IDF}(t)\cdot\frac{f(t, d)\,(k_1 + 1)}{f(t, d) + k_1\left(1 - b + b\,\frac{|d|}{\mathrm{avgdl}}\right)}, \qquad \mathrm{IDF}(t) = \ln\frac{N - n(t) + 0{,}5}{n(t) + 0{,}5}`}
              legend={[
                [String.raw`f(t, d)`, "liczba wystąpień słowa t w chunku d"],
                [String.raw`|d|,\ \mathrm{avgdl}`, "długość chunku i średnia długość chunku w korpusie (w słowach)"],
                [String.raw`n(t),\ N`, "liczba chunków ze słowem t i liczba wszystkich chunków"],
                [String.raw`k_1 = 1{,}5`, "nasycenie: im mniejsze, tym szybciej kolejne powtórzenia przestają się liczyć"],
                [String.raw`b = 0{,}75`, "siła kary za długość chunku (0 = brak kary)"],
              ]}
            />
          </Reveal>
          <Reveal delay={0.2} className="mt-6">
            <StableSteps><Bm25StepsViz /></StableSteps>
          </Reveal>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <CodeBlock code={S.slice(S.NB.bm25.code, "def tokenize(", "print(tokenize")} title="notebook.ipynb · BM25" highlight={[2, 3]} />
            </Reveal>
            <Reveal delay={0.25}>
              <Terminal output={S.NB.bm25.output} title="wektory vs BM25" />
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Hybryda ---------- */}
        <Slide id="hybryda">
          <SectionHeading
            eyebrow="08 · Hybryda"
            accent="RRF łączy"
            title="pozycje, nie wyniki"
            lead="Odległość cosinusowa i wynik BM25 mają różne skale, więc nie dodaje się ich wprost. RRF (Reciprocal Rank Fusion, łączenie odwrotności pozycji) patrzy tylko na miejsca w rankingach: chunk dostaje punkty z każdej listy, a punkty się sumuje. Wygrywa chunk wysoko na obu."
          />
          <Reveal delay={0.15} className="mt-12">
            <Formula
              tex={String.raw`\mathrm{RRF}(d) = \sum_{r \in R} \frac{1}{k + \mathrm{rank}_r(d)}, \qquad k = 60`}
              legend={[
                [String.raw`R`, "rankingi do połączenia (tu: wektory i BM25)"],
                [String.raw`\mathrm{rank}_r(d)`, "pozycja chunku d w rankingu r (1 = pierwsze miejsce)"],
                [String.raw`k`, "stała z pracy Cormacka i in. (2009); spłaszcza różnice między czołowymi pozycjami"],
              ]}
            />
          </Reveal>
          <Reveal delay={0.2} className="mt-6">
            <HybridRankViz />
          </Reveal>
          <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
            <Reveal delay={0.1}>
              <CodeBlock code={rrfFn} title="notebook.ipynb · rrf()" highlight={[4, 5]} />
            </Reveal>
            <Reveal delay={0.2}>
              <StableSteps><RrfStepsViz /></StableSteps>
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Reranking ---------- */}
        <Slide id="reranking">
          <SectionHeading
            eyebrow="09 · Reranking"
            accent="Cross-encoder"
            title="czyta pytanie i chunk razem"
            lead="Embedding koduje pytanie i chunk osobno, więc wektory chunków liczy się raz. Cross-encoder ocenia parę naraz: dokładniej, ale jedno wywołanie modelu na parę. Dlatego ocenia tylko kilkunastu kandydatów z pierwszego etapu."
          />
          <Reveal delay={0.2} className="mt-12">
            <RerankViz />
          </Reveal>
          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <CodeBlock code={rerankCall} title="dwa etapy" highlight={[2]} />
            </Reveal>
            <Reveal delay={0.25}>
              <Terminal output={S.NB.rerank.output} title="sdadas/polish-reranker-base-ranknet · CPU" />
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Ewaluacja ---------- */}
        <Slide id="ewaluacja">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div>
              <SectionHeading
                eyebrow="10 · Ewaluacja"
                accent="Bez zestawu testowego"
                title="każda zmiana to zgadywanie"
                lead="Szesnaście pytań z oznaczonym dokumentem wystarczy, żeby porównać metody. Hit@k mówi, jak często właściwy dokument jest w pierwszych k wynikach, a MRR (mean reciprocal rank), jak wysoko średnio się znajduje."
              />
              <Reveal delay={0.2} className="mt-8">
                <Formula
                  tex={String.raw`\mathrm{Hit@}k = \frac{1}{|Q|}\sum_{q \in Q} \mathbb{1}\left[\mathrm{rank}_q \le k\right], \qquad \mathrm{MRR} = \frac{1}{|Q|}\sum_{q \in Q} \frac{1}{\mathrm{rank}_q}`}
                  legend={[
                    [String.raw`Q`, "zbiór pytań testowych"],
                    [String.raw`\mathrm{rank}_q`, "pozycja pierwszego chunku z właściwego dokumentu; brak w wynikach daje 0 w obu sumach"],
                    [String.raw`\mathbb{1}[\cdot]`, "1, jeśli warunek jest spełniony, w przeciwnym razie 0"],
                  ]}
                />
              </Reveal>
              <Reveal delay={0.3} className="mt-6">
                <CodeBlock code={evalFn} title="notebook.ipynb · evaluate()" highlight={[10, 11]} />
              </Reveal>
            </div>
            <div className="space-y-4">
              <Reveal delay={0.1}>
                <Terminal output={S.NB.eval.output} title={`${S.MODELS.embed} · 16 pytań, chunki 300/50`} wrap={false} />
              </Reveal>
              <Reveal delay={0.25}>
                <Terminal output={S.NB["chunk-eval"].output} title="wektory · rozmiar chunku" wrap={false} />
              </Reveal>
              <Reveal delay={0.4}>
                <Callout>Jedno pytanie zmienia hit@1 o 0.06. Na małym korpusie dobre embeddingi same radzą sobie dobrze; hybryda bez rerankingu wypadła tu gorzej niż same wektory. Wniosek: mierzyć na własnych danych, a nie zakładać.</Callout>
              </Reveal>
            </div>
          </div>
          <Reveal delay={0.2} className="mt-8">
            <StableSteps><EvalMetricsViz /></StableSteps>
          </Reveal>
        </Slide>

        {/* ---------- Sędzia ---------- */}
        <Slide id="sedzia">
          <SectionHeading
            eyebrow="11 · Ocena odpowiedzi"
            accent="LLM jako sędzia"
            title="sprawdza wierność i poprawność"
            lead="Hit rate ocenia wyszukiwanie, nie odpowiedź. Drugie wywołanie modelu sprawdza, czy odpowiedź wynika z kontekstu (faithfulness) i zgadza się ze wzorcem. Tak działają metryki RAGAS i DeepEval."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <CodeBlock code={judgePrompt} title="notebook.ipynb · judge()" highlight={[3, 4]} />
            </Reveal>
            <div className="space-y-4">
              <Reveal delay={0.25}>
                <Terminal output={S.NB.judge.output} title={`${S.MODELS.chat} jako sędzia · 8 pytań`} wrap={false} />
              </Reveal>
              <Reveal delay={0.4}>
                <Terminal output={S.NB["judge-control"].output} title="przypadki kontrolne o znanej ocenie" />
              </Reveal>
            </div>
          </div>
          <Reveal delay={0.2} className="mt-6">
            <StableSteps steps={S.JUDGE_CASES.flatMap((_, i) => [2 * i, 2 * i + 1])}><JudgeViz cases={S.JUDGE_CASES} model={S.MODELS.chat} /></StableSteps>
          </Reveal>
          <Reveal delay={0.4} className="mt-6">
            <Callout kind="warning">Same oceny 1/1 nie dowodzą, że sędzia działa. Przypadki kontrolne (dopisana halucynacja, odpowiedź z nieaktualnej polityki) pokazują, że tu odróżnia wierność od poprawności. Sędzia jest modelem i też się myli, więc kontrole uruchamia się przy każdej zmianie promptu albo modelu.</Callout>
          </Reveal>
        </Slide>

        {/* ---------- Koniec ---------- */}
        <Slide id="zadanie">
          <SectionHeading eyebrow="12 · Do pracy" accent="Notebook" title="i zadanie" />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            <EndCard delay={0.1} icon={<BookOpenText className="size-5" />} title="Notebook z przykładami" text="Kod z prezentacji z zapisanymi wynikami." href="/notebook/02-rag/" internal />
            <EndCard delay={0.2} icon={<ExternalLink className="size-5" />} title="Notebook w Colabie" text="Korpus pobiera się sam z repozytorium." href={colabUrl("02-rag/notebook.ipynb")} />
            <EndCard delay={0.3} icon={<SquarePen className="size-5" />} title="Zadanie w Colabie" text="RAG na własnym korpusie, porównanie metod wyszukiwania, ocena odpowiedzi." href={colabUrl("02-rag/zadanie.ipynb")} badge="Zadanie" />
          </div>
          <Reveal delay={0.4} className="mt-6">
            <Panel className="flex flex-wrap items-center gap-x-6 gap-y-2 p-5">
              <span className="flex items-center gap-2 text-sm text-brand-300">
                <Mail className="size-4" /> Oddanie mailem
              </span>
              <span className="font-mono">[TEG] lab-02</span>
              <span className="text-sm text-fg-muted">notebook z wynikami komórek, bez kluczy API, przed zajęciami 3</span>
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
