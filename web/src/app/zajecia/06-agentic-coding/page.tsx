import type { Metadata } from "next";
import { BookOpenText, ExternalLink, GraduationCap, Mail, SquarePen } from "lucide-react";
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
import { CodingHarnessViz } from "@/components/viz/CodingHarnessViz";
import { AgentLoopCompareViz } from "@/components/viz/AgentLoopCompareViz";
import { ContextBuildViz } from "@/components/viz/ContextBuildViz";
import { ClaudeTreeViz } from "@/components/viz/ClaudeTreeViz";
import { SubagentHookViz } from "@/components/viz/SubagentHookViz";
import { PluginInstallViz } from "@/components/viz/PluginInstallViz";
import { VulnMapViz } from "@/components/viz/VulnMapViz";
import { ConfigLadderViz } from "@/components/viz/ConfigLadderViz";
import { TREE_WITH_FILES } from "@/content/lesson06/files";
import * as S from "@/content/lesson06/snippets";
import runs from "@/data/lesson06-runs.json";

export const metadata: Metadata = { title: "Zajęcia 6 · Agentic coding" };

const GH = "https://github.com/adrianstando/2026Z-PJATK-TEG/tree/main/06-agentic-coding";
const GH_BLOB = "https://github.com/adrianstando/2026Z-PJATK-TEG/blob/main/06-agentic-coding";
const link = "underline decoration-brand-400 underline-offset-4 hover:text-fg";

const AGENDA = [
  { label: "Harness", id: "harness" },
  { label: "Narzędzia", id: "narzedzia" },
  { label: "Własny harness", id: "wlasny-harness" },
  { label: "Pętla agenta", id: "petla" },
  { label: "Pliki md", id: "pliki-md" },
  { label: "Kontekst", id: "kontekst" },
  { label: "Skill, hook, plugin", id: "pojecia" },
  { label: "Folder .claude", id: "folder" },
  { label: "Subagenci i hooki", id: "subagenci" },
  { label: "Pluginy", id: "plugin" },
  { label: "Repozytorium kursu", id: "repo-kursu" },
  { label: "Design system", id: "design" },
  { label: "Vibe coding", id: "vibe" },
  { label: "Konfiguracja a luki", id: "drabina" },
  { label: "Ukryte testy", id: "test" },
  { label: "Jak pisać skill", id: "skill" },
  { label: "Przygotowanie do skillathonu", id: "skillathon" },
  { label: "Zadanie", id: "zadanie" },
];

const TOOLS = [
  { name: "Claude Code", where: "terminal, VS Code, JetBrains, aplikacja desktop", file: "CLAUDE.md lub .claude/CLAUDE.md (AGENTS.md, gdy brak CLAUDE.md)", skills: ".claude/skills/", main: true },
  { name: "Codex", where: "CLI, IDE, aplikacja, chmura", file: "AGENTS.md", skills: ".agents/skills/" },
  { name: "GitHub Copilot", where: "VS Code (agent mode), Copilot CLI, cloud agent", file: ".github/copilot-instructions.md, AGENTS.md, CLAUDE.md", skills: ".github/skills/, .claude/skills/, .agents/skills/" },
  { name: "Antigravity", where: "IDE i CLI (Google)", file: "AGENTS.md, GEMINI.md, .agents/rules/", skills: ".agents/skills/" },
];

const HARNESSES = [
  { name: "Claude Code", models: "modele Claude" },
  { name: "Codex", models: "modele GPT" },
  { name: "GitHub Copilot", models: "GPT, Claude, Gemini" },
  { name: "Antigravity", models: "Gemini, Claude, gpt-oss" },
  { name: "Cursor", models: "własne i zewnętrzne" },
  { name: "harness.py", models: "nasz, piszemy go za chwilę" },
];

const MD_FILES = [
  { file: "AGENTS.md", role: "wspólny standard: jak uruchomić, przetestować, konwencje; czytają go Codex, Copilot, Antigravity" },
  { file: "CLAUDE.md", role: "to samo dla Claude Code; może importować inne pliki (@AGENTS.md)" },
  { file: ".claude/skills/<nazwa>/SKILL.md", role: "wiedza na konkretne zadanie, wczytywana tylko wtedy, gdy jest potrzebna" },
  { file: "DESIGN.md", role: "design system: tokeny, komponenty, zakazy (np. zakaz nowych kolorów)" },
  { file: "docs/workflow.md, specyfikacje, ADR", role: "kolejność pracy, wymagania, decyzje architektoniczne z uzasadnieniem" },
  { file: ".github/copilot-instructions.md", role: "instrukcje repozytorium dla GitHub Copilota" },
];

