# AGENTS.md

API „Zadania”: FastAPI + SQLite, jeden plik `app.py`, testy w `test_app.py`.

## Uruchomienie i testy

- `pytest -q`: wszystkie testy. Bez zielonego `pytest` zadanie nie jest skończone.

## Zasady

1. Każdy endpoint ma test: przypadek poprawny i co najmniej jeden błędny.
2. Sekrety (klucz JWT) tylko ze zmiennych środowiskowych (`os.environ`), nigdy w kodzie.
3. Odpowiedzi API budować z jawnej listy pól; nie zwracać całych wierszy z bazy.
4. Błąd klienta (zły token, złe dane) to 4xx, nigdy 500.
