---
name: new-endpoint
description: Checklista dodawania lub zmiany endpointu HTTP w API wypożyczalni (router, serwis, repozytorium, schemat, migracja, testy). Używaj, gdy zadanie dodaje nową ścieżkę albo nowe pole/regułę w istniejącym zasobie.
---

# Nowy endpoint w API wypożyczalni

Kolejność pracy od bazy do HTTP. Przed pisaniem przeczytaj jeden istniejący
odpowiednik w każdej warstwie (np. zwrot książki: `loan_repo.mark_returned`,
`loan_service.return_book`, `routers/loans.py::return_book`) i trzymaj się jego wzoru.

1. **Migracja** (tylko gdy potrzebna nowa kolumna/tabela)
   - Nowy plik `migrations/NNN_opis.sql`, numer = ostatni + 1, nazwa `[a-z0-9_]`.
   - Nowa kolumna w istniejącej tabeli: `ALTER TABLE ... ADD COLUMN ... NOT NULL DEFAULT ...`, żeby stare wiersze miały wartość.
   - Nigdy nie edytuj wcześniejszych plików migracji.
2. **Repozytorium** (`app/repositories/<encja>_repo.py`)
   - Nowa kolumna trafia do `_COLUMNS`, inaczej nie pojawi się w odpowiedziach.
   - Funkcja `(conn, ...)`, parametry przez `?`, zwraca `dict`/`None`/`int`; bez reguł i bez transakcji.
3. **Konfiguracja**: nowe limity i okresy jako stałe w `app/config.py`.
4. **Serwis** (`app/services/<encja>_service.py`)
   - Pobierz obiekt funkcją `get_<encja>()` (sama zgłasza `NotFoundError` -> 404).
   - Każda reguła: `raise DomainError("kod", "komunikat")` -> 409. Kod nowy, w snake_case; istniejące kody (np. `member_has_unpaid_fines`) używaj ponownie, gdy znaczą to samo.
   - Sprawdzenia przed zapisem, zapis w `with db.transaction(conn):`, na końcu zwróć świeżo odczytany obiekt.
   - Daty: `clock.today_iso()`, `clock.add_days()`; kwoty w groszach.
5. **Schemat** (`app/schemas/<encja>.py`): nowe pola w `*Out` (typy `IsoDate`, `Grosze`); wejście w `*Create`/`*Update`.
6. **Router** (`app/routers/<encja>.py`)
   - Ścieżka względna: `@router.post("/{id}/akcja", response_model=...)`; prefiks dodaje `main.ROUTERS`.
   - `conn: sqlite3.Connection = Depends(get_conn)`, wywołanie jednej funkcji serwisu, bez try/except.
   - `status_code=201` tylko dla tworzenia zasobu; akcja na istniejącym zasobie zwraca 200.
   - Nowy plik routera: dopisz `(router, "/prefiks", "tag")` do `ROUTERS` w `app/main.py`.
7. **Testy** (`tests/test_<encja>.py`)
   - Fixture'y `client`, `make_book`, `make_member`, `make_loan`, `travel`; „dziś” = 2026-03-02.
   - Test sukcesu, test 404 i osobny test każdej reguły (409 + `error_code(resp) == "kod"`).
   - Sprawdź też, że po odrzuceniu stan się nie zmienił.
8. **Weryfikacja**: `python -m pytest tests -q` z katalogu projektu (nie samo `pytest`). Dopisz wiersz w `docs/api.md`.
