"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { StableHeight } from "@/components/molecules/StableHeight";
import { ToggleGroup } from "radix-ui";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";

type Part = { id: string; label: string; lines: string[]; when: string; text: string; tip: string };

const PARTS: Part[] = [
  {
    id: "fm",
    label: "frontmatter",
    lines: ["---", "name: walidacja-danych"],
    when: "zawsze w kontekście",
    text: "Nazwa: małe litery, cyfry i myślniki, do 64 znaków, identyczna z nazwą katalogu. Po niej wywołuje się skill wprost (/walidacja-danych albo $walidacja-danych).",
    tip: "Nazwa katalogu inna niż name: część narzędzi pominie skill.",
  },
  {
    id: "desc",
    label: "description",
    lines: [
      "description: Reguły walidacji danych wejściowych",
      "  i komunikaty błędów. Używać przy dodawaniu",
      "  formularza, endpointu albo importu pliku i przy",
      "  obsłudze błędnych danych. Nie dotyczy uprawnień.",
      "---",
    ],
    when: "zawsze w kontekście",
    text: "Jedyna część, którą agent widzi przed decyzją o wczytaniu skilla. Mówi, co skill robi i kiedy go użyć, słowami z zadania. Do 1024 znaków.",
    tip: "„Walidacja z zod” opisuje implementację; agent nie dopasuje tego do „dodaj import CSV”.",
  },
  {
    id: "intro",
    label: "wstęp",
    lines: ["# walidacja-danych", "", "Jak odrzucać błędne dane i co zwracać użytkownikowi."],
    when: "po dopasowaniu",
    text: "Jedno–dwa zdania: jaką decyzję rozstrzyga skill. Od tego miejsca treść trafia do kontekstu dopiero, gdy zadanie pasuje do opisu.",
    tip: "Akapit o tym, jak ważna jest walidacja, to koszt bez efektu.",
  },
  {
    id: "contract",
    label: "kontrakt",
    lines: ["## Kontrakt", "Błąd: HTTP 422, {\"blad\": \"<powód>\", \"pole\": \"<nazwa>\"}", "Daty: YYYY-MM-DD. Kwoty: string z 2 miejscami."],
    when: "po dopasowaniu",
    text: "Wejście i wyjście z nazwami pól, typami, formatami i kodami. Na kontrakcie spotykają się skille kilku osób: jeśli się różni, kod agenta jest niespójny.",
    tip: "„Zwróć odpowiedni błąd” każdy rozumie inaczej.",
  },
  {
    id: "steps",
    label: "kroki",
    lines: ["## Kroki", "1. Waliduj na wejściu, przed logiką.", "2. Zbieraj wszystkie błędy, nie tylko pierwszy.", "3. Pusta lista to nie błąd: 200 i []."],
    when: "po dopasowaniu",
    text: "Tryb rozkazujący, konkretne liczby i nazwy. Tylko decyzje, których agent nie podejmie sam; sposobu pisania pętli nie trzeba tłumaczyć.",
    tip: "„Pisz czysty kod” agent wie i bez skilla.",
  },
  {
    id: "dont",
    label: "czego nie robić",
    lines: ["## Czego nie robić", "- Nie łap wyjątków bez komunikatu (catch {})."],
    when: "po dopasowaniu",
    text: "Pułapki i skróty, które kuszą agenta. Najlepiej z doświadczenia: po każdym błędzie agenta dopisuje się tu regułę.",
    tip: "Ogólne „uważaj na błędy” nic nie zmienia; reguła musi wskazywać konkretne zachowanie.",
  },
  {
    id: "check",
    label: "sprawdzenie",
    lines: ["## Sprawdzenie", "npm test -- walidacja", "Szczegóły pól: references/pola.md"],
    when: "pliki na żądanie",
    text: "Jak potwierdzić, że reguły są spełnione. Długie tabele trafiają do references/ i są czytane dopiero, gdy SKILL.md każe po nie sięgnąć.",
    tip: "400 linii w SKILL.md zjada kontekst przy każdym użyciu.",
  },
];

const TONE: Record<string, string> = {
  "zawsze w kontekście": "text-focus",
  "po dopasowaniu": "text-brand-300",
  "pliki na żądanie": "text-cat-2",
};

/**
 * Organizm: przykładowy SKILL.md podzielony na części; wybór części pokazuje,
 * po co jest i kiedy trafia do kontekstu agenta (zawsze / po dopasowaniu / na żądanie).
 * Bez autoodtwarzania: części wybiera prowadzący; karta opisu ma wysokość najdłuższego wariantu.
 */
export function SkillAnatomy() {
  const [sel, setSel] = useState("fm");
  const reduce = useReducedMotion();
  const part = PARTS.find((p) => p.id === sel) ?? PARTS[0];
  let line = 0;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <Panel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-2.5 font-mono text-xs text-fg-subtle">
          <span>.claude/skills/walidacja-danych/SKILL.md</span>
          <span className="hidden sm:inline">kliknij część</span>
        </div>
        <ToggleGroup.Root
          type="single"
          value={sel}
          onValueChange={(v) => v && setSel(v)}
          aria-label="Część pliku SKILL.md"
          orientation="vertical"
          className="flex flex-col py-2"
        >
          {PARTS.map((p) => (
            <ToggleGroup.Item
              key={p.id}
              value={p.id}
              className={cn(
                "group relative border-l-2 px-4 py-1 text-left font-mono text-[0.78rem] leading-relaxed transition-colors sm:text-sm",
                p.id === sel ? "border-focus bg-[var(--panel-hi)]" : "border-transparent hover:bg-[var(--panel)]",
              )}
            >
              {p.lines.map((l) => {
                line += 1;
                return (
                  <span key={line} className="flex gap-4 whitespace-pre-wrap break-words">
                    <span className="w-5 shrink-0 select-none text-right text-fg-subtle tabular-nums">{line}</span>
                    <span className={cn(p.id === sel ? "text-fg" : "text-fg-muted", l.startsWith("#") && "text-brand-300")}>{l || " "}</span>
                  </span>
                );
              })}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      </Panel>

      <div className="space-y-4">
        <StableHeight variants={PARTS.map((p) => <PartCard key={p.id} part={p} />)}>
          <AnimatePresence mode="wait">
            <motion.div
              key={part.id}
              className="grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.25 }}
            >
              <PartCard part={part} />
            </motion.div>
          </AnimatePresence>
        </StableHeight>
        <Panel className="p-5">
          <p className="text-sm text-fg-muted">Co trafia do kontekstu agenta:</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <span className="font-mono text-focus">zawsze</span> · name i description, ok. 100 tokenów na skill
            </li>
            <li>
              <span className="font-mono text-brand-300">po dopasowaniu</span> · całe SKILL.md, zalecane &lt; 500 linii
            </li>
            <li>
              <span className="font-mono text-cat-2">na żądanie</span> · references/, scripts/, assets/
            </li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function PartCard({ part }: { part: Part }) {
  return (
    <Panel className="h-full p-6">
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-400">{part.label}</p>
      <p className={cn("mt-1 font-mono text-xs", TONE[part.when])}>{part.when}</p>
      <p className="mt-4 text-lg leading-relaxed">{part.text}</p>
      <p className="mt-4 border-t border-[var(--line)] pt-4 text-sm text-miss">{part.tip}</p>
    </Panel>
  );
}
