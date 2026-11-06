import Link from "next/link";
import { ArrowDown, ArrowRight, Cpu, KeyRound, Mail, NotebookPen, Presentation, SquarePen } from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { SiteNav } from "@/components/site/SiteNav";
import { Slide } from "@/components/site/Slide";
import { LessonCard } from "@/components/molecules/LessonCard";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { GradeScale, GradingBar } from "@/components/viz/GradingBar";
import { HeroConstellation } from "@/components/viz/HeroConstellation";
import { HeroTitle } from "@/components/lesson/HeroTitle";
import { Button } from "@/components/ui/Button";
import { Panel } from "@/components/ui/Panel";
import { Reveal } from "@/components/motion/Reveal";
import { COURSE, LESSONS } from "@/content/course";
import { REPO_URL } from "@/lib/paths";

const STRUCTURE = [
  { icon: Presentation, title: "Wprowadzenie", text: "Krótka prezentacja z interaktywnymi przykładami." },
  { icon: NotebookPen, title: "Notebook", text: "Przykłady kodu do uruchomienia i modyfikacji." },
  { icon: SquarePen, title: "Zadanie", text: "Do wykonania na zajęciach albo po nich." },
];

const SCHEDULE = [
  { when: "Zajęcia 1–4", what: "Zadania po zajęciach, oddawane mailem" },
  { when: "Zajęcia 5", what: "Test z pytaniami praktycznymi" },
  { when: "Zajęcia 7", what: "Skillathon: praca w grupach z agentem kodującym" },
  { when: "Zajęcia 8", what: "Prezentacje projektów" },
];

const EXTRA = [
  {
    href: "/dostep-do-llm/",
    icon: KeyRound,
    title: "Dostęp do LLM",
    text: "Copilot, Ollama, Azure, OpenAI i inne opcje: porównanie, konfiguracja i wywołania z Pythona.",
  },
  {
    href: "/extra/jak-dziala-llm/",
    icon: Cpu,
    title: "Jak działa Large Language Model?",
    text: "Schemat sieci, tokenizacja, atencja, trening i generowanie tekstu na animacjach.",
  },
];

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Slide id="start">
          <div className="pointer-events-none absolute right-[4%] top-1/2 hidden w-[min(40vw,560px)] -translate-y-1/2 lg:block">
            <HeroConstellation />
          </div>
          <HeroTitle
            eyebrow={`${COURSE.school} · semestr zimowy 2026/27`}
            lines={["Technologie", "generatywne"]}
            accentLine={1}
            lead="LLM, embeddingi, RAG, GraphRAG, agenci i MCP."
          />
          <Reveal delay={0.9} className="mt-10 flex flex-wrap gap-3">
            <Button asChild>
              <a href="#zajecia">
                Zajęcia <ArrowDown className="size-4" />
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a href={REPO_URL}>
                <GitHubLogoIcon className="size-4" /> Repozytorium
              </a>
            </Button>
          </Reveal>
        </Slide>

        <Slide id="zajecia">
          <SectionHeading
            eyebrow="Zajęcia"
            accent="LLM, RAG, GraphRAG,"
            title="agenci, MCP i agentic coding"
            lead="Każda podstrona zawiera prezentację oraz notebook do pracy."
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {LESSONS.map((l, i) => (
              <LessonCard key={l.slug} lesson={l} index={i} />
            ))}
          </div>
          <Reveal delay={0.2} className="mt-10">
            <p className="mb-3 text-xs uppercase tracking-wider text-fg-subtle">Materiały dodatkowe</p>
            <div className="grid gap-5 sm:grid-cols-2">
              {EXTRA.map((e) => (
                <Link
                  key={e.href}
                  href={e.href}
                  className="group flex items-center gap-5 rounded-2xl border border-brand-500/40 bg-gradient-to-br from-brand-500/15 to-cyan-400/5 p-5 transition-colors hover:border-brand-400 sm:p-6"
                >
                  <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-brand-500/20 text-brand-300">
                    <e.icon className="size-7" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-xl font-medium">{e.title}</span>
                    <span className="mt-1 block text-sm text-fg-muted">{e.text}</span>
                  </span>
                  <ArrowRight className="size-5 shrink-0 text-brand-300 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </Reveal>
        </Slide>

        <Slide id="uklad">
          <SectionHeading eyebrow="Przebieg" accent="Układ" title="zajęć" />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {STRUCTURE.map((s, i) => (
              <Reveal key={s.title} delay={0.1 + i * 0.12}>
                <Panel className="h-full p-6">
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-brand-500/15 text-brand-300">
                      <s.icon className="size-4.5" />
                    </span>
                    <span className="font-mono text-sm text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <p className="mt-4 text-lg font-medium">{s.title}</p>
                  <p className="mt-1 text-fg-muted">{s.text}</p>
                </Panel>
              </Reveal>
            ))}
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Reveal delay={0.2}>
              <Panel className="h-full p-6">
                <div className="flex items-center gap-2 text-brand-300">
                  <Mail className="size-4" /> <span className="text-sm font-medium">Zadania wysyłane mailem</span>
                </div>
                <p className="mt-4 text-fg-muted">Temat wiadomości w formacie:</p>
                <p className="mt-2 font-mono text-xl">
                  [TEG] lab-01 <span className="text-fg-subtle">· [TEG] lab-02 · …</span>
                </p>
                <p className="mt-4 text-sm text-fg-muted">Notebook z wynikami komórek w załączniku, bez kluczy API.</p>
              </Panel>
            </Reveal>
            <Reveal delay={0.3}>
              <Panel className="h-full p-6">
                <ul className="space-y-3">
                  {SCHEDULE.map((s) => (
                    <li key={s.when} className="grid grid-cols-[7.5rem_1fr] gap-3">
                      <span className="font-mono text-sm text-brand-300">{s.when}</span>
                      <span className="text-fg-muted">{s.what}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-[var(--line)] pt-4 text-sm text-fg-muted">
                  Projekt w parach, propozycja tematu do 19.12.2026.{" "}
                  <Link href="/projekt/" className="text-brand-300 underline decoration-brand-500/40 underline-offset-4 hover:decoration-brand-300">
                    Zasady projektu
                  </Link>
                </p>
              </Panel>
            </Reveal>
          </div>
        </Slide>

        <Slide id="zaliczenie">
          <SectionHeading eyebrow="Zaliczenie" accent="Składowe" title="zaliczenia" />
          <div className="mt-10">
            <GradingBar />
          </div>
          <Reveal delay={0.2} className="mt-14">
            <p className="mb-4 text-xs uppercase tracking-wider text-fg-subtle">Skala ocen</p>
            <GradeScale />
          </Reveal>
        </Slide>
      </main>
    </>
  );
}
