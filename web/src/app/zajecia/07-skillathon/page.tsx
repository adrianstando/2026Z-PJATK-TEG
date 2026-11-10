import type { Metadata } from "next";
import { Award, BookOpenText, Bot, FolderCog, Images, Mail, Puzzle, Users } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { Slide } from "@/components/site/Slide";
import { HeroTitle } from "@/components/lesson/HeroTitle";
import { SectionHeading } from "@/components/molecules/SectionHeading";
import { CodeBlock } from "@/components/molecules/CodeBlock";
import { Callout } from "@/components/molecules/Callout";
import { Reveal } from "@/components/motion/Reveal";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { REPO_URL } from "@/lib/paths";
import { SkillathonTimer, type Phase } from "@/components/viz/SkillathonTimer";
import { SkillAnatomy } from "@/components/viz/SkillAnatomy";
import { EncryptedBrief } from "@/components/viz/EncryptedBrief";
import temat from "@/content/lesson07/temat-zajecia.enc.json";
import tematNieobecni from "@/content/lesson07/temat-nieobecni.enc.json";

export const metadata: Metadata = { title: "Zajęcia 7 · Skillathon" };

const AGENDA = [
  { label: "Zasady", id: "zasady" },
  { label: "Anatomia skilla", id: "anatomia" },
  { label: "Przebieg 90 min", id: "przebieg" },
  { label: "Agent kodujący", id: "agent" },
  { label: "Plugin", id: "plugin" },
  { label: "Temat", id: "temat" },
  { label: "Oddanie", id: "oddanie" },
  { label: "Nieobecni", id: "nieobecni" },
];

const RULES = [
  { icon: Users, title: "3–4 osoby", text: "Każda osoba pisze co najmniej jeden skill. Wystarczy czat w przeglądarce, np. darmowy Gemini albo ChatGPT." },
  { icon: Puzzle, title: "Jeden plugin", text: "Jedna osoba zbiera skille i składa z nich plugin albo układa je w folderze konfiguracji agenta." },
  { icon: Bot, title: "Agent buduje aplikację", text: "Jedna osoba uruchamia agenta kodującego wybranego przez zespół. Aplikacja w Next.js." },
  { icon: Award, title: "Oceniane są skille", text: "Aplikacja służy do ich sprawdzenia. To, czy powstała i jak działa, nie wpływa na ocenę." },
];

const PHASES: Phase[] = [
  { from: 0, to: 10, title: "Wstęp i temat", output: "wybrany temat, podział skilli w zespole" },
  { from: 10, to: 35, title: "Każda osoba pisze swój skill", output: "co najmniej jeden SKILL.md na osobę" },
  { from: 35, to: 40, title: "Plugin", output: "skille w jednym pluginie albo folderze agenta" },
  { from: 40, to: 70, title: "Agent koduje aplikację", output: "reszta zespołu poprawia skille po tym, co robi agent" },
  { from: 70, to: 90, title: "Prezentacje", output: "do 5 minut na zespół: aplikacja i jedno zdanie o każdym skillu" },
];

const FREE_AGENTS = [
  { name: "GitHub Copilot", note: "Copilot Student bezpłatnie po weryfikacji w GitHub Education; agent mode w VS Code i Copilot CLI" },
  { name: "Codex", note: "konto ChatGPT, także w planie Free, z limitami" },
  { name: "Antigravity", note: "darmowy plan indywidualny z tygodniowym limitem agenta" },
  { name: "Cursor", note: "plan Hobby z limitem zapytań agenta" },
  { name: "OpenCode", note: "otwarty agent w terminalu; darmowe modele (OpenCode Zen, OpenRouter) albo własny klucz" },
  { name: "Claude Code", note: "plan Pro albo klucz API; darmowy plan go nie obejmuje" },
];

const SKILL_DIRS = [
  { tool: "Claude Code", dir: ".claude/skills/", plugin: "plugin z .claude-plugin/plugin.json" },
  { tool: "Codex, Antigravity", dir: ".agents/skills/", plugin: "folder skilli + AGENTS.md" },
  { tool: "GitHub Copilot", dir: ".github/skills/ (czyta też .claude/skills/)", plugin: "folder skilli + AGENTS.md" },
  { tool: "Cursor", dir: ".cursor/skills/ (czyta też .claude/skills/)", plugin: "folder skilli + AGENTS.md" },
];

const PLUGIN_TREE = `teg-zespol/
├── .claude-plugin/
│   └── plugin.json        nazwa, opis, wersja
├── skills/
│   ├── zewnetrzne-api/SKILL.md
│   ├── mobile-i-pwa/SKILL.md
│   └── testy/SKILL.md
├── hooks/hooks.json       opcjonalnie
└── agents/                opcjonalnie: subagenci`;

