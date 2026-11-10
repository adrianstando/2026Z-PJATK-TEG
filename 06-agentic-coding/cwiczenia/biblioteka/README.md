# Biblioteka: eksperyment „konfiguracja agenta”

Syntetyczny projekt średniej wielkości do porównania przebiegów agenta
kodującego bez konfiguracji i z `AGENTS.md` + skillem. Projekt ma konwencje,
których nie da się zgadnąć bez czytania kodu (prefiksy w `ROUTERS`, `DomainError`
zamiast `HTTPException`, migracje tylko dopisywane, SQL tylko w repozytoriach,
zegar w `app/clock.py`) oraz mylące pliki (`docs/notatki-2023.md`, `legacy/`).

| Ścieżka | Co to jest |
|---|---|
| `projekt/` | API wypożyczalni (FastAPI + sqlite3 + Pydantic v2) z testami |
| `zadanie.txt` | polecenie dla agenta |
| `akceptacja/test_extend.py` | ukryte testy akceptacyjne (agent ich nie widzi) |
| `konfiguracja/` | `AGENTS.md`, `CLAUDE.md`, `.claude/skills/new-endpoint/SKILL.md` dla wariantu „z konfiguracją” |

## Testy projektu

    cd projekt
    python -m pytest tests -q

Samo `pytest` w `projekt/` zbiera `legacy/` i kończy się jednym błędem (celowo).

## Przebieg eksperymentu

```bash
D=/tmp/biblioteka; mkdir -p $D
cp -r projekt $D/bez-konf
cp -r projekt $D/z-konf && cp -r konfiguracja/. $D/z-konf/
TASK="$(cat zadanie.txt)"
python ../harness.py --workdir $D/bez-konf --log $D/bez-konf.jsonl "$TASK"
python ../harness.py --workdir $D/z-konf   --log $D/z-konf.jsonl   "$TASK"
```

Ocena każdego wariantu (dziennik daje liczbę wywołań narzędzi i tokeny):

```bash
cp akceptacja/test_extend.py $D/bez-konf/tests/
(cd $D/bez-konf && python -m pytest tests -q)
```

Na niezmienionym projekcie akceptacja nie przechodzi (9 z 10 testów pada).
Testy sprawdzają kontrakt zadania: 200 i `due_date` + 14 dni, licznik
`extensions`, 404 z kodem `not_found`, 409 w formacie `{"error": {"code", "message"}}`
dla limitu, rezerwacji, kar i zwróconego wypożyczenia oraz to, że zmiana
schematu jest nową migracją, a stare pliki migracji są nietknięte.
