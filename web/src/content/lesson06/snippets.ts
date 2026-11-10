// Kod i wyniki na prezentacji zajęć 6. Pliki czytane z repo w czasie builda,
// więc slajd pokazuje dokładnie to, co jest w 06-agentic-coding/cwiczenia i w .claude/.
import { read } from "./files";

const EX = "06-agentic-coding/cwiczenia";

/** harness_minimal.py bez docstringu i importów: narzędzia z @tool, model z init_chat_model, pętla. */
export const harnessMinimal = read(`${EX}/harness_minimal.py`).split('ROOT = pathlib.Path(sys.argv[1]).resolve()\n\n\n')[1]?.trim() ?? read(`${EX}/harness_minimal.py`);

/** Wynik: python harness_minimal.py <kopia app/> "Dopisz test_app.py z testem logowania (poprawne i złe hasło) i uruchom testy." (gpt-5.4-mini). */
export const harnessMinimalOutput = `→ read_file """Zadania: mini API do rozwiązywania zadań z punktacją i rankingiem.
→ write_file zapisano
→ run_tests ..                                                                       [100%]
Dodałem \`test_app.py\` z testem logowania dla:
- poprawnego hasła
- złego hasła

Uruchomiłem testy — wszystko przechodzi:
- \`2 passed\``;

/** .claude/CLAUDE.md repo kursu: sekcja Rules. */
const claudeMd = read(".claude/CLAUDE.md");
export const repoClaudeRules = claudeMd.slice(claudeMd.indexOf("## Rules"), claudeMd.indexOf("## Before handing")).trim();

/** Nagłówek SKILL.md skilla web-ui: tylko to jest w kontekście od startu. */
const webUi = read(".claude/skills/web-ui/SKILL.md");
export const webUiFront = webUi.slice(0, webUi.indexOf("---", 4) + 3);

/** Początek DESIGN.md: tokeny kolorów w YAML. */
const design = read(".claude/DESIGN.md");
export const designTokens = design.slice(0, design.indexOf("  cat-1:")).trim() + "\n  # …";
export const designDont = design.slice(design.indexOf("## Do's and Don'ts")).trim();

/** Prawdziwe wyniki web/scripts/check-design-tokens.mjs: repo i kopia z podmienionym kolorem hit w globals.css. */
export const tokensOk = "$ node scripts/check-design-tokens.mjs\n✓ tokeny: 25 kolorów zgodnych z DESIGN.md";
export const tokensFail = "$ node scripts/check-design-tokens.mjs   # agent wpisał --color-hit: #22c55e\n✗ DESIGN.md i globals.css się rozjechały:\n  hit: DESIGN.md #3ee0a4 ≠ globals.css #22c55e\n(exit 1: build przerwany)";

export const appHead = read(`${EX}/app/app.py`).split("\n").slice(0, 21).join("\n");
export const secureSkill = read(`${EX}/projekt-claude/.claude/skills/secure-api/SKILL.md`);

/** Skill z eksperymentu „pętla agenta” (API wypożyczalni): przykład dobrego skilla. */
export const newEndpointSkill = read(`${EX}/biblioteka/konfiguracja/.claude/skills/new-endpoint/SKILL.md`).trim();