const DEFS = [
  { name: "CLAUDE.md", what: "Instrukcje projektu: jak uruchomić, przetestować, jakie są konwencje.", when: "w kontekście od startu każdej sesji" },
  { name: "rules/*.md", what: "Instrukcje dla części projektu, np. tylko dla backendu. Pole paths w nagłówku wskazuje pliki.", when: "gdy agent dotknie pasującego pliku" },
  { name: "skill", what: "Folder z SKILL.md: wiedza i procedura na jedno zadanie, czasem ze skryptami i materiałami obok.", when: "na starcie tylko opis, treść na żądanie" },
  { name: "subagent", what: "Agent z własnym promptem, narzędziami i osobnym kontekstem; dostaje zadanie poboczne.", when: "gdy główny agent mu je zleci" },
  { name: "hook", what: "Skrypt uruchamiany przez harness przy zdarzeniu, np. po każdej edycji pliku. Model go nie pomija.", when: "zawsze przy zdarzeniu" },
  { name: "settings.json", what: "Konfiguracja harnessu: uprawnienia (allow, deny), hooki, włączone pluginy.", when: "czyta harness, nie model" },
  { name: "plugin", what: "Paczka skilli, subagentów, hooków i serwerów MCP do zainstalowania jednym poleceniem.", when: "po instalacji, w każdym projekcie" },
  { name: "marketplace", what: "Repozytorium albo folder z listą pluginów (marketplace.json), z którego się je instaluje.", when: "raz, przy dodaniu" },
];

const SKILL_DIR = [
  { path: "secure-api/", note: "nazwa folderu = nazwa skilla = polecenie /secure-api", depth: 0 },
  { path: "SKILL.md", note: "wymagany: nagłówek name + description, potem instrukcja", depth: 1 },
  { path: "references/", note: "dłuższe materiały, czytane tylko gdy SKILL.md każe", depth: 1 },
  { path: "owasp-api.md", note: "", depth: 2 },
  { path: "scripts/", note: "skrypty, które agent uruchamia; do kontekstu trafia tylko wynik", depth: 1 },
  { path: "find_raw_sql.py", note: "", depth: 2 },
  { path: "assets/", note: "szablony i pliki, z których agent korzysta przy pracy", depth: 1 },
];

const ATOMIC = [
  { level: "Tokeny", ex: "kolory, fonty, odstępy, promienie w DESIGN.md", repo: "brand-500, ink-950, radius-card" },
  { level: "Atomy", ex: "najmniejsze elementy: przycisk, etykieta, panel", repo: "components/ui: Badge, Panel" },
  { level: "Molekuły", ex: "kilka atomów z jedną funkcją", repo: "molecules: CodeBlock, StepControls" },
  { level: "Organizmy", ex: "samodzielne sekcje interfejsu", repo: "viz: VulnMapViz, site: SiteNav" },
  { level: "Szablony", ex: "układ strony bez konkretnej treści", repo: "Slide, layout.tsx" },
  { level: "Strony", ex: "szablon wypełniony treścią", repo: "zajecia/06-agentic-coding/page.tsx" },
];

const DESIGN_MD = [
  { part: "nagłówek YAML", text: "tokeny: colors, typography, spacing, rounded, components" },
  { part: "## Overview", text: "charakter interfejsu w kilku zdaniach" },
  { part: "## Colors, Typography", text: "kiedy którego koloru i stylu tekstu używać" },
  { part: "## Layout, Shapes", text: "siatka, odstępy, zaokrąglenia" },
  { part: "## Components", text: "jak wyglądają przyciski, karty, bloki kodu" },
  { part: "## Do's and Don'ts", text: "zakazy, np. żadnych kolorów spoza tokenów" },
];

const SKILL_RULES = [
  { k: "description", v: "co skill robi i kiedy go użyć, słowami użytkownika; po nim agent decyduje o wczytaniu" },
  { k: "treść", v: "decyzje, których agent sam nie podejmie: progi, kontrakty danych, kolejność kroków, pułapki" },
  { k: "pliki obok", v: "szczegóły w references/, sprawdzenia w scripts/; SKILL.md krótki" },
  { k: "sprawdzenie", v: "test, skrypt albo hook, który pokaże złamanie reguły" },
  { k: "historia", v: "każda poprawka skilla to commit z powodem" },
];

const FREE_AGENTS = [
  { name: "GitHub Copilot", note: "Copilot Student bezpłatnie po weryfikacji w GitHub Education; agent mode w VS Code i Copilot CLI" },
  { name: "Codex", note: "konto ChatGPT, także w planie Free, z limitami" },
  { name: "Antigravity", note: "darmowy plan indywidualny z tygodniowym limitem agenta" },
  { name: "Cursor", note: "plan Hobby z limitem zapytań agenta" },
  { name: "OpenCode", note: "otwarty agent w terminalu; darmowe modele (OpenCode Zen, OpenRouter) albo własny klucz" },
  { name: "Claude Code", note: "plan Pro albo klucz API; darmowy plan go nie obejmuje" },
];

