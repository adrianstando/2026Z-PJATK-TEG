import Link from "next/link";
import { ArrowDown, BookOpen, KeyRound, Mail, NotebookPen, Presentation, SquarePen } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { Slide } from "@/components/site/Slide";
import { LessonCard } from "@/components/molecules/LessonCard";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { Callout } from "@/components/molecules/Callout";
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
  { icon: SquarePen, title: "Zadanie", text: "Do wykonania na zajęciach albo po nich; na zmianę z quizem." },
];

const SCHEDULE = [
  { when: "Zajęcia 1–4", what: "Zadania po zajęciach, oddawane mailem" },
  { when: "Zajęcia 5", what: "Test z pytaniami praktycznymi" },
  { when: "Zajęcia 7", what: "Skillathon: praca w grupach z agentem kodującym" },
  { when: "Zajęcia 8", what: "Prezentacje projektów" },
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
              <Link href="/dostep-do-llm/">
                <KeyRound className="size-4" /> Dostęp do LLM
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <a href={REPO_URL}>
                <BookOpen className="size-4" /> Notebooki
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
                  Projekt prawdopodobnie w zespołach 2–3-osobowych; szczegóły na kolejnych zajęciach.
                </p>
              </Panel>
            </Reveal>
          </div>
        </Slide>

        <Slide id="zaliczenie">
          <SectionHeading eyebrow="Zaliczenie" accent="Składowe" title="zaliczenia" />
          <Reveal delay={0.1} className="mt-8">
            <Callout>Punktacja i rozkład punktów do potwierdzenia na kolejnych zajęciach. Trwają uzgodnienia między prowadzącymi.</Callout>
          </Reveal>
          <div className="mt-10">
            <GradingBar />
          </div>
          <Reveal delay={0.2} className="mt-14">
            <p className="mb-4 text-xs uppercase tracking-wider text-fg-subtle">Skala ocen</p>
            <GradeScale />
          </Reveal>
        </Slide>
      </main>
      <footer className="border-t border-[var(--line)] px-6 py-4 text-center text-xs text-fg-subtle">
        {COURSE.name} · {COURSE.school} {COURSE.term} · {COURSE.instructor}
      </footer>
    </>
  );
}
