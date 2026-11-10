import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { Slide } from "@/components/site/Slide";
import { HeroTitle } from "@/components/lesson/HeroTitle";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { Callout } from "@/components/molecules/Callout";
import { StableSteps } from "@/components/molecules/StableSteps";
import { Reveal } from "@/components/motion/Reveal";
import { Panel } from "@/components/ui/Panel";
import { BpeViz } from "@/components/viz/internals/BpeViz";
import { NetworkDiagram } from "@/components/viz/internals/NetworkDiagram";
import { QkvViz } from "@/components/viz/internals/QkvViz";
import { BlockViz } from "@/components/viz/internals/BlockViz";
import { GenerationViz } from "@/components/viz/internals/GenerationViz";
import { RopeViz } from "@/components/viz/internals/RopeViz";
import { AttentionViz } from "@/components/viz/internals/AttentionViz";
import { ResidualViz } from "@/components/viz/internals/ResidualViz";
import { MoeViz } from "@/components/viz/internals/MoeViz";
import { GemmaEViz } from "@/components/viz/internals/GemmaEViz";
import { TrainingViz } from "@/components/viz/internals/TrainingViz";

export const metadata: Metadata = { title: "Jak działa Large Language Model?" };

const AGENDA = [
  { label: "Schemat sieci", id: "schemat" },
  { label: "Tokenizacja", id: "tokenizacja" },
  { label: "Embedding i pozycja", id: "pozycja" },
  { label: "Atencja", id: "atencja" },
  { label: "Blok transformera", id: "blok" },
  { label: "Residual stream", id: "residual" },
  { label: "Trening", id: "trening" },
  { label: "Generowanie", id: "generowanie" },
  { label: "Mixture of Experts", id: "moe" },
  { label: "Gemma „E”", id: "gemma-e" },
  { label: "Ważne pojęcia", id: "pojecia" },
];

function Src({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="inline-flex items-center gap-1 text-brand-300 underline-offset-2 hover:underline">
      {children}
      <ExternalLink className="size-3" />
    </a>
  );
}

const ax = (id: string) => `https://arxiv.org/abs/${id}`;

