# Zajęcia 6: Agentic coding

- **Prezentacja:** https://adrianstando.github.io/2026Z-PJATK-TEG/zajecia/06-agentic-coding/
- **Zadanie:** [zadanie.md](zadanie.md)
- **Materiały z prezentacji:** [cwiczenia/](cwiczenia/README.md)

## Zakres

- agent = model + harness: pętla, narzędzia, kontekst, skille, uprawnienia i hooki, subagenci, pamięć, autokompakcja,
- Claude Code (główne przykłady), Codex, GitHub Copilot, Antigravity: gdzie czytają instrukcje i skille,
- własny harness w LangChain (`cwiczenia/harness_minimal.py`, `cwiczenia/harness.py`),
- pliki md jako interfejs do agenta: `CLAUDE.md`, `AGENTS.md`, `SKILL.md`, `DESIGN.md`; context engineering,
- skill, rule, subagent, hook, `settings.json`, plugin, marketplace; folder `.claude/` w katalogu domowym i w projekcie,
- design system: atomic design, `DESIGN.md` w formacie Google, skrypty pilnujące tokenów,
- dlaczego vibe coding to nie programowanie: luki w aplikacji napisanej jednym promptem i wpływ konfiguracji harnessu na ich liczbę,
- przygotowanie do [skillathonu](../07-skillathon/README.md).

## Przed zajęciami

- Działający agent kodujący: Claude Code, GitHub Copilot (plan Student, agent mode w VS Code albo Copilot CLI), Codex, Antigravity, Cursor albo OpenCode. Bez agenta: `cwiczenia/harness.py` z kluczem API z [00-dostep-do-llm](../00-dostep-do-llm/README.md) albo z modelem z Ollamy.
- `pip install -r requirements.txt` (FastAPI, PyJWT, pytest, LangChain).

## Zadanie

[zadanie.md](zadanie.md): skill `security-review` i dwa przebiegi agenta kodującego (bez skilla i ze skillem) na tej samej aplikacji sklepu. Oddanie mailem z tematem `[TEG] lab-06`: zip ze skillem, dwoma folderami aplikacji i README, przed zajęciami 7.

## Uwagi do materiałów

- Przebiegi na slajdach „Pętla agenta” i „Konfiguracja a luki” pochodzą z `web/scripts/lesson06_experiments.py`: `cwiczenia/harness.py` z modelem `gpt-5.4-mini` oraz Claude Code przez Claude Agent SDK (subskrypcja zalogowanego CLI). Po jednym przebiegu na wariant; inny przebieg, model albo wersja narzędzia da inne liczby.
- Dane do pozostałych wizualizacji: `web/scripts/lesson06_data.py`.