const PLUGIN_PROMPT = `W skills/ są skille członków zespołu.
Złóż z nich plugin Claude Code (.claude-plugin/plugin.json).
Sprawdź, czy description się nie nakładają i czy reguły
nie są sprzeczne; sprzeczności wypisz, nie rozstrzygaj sam.
Zaproponuj hooki, które pilnują reguł ze skilli.`;

const PLUGIN_RUN = `claude plugin validate ./teg-zespol
claude --plugin-dir ./teg-zespol`;

const TUNNEL = `npx cloudflared tunnel --url http://localhost:3000   # bez konta
ngrok http 3000                                     # darmowe konto`;

export default function Lesson07() {
  return (
    <>
      <SiteNav />
      <main>
        <Slide id="start">
          <HeroTitle
            eyebrow="Zajęcia 7 z 8"
            lines={["Skillathon"]}
            accentLine={0}
            lead="Zespoły po 3–4 osoby piszą skille dla agenta kodującego i składają je w plugin. Agent buduje z nimi aplikację w Next.js. Temat na początku zajęć."
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

        <Slide id="zasady">
          <SectionHeading
            eyebrow="01 · Zasady"
            accent="Skille"
            title="zespołu, aplikacja do ich sprawdzenia"
            lead="Skill przekazuje agentowi decyzje, których sam nie podejmie. Aplikacja zbudowana przez agenta pokazuje, czy skille prowadzą go w dobrą stronę."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RULES.map((r, i) => (
              <Reveal key={r.title} delay={0.1 + i * 0.08} className="h-full">
                <Panel className="h-full p-6">
                  <r.icon className="size-5 text-brand-300" />
                  <p className="mt-4 text-lg font-medium">{r.title}</p>
                  <p className="mt-1 text-sm text-fg-muted">{r.text}</p>
                </Panel>
              </Reveal>
            ))}
          </div>
        </Slide>

        <Slide id="anatomia">
          <SectionHeading
            eyebrow="02 · Anatomia skilla"
            accent="SKILL.md:"
            title="opis decyduje, treść prowadzi"
            lead="Skill to folder z plikiem SKILL.md. Agent zna na starcie tylko nazwę i opis; resztę wczytuje, gdy zadanie pasuje do opisu."
          />
          <Reveal delay={0.2} className="mt-12">
            <SkillAnatomy />
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <Button asChild>
              <a href={`${REPO_URL}/tree/main/07-skillathon#poradnik-pisania-skilli`}>
                <BookOpenText className="size-4" /> Poradnik pisania skilli
              </a>
            </Button>
          </Reveal>
        </Slide>

        <Slide id="przebieg">
          <SectionHeading
            eyebrow="03 · Przebieg"
            accent="90 minut"
            title="w pięciu fazach"
            lead="Licznik pokazuje bieżącą fazę i czas do jej końca; ostatnie dwie minuty fazy na żółto. Czasy są sugestią."
          />
          <Reveal delay={0.2} className="mt-12">
            <SkillathonTimer phases={PHASES} />
          </Reveal>
        </Slide>

        <Slide id="agent">
          <SectionHeading
            eyebrow="04 · Agent kodujący"
            accent="Dowolny agent,"
            title="ten sam format skilli"
            lead="Zespół wybiera agenta sam. Format SKILL.md jest wspólny; narzędzia różnią się tylko folderem, z którego czytają skille."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1} className="h-full">
              <Panel className="h-full p-6">
                <p className="font-medium">Darmowy dostęp lub dostęp dla studentów</p>
                <dl className="mt-4 space-y-2.5">
                  {FREE_AGENTS.map((a) => (
                    <div key={a.name}>
                      <dt className="inline font-medium">{a.name}</dt>
                      <dd className="inline text-fg-muted">: {a.note}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            </Reveal>
            <Reveal delay={0.2} className="h-full">
              <Panel className="h-full p-6">
                <p className="font-medium">Gdzie leżą skille</p>
                <dl className="mt-4 space-y-4">
                  {SKILL_DIRS.map((d) => (
                    <div key={d.tool}>
                      <dt className="font-medium">{d.tool}</dt>
                      <dd className="mt-0.5 font-mono text-sm text-brand-300">{d.dir}</dd>
                      <dd className="text-sm text-fg-muted">{d.plugin}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            </Reveal>
          </div>
        </Slide>

        <Slide id="plugin">
          <SectionHeading
            eyebrow="05 · Plugin"
            accent="Skille zespołu"
            title="w jednym pluginie"
            lead="Każda osoba przekazuje swój folder ze SKILL.md jednej osobie, która składa z nich plugin. Może to zrobić agent w nowej sesji: dostaje wszystkie skille i prośbę o plugin."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1}>
              <CodeBlock code={PLUGIN_TREE} lang="text" title="plugin Claude Code" />
            </Reveal>
            <Reveal delay={0.2} className="space-y-6">
              <CodeBlock code={PLUGIN_PROMPT} lang="text" title="prompt dla agenta" />
              <CodeBlock code={PLUGIN_RUN} lang="bash" title="sprawdzenie i uruchomienie" />
            </Reveal>
          </div>
          <Reveal delay={0.3} className="mt-6">
            <Callout>
              Hook uruchamia polecenie przy zdarzeniu harnessu, np. po każdej edycji pliku, niezależnie od tego, czy model pamięta regułę. W narzędziach bez pluginów skille trafiają do folderu z poprzedniego slajdu, a wspólne zasady do AGENTS.md.
            </Callout>
          </Reveal>
        </Slide>

        <Slide id="temat">
          <SectionHeading
            eyebrow="06 · Temat"
            accent="Dwa tematy"
            title="do wyboru"
            lead="Treść tematów i sugerowane skille odszyfrowuje hasło podane na zajęciach. Sugestie są nieobowiązkowe: zespół może napisać własne skille."
          />
          <Reveal delay={0.2} className="mt-12">
            <EncryptedBrief payload={temat} id="teg-skillathon-temat" />
          </Reveal>
          <Reveal delay={0.3} className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_1.2fr]">
            <Callout>
              Aplikację z laptopa można na chwilę wystawić pod publicznym linkiem i przetestować ze znajomymi. Są na to cztery sposoby:
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Codespaces: zakładka <em>Ports</em>, port 3000, widoczność <em>Public</em>;</li>
                <li>VS Code: <em>Dev Tunnels</em>;</li>
                <li>Cloudflare Tunnel, bez konta (polecenie obok);</li>
                <li>ngrok, z darmowym kontem (polecenie obok).</li>
              </ul>
              <p className="mt-2">Link działa dla każdego, kto go zna.</p>
            </Callout>
            <CodeBlock code={TUNNEL} lang="bash" title="publiczny link do localhost:3000" />
          </Reveal>
        </Slide>

        <Slide id="oddanie">
          <SectionHeading
            eyebrow="07 · Oddanie"
            accent="Mail"
            title="na koniec zajęć"
            lead="Wysyła jedna osoba, pozostali członkowie zespołu w DW (do wiadomości), jak przy zgłoszeniu zespołu projektowego."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.1} className="h-full">
              <Panel className="h-full p-6">
                <FolderCog className="size-5 text-brand-300" />
                <p className="mt-4 text-lg font-medium">Konfiguracja agenta</p>
                <p className="mt-1 text-fg-muted">
                  Folder <code>.claude/</code>, <code>.agents/</code>, <code>.github/</code> albo <code>.cursor/</code> ze skillami lub pluginem i plikiem instrukcji (<code>CLAUDE.md</code>, <code>AGENTS.md</code>).
                </p>
              </Panel>
            </Reveal>
            <Reveal delay={0.2} className="h-full">
              <Panel className="h-full p-6">
                <Images className="size-5 text-brand-300" />
                <p className="mt-4 text-lg font-medium">Zrzuty ekranu aplikacji</p>
                <p className="mt-1 text-fg-muted">Kilka zrzutów z demo: co agent zbudował ze skillami zespołu.</p>
              </Panel>
            </Reveal>
          </div>
          <Reveal delay={0.3} className="mt-6">
            <Panel className="flex flex-wrap items-center gap-x-6 gap-y-2 p-5">
              <span className="flex items-center gap-2 text-sm text-brand-300">
                <Mail className="size-4" /> Oddanie mailem
              </span>
              <span className="font-mono">[TEG] skillathon</span>
              <span className="text-sm text-fg-muted">konfiguracja agenta i zrzuty ekranu, bez kodu źródłowego aplikacji, na koniec zajęć 7</span>
            </Panel>
          </Reveal>
        </Slide>

        <Slide id="nieobecni">
          <SectionHeading
            eyebrow="08 · Nieobecni"
            accent="Inny temat,"
            title="praca samodzielna"
            lead="Osoby nieobecne na zajęciach 7 dostają hasło na kanale Teams i oddają skille mailem przed zajęciami 8."
          />
          <Reveal delay={0.2} className="mt-12">
            <EncryptedBrief payload={tematNieobecni} id="teg-skillathon-nieobecni" hint="Hasło podane na kanale Teams po zajęciach 7." />
          </Reveal>
          <Reveal delay={0.3} className="mt-6">
            <Panel className="flex flex-wrap items-center gap-x-6 gap-y-2 p-5">
              <span className="flex items-center gap-2 text-sm text-brand-300">
                <Mail className="size-4" /> Oddanie mailem
              </span>
              <span className="font-mono">[TEG] skillathon</span>
              <span className="text-sm text-fg-muted">skille i opisy, bez kodu źródłowego aplikacji, przed zajęciami 8</span>
            </Panel>
          </Reveal>
        </Slide>
      </main>
    </>
  );
}
