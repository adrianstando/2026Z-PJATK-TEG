# Wypożyczalnia – API (FastAPI + SQLite)

## Mapa projektu

| Ścieżka | Co tam jest |
|---|---|
| `app/main.py` | `create_app()` i lista `ROUTERS` (router, prefiks, tag) |
| `app/routers/` | cienkie endpointy: schemat wejścia -> serwis -> schemat wyjścia |
| `app/services/` | reguły biznesowe, transakcje (`db.transaction`), błędy domenowe |
| `app/repositories/` | cały SQL; funkcje `(conn, ...) -> dict \| None` |
| `app/schemas/` | modele Pydantic v2 (`*Create`, `*Out`); typy `IsoDate`, `Grosze` w `common.py` |
| `app/errors.py` | `DomainError` (409), `NotFoundError` (404), `InvalidInputError` (422) |
| `app/config.py`, `app/clock.py` | stałe domenowe; jedyne źródło dzisiejszej daty |
| `migrations/NNN_opis.sql` | schemat bazy, wykonywany w kolejności numerów |
| `tests/` | pytest + TestClient; `conftest.py` daje `client`, `make_*`, `travel` |
| `docs/notatki-2023.md`, `legacy/` | nieaktualne, nie wzorować się |

## Testy

Z katalogu głównego projektu: `python -m pytest tests -q`.
Samo `pytest` zbiera też `legacy/`, gdzie test celowo nie przechodzi.

## Konwencje

- Prefiks ścieżki nadaje `ROUTERS` w `app/main.py`; w routerze ścieżki względne (`"/{id}/..."`). Nowy plik routera = wpis w `ROUTERS`.
- SQL tylko w `app/repositories/`; routery wołają serwisy, nigdy repozytoriów.
- Reguły biznesowe w serwisie. Błąd = `raise DomainError("kod_snake_case", "komunikat po polsku")`, brak obiektu = `NotFoundError("encja", id)`. Nie używaj `HTTPException`: handler w `app/errors.py` zwraca `{"error": {"code", "message"}}`.
- Zapisy w serwisie w `with db.transaction(conn):`.
- Zmiana schematu = nowy plik migracji z kolejnym numerem. Nie edytuj istniejących (sumy kontrolne w `schema_migrations`).
- Kwoty w groszach (`int`, pola `*_grosze`), daty jako tekst ISO `YYYY-MM-DD`; arytmetyka dat przez `clock.add_days` / `clock.days_between`.
- Dzisiejsza data tylko z `clock.today()` / `clock.today_iso()`; liczby domenowe (okresy, limity) w `app/config.py`.
- Nowe pole w odpowiedzi = kolumna w `_COLUMNS` repozytorium + pole w schemacie `*Out`.

## Kiedy zadanie jest skończone

- Nowe zachowanie ma testy w `tests/` (sukces i każdy kod błędu), oparte na fixture'ach z `conftest.py`.
- `python -m pytest tests -q` przechodzi w całości, łącznie z `tests/test_architecture.py`.
- `docs/api.md` ma wiersz dla nowego endpointu.

Przy dodawaniu endpointu: skill `new-endpoint`.