const TECHNIQUES: { title: string; text: string; src: [string, string][] }[] = [
  {
    title: "KV cache",
    text: "Klucze i wartości poprzednich tokenów zapisuje się w pamięci, więc przy każdym nowym tokenie liczy się Q, K, V tylko dla niego. Pamięć cache rośnie liniowo z długością kontekstu.",
    src: [["dokumentacja Hugging Face", "https://huggingface.co/docs/transformers/cache_explanation"]],
  },
  {
    title: "GQA i MLA",
    text: "W zwykłej atencji każda głowa ma własne K i V i wszystkie trafiają do KV cache. GQA (grouped-query attention): kilka głów zapytań dzieli jedną parę K/V, np. 32 głowy Q i 8 par K/V, więc cache jest 4 razy mniejszy. MLA (multi-head latent attention): K i V zapisuje się jako jeden krótki wektor, z którego odtwarza się je przy liczeniu atencji.",
    src: [
      ["GQA, EMNLP 2023", "https://aclanthology.org/2023.emnlp-main.298"],
      ["MLA, raport DeepSeek-V2", ax("2405.04434")],
    ],
  },
  {
    title: "Długi kontekst",
    text: "Część warstw liczy atencję tylko w oknie ostatnich tokenów (sliding window), więc koszt nie rośnie z kwadratem długości. RoPE da się rozciągnąć na dłuższe pozycje krótkim dotrenowaniem, bez treningu od zera (YaRN).",
    src: [
      ["Longformer, 2020", ax("2004.05150")],
      ["YaRN, ICLR 2024", "https://openreview.net/forum?id=wHBfxhZu1u"],
    ],
  },
  {
    title: "Speculative decoding",
    text: "Mały model proponuje kilka tokenów, duży sprawdza je w jednym przebiegu i przyjmuje zgodny początek. Rozkład wyników jest taki sam jak dla samego dużego modelu, a generowanie 2–3 razy szybsze.",
    src: [["ICML 2023", "https://proceedings.mlr.press/v202/leviathan23a.html"]],
  },
  {
    title: "Modele rozumujące",
    text: "Model przed odpowiedzią pisze długi tok rozumowania. Uczy się tego przez uczenie ze wzmocnieniem na zadaniach ze sprawdzalną odpowiedzią (matematyka, kod): nagrodę dostaje za poprawny wynik. Więcej tokenów rozumowania w czasie inferencji (test-time compute) daje lepsze wyniki.",
    src: [
      ["DeepSeek-R1, Nature 2025", "https://www.nature.com/articles/s41586-025-09422-z"],
      ["OpenAI o1, 2024", "https://openai.com/index/learning-to-reason-with-llms/"],
    ],
  },
  {
    title: "FlashAttention",
    text: "Atencję liczy się kafelkami w szybkiej pamięci GPU, bez zapisywania całej macierzy wag T × T. Wynik jest dokładnie ten sam, ale pamięć rośnie liniowo z długością kontekstu, a nie kwadratowo.",
    src: [["NeurIPS 2022", "https://proceedings.neurips.cc/paper_files/paper/2022/hash/67d57c32e20fd0a7a302cb81d36e40d5-Abstract-Conference.html"]],
  },
  {
    title: "Kwantyzacja",
    text: "Wagi zapisuje się w 8 albo 4 bitach zamiast 16. Model zajmuje 2–4 razy mniej pamięci kosztem niewielkiego spadku jakości; tak są zapisane modele w Ollamie (format GGUF).",
    src: [["GPTQ, ICLR 2023", ax("2210.17323")]],
  },
  {
    title: "Destylacja",
    text: "Mały model (uczeń) uczy się odtwarzać rozkład prawdopodobieństw dużego modelu (nauczyciela), a nie tylko jeden poprawny token. Dostaje więcej informacji z każdego przykładu.",
    src: [["Hinton i in. 2015", ax("1503.02531")]],
  },
];