const testRun = runs.runs.find((r) => r.name === "z-md");
const testSaw = testRun?.steps.find((s) => s.tool === "run" && JSON.stringify(s.args).includes("atak"));

export default function Lesson06() {
  return (
    <>
      <SiteNav />
      <main>
        {/* ---------- Otwarcie ---------- */}
        <Slide id="start">
          <HeroTitle
            eyebrow="Zajęcia 6 z 8"
            lines={["Agentic", "coding"]}
            accentLine={0}
            lead="Agent kodujący to model w harnessie. Jakość jego pracy zależy od tego, jak harness jest skonfigurowany: CLAUDE.md, skille, hooki, pluginy, DESIGN.md. Na koniec przygotowanie do skillathonu i zadanie."
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

        {/* ---------- Harness ---------- */}
        <Slide id="harness">
          <SectionHeading
            eyebrow="01 · Harness"
            accent="Agent"
            title="= model + harness"
            lead="Model tylko generuje tekst, w tym prośby o wywołanie narzędzi. Harness to cała reszta: pętla, wykonanie narzędzi, budowanie kontekstu, skille, uprawnienia, pamięć, subagenci, kompakcja rozmowy."
          />
          <Reveal delay={0.2} className="mt-10">
            <CodingHarnessViz />
          </Reveal>
          <Reveal delay={0.3} className="mt-8">
            <p className="font-mono text-xs text-fg-subtle">przykłady harnessów: te same modele działają w różnych harnessach, a wyniki się różnią</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
              {HARNESSES.map((h) => (
                <Panel key={h.name} className="px-4 py-3">
                  <p className="text-sm font-medium">{h.name}</p>
                  <p className="mt-0.5 text-sm text-fg-muted">{h.models}</p>
                </Panel>
              ))}
            </div>
          </Reveal>
        </Slide>

        {/* ---------- Narzędzia ---------- */}
        <Slide id="narzedzia">
          <SectionHeading
            eyebrow="02 · Narzędzia"
            accent="Cztery narzędzia,"
            title="te same pliki md"
            lead="Na zajęciach przykłady w Claude Code. Pozostałe narzędzia konfiguruje się podobnie: inne nazwy plików i folderów, ta sama idea."
          />
          <Reveal delay={0.2} className="mt-10">
            <Panel className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <thead className="font-mono text-xs text-fg-subtle">
                  <tr className="border-b border-[var(--line)]">
                    {["narzędzie", "gdzie działa", "instrukcje projektu", "skille"].map((h) => (
                      <th key={h} className="px-4 py-3 font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TOOLS.map((t) => (
                    <tr key={t.name} className="border-b border-[var(--line)] last:border-0">
                      <td className="px-4 py-3 font-medium">
                        <span className="flex flex-wrap items-center gap-2">
                          {t.name} {t.main && <Badge tone="brand">na zajęciach</Badge>}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-fg-muted">{t.where}</td>
                      <td className="px-4 py-3 font-mono text-xs text-fg-muted">{t.file}</td>
                      <td className="px-4 py-3 font-mono text-xs text-fg-muted">{t.skills}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          </Reveal>
          <Reveal delay={0.35} className="mt-6">
            <Callout>
              Format <code>SKILL.md</code> (frontmatter <code>name</code> + <code>description</code>, treść w Markdown) jest wspólny dla wszystkich czterech. Skill napisany dla Claude Code działa w Copilocie bez zmian, w Codexie i Antigravity po przeniesieniu do <code>.agents/skills/</code>.
            </Callout>
          </Reveal>
        </Slide>

        {/* ---------- Własny harness ---------- */}
        <Slide id="wlasny-harness">
          <SectionHeading
            eyebrow="03 · Własny harness"
            accent="Własny harness"
            title="wokół modelu"
            lead="LangChain jak na zajęciach 3: narzędzia z dekoratorem @tool, model z init_chat_model (inny dostawca to inny napis) i pętla, którą widać w całości. Model nie ma dostępu do dysku: w odpowiedzi zwraca tool_calls, harness wykonuje narzędzie, sprawdza ścieżkę i odsyła wynik jako ToolMessage."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <Reveal delay={0.1}>
              <CodeBlock code={S.harnessMinimal} title="cwiczenia/harness_minimal.py" highlight={[8, 29, 35, 38, 43, 47]} />
            </Reveal>
            <div className="space-y-4">
              <Reveal delay={0.25}>
                <Terminal output={S.harnessMinimalOutput} title="gpt-5.4-mini · harness_minimal.py" />
              </Reveal>
              <Reveal delay={0.4}>
                <Callout>
                  Pełniejsza wersja w <code>harness.py</code> czyta <code>AGENTS.md</code> i opisy skilli na starcie, a treść skilla ładuje narzędziem <code>load_skill</code>. Na niej, obok Claude Code, powstały przebiegi z dalszych slajdów.
                </Callout>
              </Reveal>
            </div>
          </div>
        </Slide>

        {/* ---------- Pętla ---------- */}
        <Slide id="petla">
          <SectionHeading
            eyebrow="04 · Pętla agenta"
            accent="Pętla agenta"
            title="w większym projekcie"
            lead="To samo zadanie w API wypożyczalni (51 plików, własne konwencje, mylące stare notatki), Claude Code z modelem Sonnet: bez konfiguracji i z AGENTS.md (mapa projektu, konwencje) oraz skillem new-endpoint. Lista to kolejne wywołania narzędzi. Po jednym przebiegu."
          />
          <Reveal delay={0.2} className="mt-10">
            <AgentLoopCompareViz />
          </Reveal>
        </Slide>

        {/* ---------- Pliki md ---------- */}
        <Slide id="pliki-md">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <SectionHeading
                eyebrow="05 · Pliki md"
                accent="Pliki md"
                title="są interfejsem do agenta"
                lead="Prompt znika po sesji. Plik w repo agent czyta przy każdym zadaniu, jest w git, wspólny dla zespołu i dla różnych narzędzi. Markdown przyjął się, bo łatwo go pisać i czytać: człowiek widzi to samo co model, bez specjalnego formatu i narzędzi."
              />
              <Reveal delay={0.3} className="mt-8">
                <Callout kind="warning">Vibe coding bez tych plików daje kod, którego nikt nie sprawdził według żadnych reguł. Dobrze skonfigurowany agent pracuje według reguł specjalistów z zespołu, a proces da się powtórzyć i ocenić.</Callout>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <Panel className="divide-y divide-[var(--line)]">
                {MD_FILES.map((m) => (
                  <div key={m.file} className="grid gap-1 px-5 py-3">
                    <span className="font-mono text-sm break-all text-brand-300">{m.file}</span>
                    <span className="text-sm text-fg-muted">{m.role}</span>
                  </div>
                ))}
              </Panel>
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Kontekst ---------- */}
        <Slide id="kontekst">
          <SectionHeading
            eyebrow="06 · Kontekst"
            accent="Skill wchodzi do kontekstu,"
            title="gdy jest potrzebny"
            lead="Na starcie sesji Claude Code wczytuje CLAUDE.md i same opisy skilli. Pełny SKILL.md, DESIGN.md i references trafiają do kontekstu dopiero wtedy, gdy zadanie pasuje do opisu. Liczby z repo tego kursu."
          />
          <Reveal delay={0.2} className="mt-10">
            <ContextBuildViz />
          </Reveal>
        </Slide>

        {/* ---------- Pojęcia ---------- */}
        <Slide id="pojecia">
          <SectionHeading
            eyebrow="07 · Elementy konfiguracji"
            accent="Skill, subagent, hook, plugin:"
            title="co jest czym"
            lead="Harness z pierwszego slajdu konfiguruje się plikami. Część z nich czyta model (instrukcje, skille), część tylko harness (uprawnienia, hooki). Różnią się też tym, kiedy działają."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
            <Reveal delay={0.1}>
              <Panel className="divide-y divide-[var(--line)]">
                {DEFS.map((d) => (
                  <div key={d.name} className="grid gap-1 px-5 py-3 sm:grid-cols-[8.5rem_1fr] sm:gap-4">
                    <span className="font-mono text-sm text-brand-300">{d.name}</span>
                    <span className="text-sm">
                      {d.what} <span className="text-fg-muted">Działa: {d.when}.</span>
                    </span>
                  </div>
                ))}
              </Panel>
            </Reveal>
            <Reveal delay={0.2} className="space-y-4">
              <Panel className="p-5">
                <p className="font-medium">Skill to folder, nie plik</p>
                <ul className="mt-3 space-y-1.5 font-mono text-sm">
                  {SKILL_DIR.map((f) => (
                    <li key={f.path} style={{ paddingLeft: `${f.depth * 1.1}rem` }}>
                      <span className={f.path.endsWith("/") ? "text-fg-subtle" : "text-fg"}>{f.path}</span>
                      {f.note && <span className="block font-sans text-sm text-fg-muted">{f.note}</span>}
                    </li>
                  ))}
                </ul>
              </Panel>
              <Callout>
                Wywołanie: agent sam, gdy zadanie pasuje do opisu, albo ręcznie: <code>/secure-api</code>, a dla skilla z pluginu <code>/plugin:skill</code>.
              </Callout>
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Folder .claude ---------- */}
        <Slide id="folder">
          <SectionHeading
            eyebrow="08 · Folder .claude"
            accent="Co Claude Code czyta"
            title="i kiedy"
            lead="Dwa miejsca obok siebie: katalog domowy (~/.claude, ustawienia dla wszystkich projektów i zainstalowane pluginy) oraz folder projektu (.claude/ w repo, wspólny dla zespołu). Kolor kropki: kiedy plik trafia do kontekstu. Kliknięcie pokazuje treść."
          />
          <Reveal delay={0.2} className="mt-10">
            <ClaudeTreeViz nodes={TREE_WITH_FILES} />
          </Reveal>
        </Slide>

        {/* ---------- Subagenci i hooki ---------- */}
        <Slide id="subagenci">
          <SectionHeading
            eyebrow="09 · Subagenci i hooki"
            accent="Subagent chroni kontekst,"
            title="hook wymusza regułę"
            lead="Subagent wykonuje zadanie poboczne we własnym kontekście i zwraca tylko podsumowanie; kilku może pracować równolegle. Hook to skrypt, który harness uruchamia przy zdarzeniu (np. po edycji pliku) niezależnie od decyzji modelu."
          />
          <Reveal delay={0.2} className="mt-10">
            <SubagentHookViz />
          </Reveal>
        </Slide>

        {/* ---------- Plugin ---------- */}
        <Slide id="plugin">
          <SectionHeading
            eyebrow="10 · Pluginy"
            accent="Marketplace, plugin,"
            title="skill w nowej sesji"
            lead="Plugin z repo kursu krok po kroku: dodanie marketplace, instalacja pluginu, wybór zakresu i użycie skilla. Marketplace w repo: 06-agentic-coding/cwiczenia/plugin."
          />
          <Reveal delay={0.2} className="mt-10">
            <PluginInstallViz />
          </Reveal>
        </Slide>

        {/* ---------- Repo kursu ---------- */}
        <Slide id="repo-kursu">
          <SectionHeading
            eyebrow="11 · Przykład"
            accent="Repozytorium kursu"
            title="powstało z agentem"
            lead="Materiały kursu, w tym ta strona, są pisane z Claude Code. CLAUDE.md jest krótki i odsyła do skilli; skill web-ui ma w kontekście od startu tylko trzy linie opisu."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <CodeBlock code={S.repoClaudeRules} lang="markdown" title=".claude/CLAUDE.md · Rules" />
            </Reveal>
            <div className="space-y-4">
              <Reveal delay={0.2}>
                <CodeBlock code={S.webUiFront} lang="yaml" title=".claude/skills/web-ui/SKILL.md (frontmatter)" />
              </Reveal>
              <Reveal delay={0.35}>
                <Panel className="space-y-3 p-5 text-sm">
                  <p className="font-medium">Skąd biorą się skille</p>
                  <ul className="list-disc space-y-2 pl-5 text-fg-muted">
                    <li>Agent drugi raz popełnia ten sam błąd: reguła do CLAUDE.md albo do skilla.</li>
                    <li>Na koniec sesji, w której coś zbudowaliśmy: prośba do agenta o nowy skill z tej procedury albo o uzupełnienie istniejącego.</li>
                    <li>Raz na jakiś czas: agent czyta historię promptów wysłanych do Claude Code i szuka powtarzalnych poleceń i poprawek; z nich powstają skille.</li>
                  </ul>
                </Panel>
              </Reveal>
            </div>
          </div>
        </Slide>

        {/* ---------- Design system ---------- */}
        <Slide id="design">
          <SectionHeading
            eyebrow="12 · Design system"
            accent="Design system:"
            title="interfejs budowany z gotowych bloków"
            lead="Agent bez design systemu przy każdym ekranie wymyśla kolory, odstępy i komponenty od nowa; wychodzi typowy wygląd „z AI” (AI slop). Design system buduje interfejs od najmniejszych elementów w górę, a agent tylko je składa."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <Panel className="divide-y divide-[var(--line)]">
                {ATOMIC.map((a, i) => (
                  <div key={a.level} className="grid gap-1 px-5 py-3 sm:grid-cols-[7.5rem_1fr] sm:gap-4">
                    <span className="font-medium">
                      <span className="mr-2 font-mono text-xs text-brand-300">{i}</span>
                      {a.level}
                    </span>
                    <span className="text-sm">
                      {a.ex}
                      <span className="block font-mono text-xs text-fg-muted">{a.repo}</span>
                    </span>
                  </div>
                ))}
              </Panel>
              <p className="mt-2 font-mono text-xs text-fg-subtle">atomic design (Brad Frost); przykłady z kodu tej strony</p>
            </Reveal>
            <Reveal delay={0.2} className="space-y-4">
              <Panel className="p-5">
                <p className="font-medium">
                  DESIGN.md: format od Google (<a className={link} href="https://github.com/google-labs-code/design.md">google-labs-code/design.md</a>)
                </p>
                <dl className="mt-3 space-y-2 text-sm">
                  {DESIGN_MD.map((d) => (
                    <div key={d.part} className="grid gap-x-4 sm:grid-cols-[10.5rem_1fr]">
                      <dt className="font-mono text-brand-300">{d.part}</dt>
                      <dd className="text-fg-muted">{d.text}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
              <Panel className="space-y-2 p-5 text-sm">
                <p>
                  W CLAUDE.md jedna linia: <code>Visual changes: tokens and rules from DESIGN.md</code>. Pilnują tego skrypty: <code>npm run design:lint</code> sprawdza format i kontrast kolorów (WCAG), <code>check-design-tokens.mjs</code> przed buildem porównuje DESIGN.md z CSS i zatrzymuje build przy nowym kolorze.
                </p>
                <p className="text-fg-muted">
                  Gotowe skille przeciw „AI slop”, np. <a className={link} href="https://github.com/anthropics/claude-code/tree/main/plugins/frontend-design">frontend-design</a> od Anthropic.
                </p>
              </Panel>
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Vibe coding ---------- */}
        <Slide id="vibe">
          <SectionHeading
            eyebrow="13 · Vibe coding"
            accent="Działa"
            title="to jeszcze nie znaczy poprawnie"
            lead="Przykładowa aplikacja na dziś: API z logowaniem, zadaniami, punktami i rankingiem, napisane jednym promptem. Uruchamia się i odpowiada. Nie ma jednak zabezpieczeń, które musi mieć kod wychodzący na produkcję. Skrypt atak.py próbuje każdej luki naprawdę."
          />
          <Reveal delay={0.2} className="mt-10">
            <VulnMapViz />
          </Reveal>
        </Slide>

        {/* ---------- Drabina konfiguracji ---------- */}
        <Slide id="drabina">
          <SectionHeading
            eyebrow="14 · Konfiguracja a luki"
            accent="Ten sam prompt,"
            title="coraz więcej konfiguracji"
            lead="Aplikacja z poprzedniego slajdu pisana od zera, po jednym przebiegu na poziom. Każdy poziom dokłada jedną rzecz do poprzedniego. Po przebiegu atak.py (agent go nie widzi) i testy, które agent sam napisał; brak testów liczony osobno. Kliknięcie komórki pokazuje szczegóły przebiegu."
          />
          <Reveal delay={0.2} className="mt-10">
            <ConfigLadderViz />
          </Reveal>
        </Slide>

        {/* ---------- Agent widzi test ---------- */}
        <Slide id="test">
          <SectionHeading
            eyebrow="15 · Ukryte testy"
            accent="Nie pokazuj agentowi testów,"
            title="którymi go oceniasz"
            lead="We wcześniejszej wersji eksperymentu atak.py leżał w katalogu roboczym. Agent sam go uruchomił, przeczytał, które ataki są sprawdzane, i poprawiał kod pod nie. Wynik testu przestał mierzyć bezpieczeństwo, a zaczął mierzyć dopasowanie do testu."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <Terminal
                title="harness.py · gpt-5.4-mini · z AGENTS.md i skillami"
                output={`→ run(command='python atak.py')\n${(testSaw?.result ?? "").split("\n").slice(0, 6).join("\n")}\n…`}
              />
            </Reveal>
            <Reveal delay={0.2} className="space-y-4">
              <Panel className="space-y-2 p-5 text-sm">
                <p className="font-medium">To samo w dużej skali</p>
                <p className="text-fg-muted">
                  Anthropic opisał, jak Claude Opus 4.6 w benchmarku BrowseComp rozpoznał, że jest testowany, znalazł w internecie zaszyfrowany klucz odpowiedzi i kod z hasłem do niego, po czym odszyfrował odpowiedzi.{" "}
                  <a className={link} href="https://www.anthropic.com/engineering/eval-awareness-browsecomp">
                    Eval awareness in BrowseComp
                  </a>
                </p>
              </Panel>
              <Panel className="space-y-2 p-5 text-sm">
                <p className="font-medium">Jak temu zapobiec</p>
                <ul className="list-disc space-y-1.5 pl-5 text-fg-muted">
                  <li>Testy oceniające trzymać poza katalogiem roboczym agenta i uruchamiać po przebiegu, jak w eksperymencie z poprzedniego slajdu.</li>
                  <li>
                    Albo zablokować je w <code>.claude/settings.json</code>: <code>{`"deny": ["Read(./atak.py)", "Bash(python atak.py*)"]`}</code>.
                  </li>
                  <li>Testy, które agent ma widzieć, opisują wymagania; ataki i testy akceptacyjne zostają ukryte.</li>
                </ul>
              </Panel>
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Jak pisać skill ---------- */}
        <Slide id="skill">
          <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.15fr]">
            <div>
              <SectionHeading
                eyebrow="16 · Jak pisać skill"
                accent="Skill przekazuje decyzję,"
                title="której agent sam nie podejmie"
                lead="Próg, kontrakt danych, kolejność kroków, reguła z wcześniejszego błędu. Nie „napisz endpoint”, bo to agent umie. Obok: skill z eksperymentu z pętlą agenta."
              />
              <Reveal delay={0.3} className="mt-8">
                <dl className="space-y-2 text-sm">
                  {SKILL_RULES.map((r) => (
                    <div key={r.k}>
                      <dt className="inline font-mono text-brand-300">{r.k}</dt>
                      <dd className="inline text-fg-muted">: {r.v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
              <Reveal delay={0.4} className="mt-6">
                <Panel className="space-y-1.5 p-5 text-sm">
                  <p className="font-medium">Do przeczytania</p>
                  <p>
                    <a className={link} href="https://code.claude.com/docs/en/skills">Dokumentacja skilli Claude Code</a>
                    <span className="text-fg-muted">: format, pola nagłówka, pliki obok</span>
                  </p>
                  <p>
                    <a className={link} href="https://github.com/anthropics/skills">anthropics/skills</a>
                    <span className="text-fg-muted">: przykładowe skille, w tym skill-creator do pisania skilli</span>
                  </p>
                  <p>
                    <a className={link} href="https://github.com/walkinglabs/learn-harness-engineering">walkinglabs/learn-harness-engineering</a>
                    <span className="text-fg-muted">: kurs harness engineering z projektami dla Claude Code i Codexa</span>
                  </p>
                </Panel>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <CodeBlock code={S.newEndpointSkill} lang="markdown" title=".claude/skills/new-endpoint/SKILL.md" />
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Skillathon ---------- */}
        <Slide id="skillathon">
          <SectionHeading
            eyebrow="17 · Przygotowanie do skillathonu"
            accent="Skillathon:"
            title="skille zespołu, agent buduje aplikację"
            lead="Na zajęciach 7 zespoły piszą skille do tematu podanego na początku zajęć, składają je w plugin, a agent kodujący buduje z nim aplikację w Next.js. Oceniane są tylko skille; aplikacja służy do ich sprawdzenia."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1} className="space-y-4">
              <Panel className="p-5">
                <p className="font-medium">Przebieg zajęć 7 (90 minut)</p>
                <ol className="mt-3 space-y-2 text-sm">
                  <li><span className="font-mono text-brand-300">10 min</span> <span className="text-fg-muted">temat aplikacji i sugerowane skille (nieobowiązkowe)</span></li>
                  <li><span className="font-mono text-brand-300">ok. 60 min</span> <span className="text-fg-muted">każda osoba pisze co najmniej jeden skill; zespół składa je w plugin (może w tym pomóc agent: nowa sesja, wszystkie skille w folderze, prośba o plugin i propozycje hooków); jedna osoba uruchamia agenta, który buduje aplikację w Next.js. Na kodowanie przez agenta zostawić 25–30 minut.</span></li>
                  <li><span className="font-mono text-brand-300">ok. 20 min</span> <span className="text-fg-muted">prezentacje, do 5 minut na zespół: aplikacja i po jednym zdaniu o każdym skillu</span></li>
                </ol>
              </Panel>
              <Panel className="p-5 text-sm">
                <p className="font-medium">Oddanie na koniec zajęć</p>
                <p className="mt-2 text-fg-muted">
                  Mail z tytułem <span className="font-mono text-fg">[TEG] skillathon</span> od jednej osoby, pozostali członkowie zespołu w DW (jak zgłoszenie zespołu projektowego). W zipie folder konfiguracji agenta (<code>.claude/</code>, <code>.agents/</code>, <code>.github/</code>, <code>.cursor/</code>…) ze skillami lub pluginem i plikiem instrukcji oraz zrzuty ekranu aplikacji z demo. Bez kodu źródłowego aplikacji.
                </p>
              </Panel>
            </Reveal>
            <Reveal delay={0.2} className="space-y-4">
              <Panel className="p-5">
                <p className="font-medium">Do zrobienia przed zajęciami 7</p>
                <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-fg-muted">
                  <li>Zespół 3–4 osoby; nie musi być taki sam jak zespół projektowy.</li>
                  <li>W zespole co najmniej jedna osoba z działającym agentem kodującym: sprawdzone, że startuje w pustym folderze i czyta plik instrukcji.</li>
                  <li>Przeczytane materiały o pisaniu skilli z poprzedniego slajdu.</li>
                </ul>
                <p className="mt-4 font-mono text-xs text-fg-subtle">agenci z darmowym dostępem lub dostępem dla studentów</p>
                <dl className="mt-2 space-y-1.5 text-sm">
                  {FREE_AGENTS.map((a) => (
                    <div key={a.name}>
                      <dt className="inline font-medium">{a.name}</dt>
                      <dd className="inline text-fg-muted">: {a.note}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
              <Callout>Nieobecni na zajęciach 7 dostają na kanale Teams inny temat i oddają co najmniej 4 skille samodzielnie przed zajęciami 8, przy każdym jedno–dwa zdania o tym, jaką decyzję przekazuje agentowi.</Callout>
            </Reveal>
          </div>
        </Slide>

        {/* ---------- Zadanie ---------- */}
        <Slide id="zadanie">
          <SectionHeading
            eyebrow="18 · Zadanie"
            accent="Skill security-review"
            title="i dwa przebiegi agenta"
            lead="Skill, który po skończonej pracy nad funkcją przegląda kod pod kątem luk z dzisiejszych zajęć (i innych, które znajdziesz). Ta sama prosta aplikacja sklepu wygenerowana dwa razy dowolnym agentem: bez skilla i ze skillem."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <Reveal delay={0.1} className="h-full">
              <Panel className="h-full p-5">
                <p className="font-medium">Zawartość zipa</p>
                <ul className="mt-3 space-y-2 font-mono text-sm">
                  <li>security-review/ <span className="block font-sans text-fg-muted">SKILL.md i opcjonalnie references/, scripts/</span></li>
                  <li>bez-skilla/ <span className="block font-sans text-fg-muted">pliki aplikacji z przebiegu bez skilla</span></li>
                  <li>ze-skillem/ <span className="block font-sans text-fg-muted">pliki aplikacji z przebiegu ze skillem</span></li>
                  <li>README.md <span className="block font-sans text-fg-muted">narzędzie i model, różnice (luki, testy, tokeny lub koszt), czy agent użył skilla</span></li>
                </ul>
              </Panel>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              <EndCard delay={0.2} icon={<SquarePen className="size-5" />} title="Treść zadania" text="Prompt aplikacji sklepu, wymagania wobec skilla, struktura zipa." href={`${GH_BLOB}/zadanie.md`} badge="Zadanie" />
              <EndCard delay={0.3} icon={<BookOpenText className="size-5" />} title="Materiały z zajęć" text="harness.py, przykładowa konfiguracja .claude/, plugin i marketplace." href={`${GH}/cwiczenia`} />
              <EndCard delay={0.4} icon={<GraduationCap className="size-5" />} title="Harness engineering" text="Kurs walkinglabs/learn-harness-engineering." href="https://github.com/walkinglabs/learn-harness-engineering" />
              <EndCard delay={0.5} icon={<ExternalLink className="size-5" />} title="Skille w Claude Code" text="Dokumentacja: format, wywołanie, pliki obok." href="https://code.claude.com/docs/en/skills" />
            </div>
          </div>
          <Reveal delay={0.6} className="mt-6">
            <Panel className="flex flex-wrap items-center gap-x-6 gap-y-2 p-5">
              <span className="flex items-center gap-2 text-sm text-brand-300">
                <Mail className="size-4" /> Oddanie mailem
              </span>
              <span className="font-mono">[TEG] lab-06</span>
              <span className="text-sm text-fg-muted">zip z czterema elementami, bez kluczy API, przed zajęciami 7</span>
            </Panel>
          </Reveal>
        </Slide>
      </main>
    </>
  );
}

function EndCard(props: { delay: number; icon: React.ReactNode; title: string; text: string; href: string; badge?: string }) {
  return (
    <Reveal delay={props.delay} className="h-full">
      <a href={props.href} className="block h-full">
        <Panel className="h-full p-5 transition-colors hover:border-brand-400 hover:bg-[var(--panel-hi)]">
          <div className="flex items-center justify-between text-brand-300">
            {props.icon}
            {props.badge && <Badge tone="focus">{props.badge}</Badge>}
          </div>
          <p className="mt-3 font-medium">{props.title}</p>
          <p className="mt-1 text-sm text-fg-muted">{props.text}</p>
        </Panel>
      </a>
    </Reveal>
  );
}
