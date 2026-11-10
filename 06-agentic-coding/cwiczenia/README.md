# Materiały z prezentacji

| Plik / folder | Co to jest |
|---|---|
| `harness_minimal.py` | najmniejszy harness w LangChain: pętla + `read_file`, `write_file`, `run_tests` |
| `harness.py` | pełniejszy harness: czyta `AGENTS.md`, opisy skilli, ładuje skill na żądanie (`load_skill`), zapisuje dziennik; `--model` przyjmuje dowolny model z `init_chat_model` |
| `app/app.py` | API „Zadania” napisane jednym promptem: logowanie, zadania, punkty, ranking; z lukami |
| `app/atak.py` | sprawdza znane ataki na `app.py` albo na inną aplikację o tym samym API (`python atak.py KATALOG`); `[LUKA]` = atak się udał |
| `projekt-claude/.claude/` | przykładowa konfiguracja Claude Code w projekcie: `CLAUDE.md`, `settings.json` (zakaz czytania `.env`, hook), `rules/`, skille z `references/` i `scripts/`, subagent, skrypt hooka |
| `plugin/` | marketplace `teg-plugins` z pluginem `secure-api-kit` (te same skille, subagent i hook) |
| `drabina/` | eksperyment „Konfiguracja a luki”: polecenie i kolejne poziomy konfiguracji |
| `biblioteka/` | eksperyment „Pętla agenta”: większe API wypożyczalni, konfiguracja i ukryte testy akceptacyjne |

## Harness

```bash
cp -r app /tmp/zadania && rm /tmp/zadania/atak.py
python harness_minimal.py /tmp/zadania "Dopisz test logowania i uruchom testy."
python harness.py --workdir /tmp/zadania --log przebieg.jsonl "Dodaj endpoint GET /me/submissions. Uruchom testy."
python harness.py --model ollama:qwen3 --workdir /tmp/zadania "..."
```

Agent zapisuje pliki i uruchamia polecenia w katalogu roboczym: pracować na kopii.

## Plugin

W sesji Claude Code w katalogu głównym repo kursu:

```text
/plugin marketplace add ./06-agentic-coding/cwiczenia/plugin
/plugin install secure-api-kit@teg-plugins
```

Sprawdzenie przed udostępnieniem:

```bash
claude plugin validate plugin
claude plugin validate plugin/secure-api-kit
```

## Eksperymenty ze slajdów (prowadzący)

Z katalogu `web/` (klucz `OPENAI_API_KEY` w `.env`, zalogowany Claude Code):

```bash
python scripts/lesson06_experiments.py ladder --harness langchain
python scripts/lesson06_experiments.py ladder --harness claude
python scripts/lesson06_experiments.py loop --harness langchain
python scripts/lesson06_experiments.py loop --harness claude
```

Wyniki trafiają do `web/src/data/lesson06-ladder-*.json` i `lesson06-loop-*.json`. Testy (`atak.py`, testy akceptacyjne) uruchamia skrypt po przebiegu, poza zasięgiem agenta.
