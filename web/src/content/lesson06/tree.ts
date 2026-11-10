// Drzewo katalogów do slajdu „co Claude Code czyta i kiedy”. Pliki z `source` są czytane
// z repo w czasie builda (files.ts), więc podgląd na slajdzie = prawdziwa zawartość przykładu.
// Każdy folder jest osobnym wierszem, żeby było widać pełną strukturę drzewa.

export type When = "start" | "na żądanie" | "harness" | "subagent" | "instalacja" | "praca" | "zablokowany";

export type TreeNode = {
  path: string; // pełna ścieżka w drzewie, np. "~/projekty/zadania/.claude/settings.json"
  dir?: boolean;
  when?: When;
  desc?: string;
  source?: string; // ścieżka względem katalogu głównego repo
  inline?: string; // podgląd, gdy pliku nie ma w repo
};

const EX = "06-agentic-coding/cwiczenia";
const PC = `${EX}/projekt-claude/.claude`;
const PL = `${EX}/plugin`;
const H = "~/.claude";
const P = "~/projekty/zadania";
const M = `${H}/plugins/marketplaces/teg-plugins`;

export const TREE: TreeNode[] = [
  { path: "~", dir: true },
  { path: H, dir: true },
  { path: `${H}/CLAUDE.md`, when: "start", desc: "Osobiste instrukcje we wszystkich projektach na tym komputerze. Nie trafia do repo.", inline: "# Moje zasady\n\n- Odpowiedzi po polsku, kod i commity po angielsku.\n- Przed commitem: testy i lint.\n- Nie dodawaj zależności bez pytania." },
  { path: `${H}/settings.json`, when: "harness", desc: "Osobiste ustawienia harnessu: tu wyłączony podpis Claude w commitach i pull requestach (attribution) oraz włączony plugin z marketplace.", inline: '{\n  "attribution": { "commit": "", "pr": "" },\n  "enabledPlugins": { "secure-api-kit@teg-plugins": true }\n}' },
  { path: `${H}/plugins`, dir: true },
  { path: `${H}/plugins/marketplaces`, dir: true },
  { path: M, dir: true },
  { path: `${M}/.claude-plugin`, dir: true },
  { path: `${M}/.claude-plugin/marketplace.json`, when: "instalacja", desc: "Kopia marketplace po /plugin marketplace add: lista pluginów i skąd je pobrać.", source: `${PL}/.claude-plugin/marketplace.json` },
  { path: `${M}/secure-api-kit`, dir: true },
  { path: `${M}/secure-api-kit/.claude-plugin`, dir: true },
  { path: `${M}/secure-api-kit/.claude-plugin/plugin.json`, when: "instalacja", desc: "Manifest pluginu. Komponenty dostają przedrostek nazwy: /secure-api-kit:secure-api.", source: `${PL}/secure-api-kit/.claude-plugin/plugin.json` },
  { path: `${M}/secure-api-kit/skills`, dir: true },
  { path: `${M}/secure-api-kit/skills/secure-api`, dir: true },
  { path: `${M}/secure-api-kit/skills/secure-api/SKILL.md`, when: "na żądanie", desc: "Ten sam skill co w projekcie, ale z pluginu: działa w każdym repo, w którym plugin jest włączony.", source: `${PL}/secure-api-kit/skills/secure-api/SKILL.md` },
  { path: `${M}/secure-api-kit/agents`, dir: true },
  { path: `${M}/secure-api-kit/agents/security-reviewer.md`, when: "subagent", desc: "Subagent z pluginu: secure-api-kit:security-reviewer.", source: `${PL}/secure-api-kit/agents/security-reviewer.md` },
  { path: `${M}/secure-api-kit/hooks`, dir: true },
  { path: `${M}/secure-api-kit/hooks/hooks.json`, when: "harness", desc: "Hooki pluginu działają po jego włączeniu, tak jak hooki z settings.json projektu.", source: `${PL}/secure-api-kit/hooks/hooks.json` },
  { path: "~/projekty", dir: true },
  { path: P, dir: true },
  { path: `${P}/.claude`, dir: true },
  { path: `${P}/.claude/CLAUDE.md`, when: "start", desc: "Instrukcje projektu, wczytywane na starcie każdej sesji. Może leżeć w katalogu głównym albo w .claude/; w .claude/ katalog główny repo zostaje czysty.", source: `${PC}/CLAUDE.md` },
  { path: `${P}/.claude/settings.json`, when: "harness", desc: "Ustawienia zespołu, w git: uprawnienia (zakaz czytania i edycji .env, testy bez pytania) i hook po edycji. Model tego nie czyta; harness to wymusza.", source: `${PC}/settings.json` },
  { path: `${P}/.claude/settings.local.json`, when: "harness", desc: "Osobiste ustawienia w tym projekcie, poza git. Tu Claude Code zapisuje „Yes, and don't ask again”.", inline: '{\n  "permissions": {\n    "allow": ["Bash(uvicorn app:app *)"]\n  }\n}' },
  { path: `${P}/.claude/rules`, dir: true },
  { path: `${P}/.claude/rules/api.md`, when: "praca", desc: "Reguła z polem paths: wczytuje się dopiero wtedy, gdy agent czyta albo edytuje pasujący plik (app.py). Bez paths ładuje się na starcie jak CLAUDE.md.", source: `${PC}/rules/api.md` },
  { path: `${P}/.claude/skills`, dir: true },
  { path: `${P}/.claude/skills/secure-api`, dir: true },
  { path: `${P}/.claude/skills/secure-api/SKILL.md`, when: "na żądanie", desc: "Na starcie w kontekście jest tylko frontmatter (name, description). Całość wczytuje się, gdy zadanie pasuje do opisu albo po /secure-api.", source: `${PC}/skills/secure-api/SKILL.md` },
  { path: `${P}/.claude/skills/secure-api/references`, dir: true },
  { path: `${P}/.claude/skills/secure-api/references/owasp-api.md`, when: "na żądanie", desc: "Materiał czytany dopiero wtedy, gdy SKILL.md każe go otworzyć. Dzięki temu SKILL.md zostaje krótki.", source: `${PC}/skills/secure-api/references/owasp-api.md` },
  { path: `${P}/.claude/skills/secure-api/scripts`, dir: true },
  { path: `${P}/.claude/skills/secure-api/scripts/find_raw_sql.py`, when: "praca", desc: "Skrypt skilla: agent go uruchamia, do kontekstu trafia tylko wynik. Deterministyczne sprawdzenie zamiast instrukcji w prompcie.", source: `${PC}/skills/secure-api/scripts/find_raw_sql.py` },
  { path: `${P}/.claude/skills/api-tests`, dir: true },
  { path: `${P}/.claude/skills/api-tests/SKILL.md`, when: "na żądanie", desc: "Drugi skill: jak pisać testy. Osobny skill = osobna decyzja o wczytaniu.", source: `${PC}/skills/api-tests/SKILL.md` },
  { path: `${P}/.claude/agents`, dir: true },
  { path: `${P}/.claude/agents/security-reviewer.md`, when: "subagent", desc: "Subagent: opis jest znany od startu, treść to prompt systemowy osobnego kontekstu. Do głównej rozmowy wraca tylko jego podsumowanie.", source: `${PC}/agents/security-reviewer.md` },
  { path: `${P}/.claude/hooks`, dir: true },
  { path: `${P}/.claude/hooks/run-tests.sh`, when: "harness", desc: "Skrypt hooka z settings.json: po edycji pliku .py uruchamia testy. Kod wyjścia 2 = wynik wraca do modelu i agent musi naprawić testy.", source: `${PC}/hooks/run-tests.sh` },
  { path: `${P}/.mcp.json`, when: "start", desc: "Serwery MCP projektu (zajęcia 5). Musi leżeć w katalogu głównym, nie w .claude/. Definicje narzędzi trafiają do kontekstu jak narzędzia wbudowane.", inline: '{\n  "mcpServers": {\n    "neo4j": { "command": "uvx", "args": ["mcp-neo4j-cypher"] }\n  }\n}' },
  { path: `${P}/.env`, when: "zablokowany", desc: "Klucze i hasła. Reguły deny w settings.json blokują Read i Edit, więc agent nie zobaczy sekretów nawet wtedy, gdy o to poprosi.", inline: "SECRET_KEY=…\nOPENAI_API_KEY=…" },
  { path: `${P}/app.py`, when: "praca", desc: "Kod trafia do kontekstu dopiero wtedy, gdy agent go przeczyta narzędziem Read.", source: `${EX}/app/app.py` },
];