export default function LlmInternals() {
  return (
    <>
      <SiteNav />
      <main>
        <Slide id="start">
          <HeroTitle
            eyebrow="Materiały dodatkowe"
            lines={["Jak działa", "Large Language Model?"]}
            accentLine={1}
            lead="Tokenizacja, atencja, warstwy transformera, trening i generowanie na jednym przykładzie: zdaniu „The Eiffel Tower is located in the city of”."
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

        <Slide id="schemat">
          <SectionHeading
            eyebrow="01 · Schemat sieci"
            accent="Budowa"
            title="modelu językowego"
            lead="Tekst jest zamieniany na tokeny, a tokeny na wektory. Wektory przechodzą przez N bloków o tej samej budowie; największe modele mają ich ponad 100. Model zwraca rozkład prawdopodobieństwa następnego tokenu. Kolejne sekcje omawiają wszystkie etapy po kolei, a kliknięcie części schematu przenosi do odpowiedniej sekcji."
          />
          <Reveal delay={0.2} className="mt-12">
            <Panel className="p-4 sm:p-6 md:p-8">
              <NetworkDiagram links />
            </Panel>
          </Reveal>
        </Slide>

        <Slide id="tokenizacja">
          <SectionHeading
            eyebrow="02 · Tokenizacja"
            accent="Słownik tokenów"
            title="powstaje ze scalania częstych par"
            lead="Byte Pair Encoding zaczyna od pojedynczych znaków. W każdym kroku liczy sąsiednie pary w tekście treningowym i najczęstszą zastępuje nowym tokenem z kolejnym ID. Nowy tekst koduje się tymi samymi scaleniami, a do modelu trafiają same numery ID."
          />
          <Reveal delay={0.2} className="mt-12">
            <BpeViz />
          </Reveal>
        </Slide>

        <Slide id="pozycja">
          <SectionHeading
            eyebrow="03 · Embedding i pozycja"
            accent="Pozycję tokenu"
            title="koduje obrót wektora"
            lead="Każdy token dostaje swój embedding: wektor liczb, który jest wejściem do modelu. Ten sam token ma zawsze ten sam embedding, niezależnie od miejsca w zdaniu, więc informację o kolejności trzeba dodać osobno. RoPE (Rotary Position Embedding) obraca pary liczb o kąt zależny od pozycji tokenu."
          />
          <Reveal delay={0.2} className="mt-12">
            <RopeViz />
          </Reveal>
        </Slide>

        <Slide id="atencja">
          <SectionHeading
            eyebrow="04 · Atencja"
            accent="Atencja"
            title="miesza informację między tokenami"
            lead="Z wektora każdego tokenu powstają trzy nowe: zapytanie Q, klucz K i wartość V. Podobieństwo Q do kluczy wcześniejszych tokenów decyduje, z jaką wagą token pobiera ich wartości. Macierze W są wyuczone i stałe, X zależy od tekstu."
          />
          <Reveal delay={0.2} className="mt-12">
            <QkvViz />
          </Reveal>
          <Reveal delay={0.2} className="mt-6">
            <AttentionViz />
          </Reveal>
        </Slide>

        <Slide id="blok">
          <SectionHeading
            eyebrow="05 · Blok transformera"
            accent="Atencja i MLP"
            title="z normalizacją i połączeniami residualnymi"
            lead="Atencja to połowa bloku. Druga połowa to MLP, które przetwarza każdy token osobno. Przed każdą częścią jest normalizacja, a po niej wynik dodaje się do wejścia."
          />
          <Reveal delay={0.2} className="mt-12">
            <BlockViz />
          </Reveal>
        </Slide>

        <Slide id="residual">
          <SectionHeading
            eyebrow="06 · Residual stream"
            accent="Warstwy dopisują"
            title="do wspólnego strumienia"
            lead="Wektory tokenów płyną przez wszystkie bloki, a każdy blok dodaje do nich swoją poprawkę. Z ostatniego stanu ostatniego tokenu powstaje rozkład następnego tokenu."
          />
          <Reveal delay={0.2} className="mt-12">
            <StableSteps><ResidualViz /></StableSteps>
          </Reveal>
        </Slide>

        <Slide id="trening">
          <SectionHeading
            eyebrow="07 · Trening"
            accent="Trening"
            title="to nauka przewidywania kolejnego tokenu"
            lead="Trening polega na wielokrotnym przechodzeniu przez zbiór danych. W każdym kroku model przewiduje następny token na każdej pozycji fragmentów tekstu, liczy się błąd (entropia krzyżowa), a propagacja wsteczna wyznacza gradienty, według których optymalizator koryguje wagi. Poniżej mały model uczony na „Panu Tadeuszu”."
          />
          <Reveal delay={0.2} className="mt-12">
            <TrainingViz />
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <Callout>
              Model bazowy tylko dokańcza tekst. Asystentem staje się po fine-tuningu na przykładach rozmów i po uczeniu ze wzmocnieniem. W RLHF (Reinforcement Learning from Human Feedback) ludzie wybierają lepszą z dwóch odpowiedzi, na tych wyborach uczy się osobny model nagrody, a model językowy jest dostrajany tak, żeby dostawać od niego wysokie oceny. Nowsze modele dostają też nagrody za sprawdzalne odpowiedzi, np. poprawny wynik zadania albo kod, który przechodzi testy.
            </Callout>
          </Reveal>
        </Slide>

        <Slide id="generowanie">
          <SectionHeading
            eyebrow="08 · Generowanie"
            accent="Tekst powstaje"
            title="token po tokenie"
            lead="Wybrany token dopisuje się na koniec wejścia i cały przebieg się powtarza, aż model wygeneruje token końca albo osiągnie limit długości."
          />
          <Reveal delay={0.2} className="mt-12">
            <StableSteps><GenerationViz /></StableSteps>
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <Callout>
              Losowanie z rozkładu z temperaturą, top-k i top-p pokazuje interaktywny przykład z{" "}
              <Link href="/zajecia/01-llm-embeddingi/#generowanie" className="text-brand-300 underline-offset-2 hover:underline">
                zajęć 1
              </Link>
              .
            </Callout>
          </Reveal>
        </Slide>

        <Slide id="moe">
          <SectionHeading
            eyebrow="09 · Dodatek: Mixture of Experts"
            accent="Każdy token"
            title="używa tylko części modelu"
            lead="W bloku MoE zamiast jednego MLP jest wielu ekspertów, czyli niezależnych MLP. Atencja zostaje wspólna. Router wybiera dla każdego tokenu kilku ekspertów; model przechowuje wszystkie parametry, ale na jeden token liczy tylko aktywne."
          />
          <Reveal delay={0.2} className="mt-12">
            <Panel className="p-4 sm:p-6 md:p-8">
              <NetworkDiagram moe />
            </Panel>
          </Reveal>
          <Reveal delay={0.2} className="mt-6">
            <MoeViz />
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <Panel className="grid gap-4 p-5 sm:grid-cols-3">
              <div>
                <p className="font-mono text-3xl tabular-nums">25,2 mld</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-fg-subtle">parametrów łącznie</p>
              </div>
              <div>
                <p className="font-mono text-3xl tabular-nums text-hit">3,8 mld</p>
                <p className="mt-1 text-xs uppercase tracking-wider text-fg-subtle">aktywnych na token</p>
              </div>
              <div className="text-sm text-fg-muted">
                Gemma 4 26B A4B: 128 ekspertów, 8 aktywnych + 1 wspólny. Liczy się jak model 4 mld, ale wszystkie wagi muszą być w pamięci. <Src href="https://ai.google.dev/gemma/docs/core/model_card_4">model card</Src>
              </div>
            </Panel>
          </Reveal>
        </Slide>

        <Slide id="gemma-e">
          <SectionHeading
            eyebrow="10 · Dodatek: Gemma „E”"
            accent="E4B ma 8 mld parametrów,"
            title="ale na akceleratorze potrzebuje 4,5 mld"
            lead="Gemma E2B i E4B są przeznaczone na urządzenia z małą pamięcią akceleratora (GPU albo NPU w telefonie). Każda warstwa ma dodatkową tabelę Per-Layer Embeddings z małym wektorem dla każdego tokenu słownika. Token na każdej warstwie dostaje wiersz z tej tabeli wyszukany po swoim ID, bez mnożenia macierzy. Dzięki temu te statyczne wartości mogą leżeć w RAM-ie, a na akceleratorze zostają tylko wagi potrzebne do obliczeń. Stąd „E” jak effective."
          />
          <Reveal delay={0.2} className="mt-12">
            <GemmaEViz />
          </Reveal>
          <p className="mt-4 text-sm text-fg-muted">
            Źródło: <Src href="https://ai.google.dev/gemma/docs/core/model_card_4">Gemma 4 model card</Src>
          </p>        </Slide>

        <Slide id="pojecia">
          <SectionHeading
            eyebrow="11 · Ważne pojęcia"
            accent="Techniki"
            title="w nowoczesnych modelach"
            lead="Większość z nich zmniejsza koszt pamięci i obliczeń w czasie generowania albo pozwala na dłuższy kontekst."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TECHNIQUES.map((t, i) => (
              <Reveal key={t.title} delay={0.05 * i}>
                <Panel className="flex h-full flex-col p-5">
                  <p className="text-lg font-medium">{t.title}</p>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-fg-muted">{t.text}</p>
                  <p className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.7rem]">
                    {t.src.map(([l, h]) => (
                      <Src key={h} href={h}>
                        {l}
                      </Src>
                    ))}
                  </p>
                </Panel>
              </Reveal>
            ))}
          </div>
        </Slide>
      </main>
    </>
  );
}
