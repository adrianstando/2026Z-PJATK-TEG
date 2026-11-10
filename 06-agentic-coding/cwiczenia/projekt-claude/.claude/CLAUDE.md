# CLAUDE.md

API „Zadania”: FastAPI + SQLite, jeden plik `app.py`, testy w `test_*.py`.

## Uruchomienie i testy

- `pip install -r requirements.txt`
- `pytest -q`: każda zmiana w API ma test; bez zielonego `pytest` zadanie nie jest skończone.

## Zasady

1. Zmiana w endpoincie = test pozytywny i negatywny w tym samym kroku (skill `api-tests`).
2. Bezpieczeństwo endpointów: skill `secure-api`. Przed oddaniem zmian przegląd subagentem `security-reviewer`.
3. Sekrety tylko ze zmiennych środowiskowych (`os.environ`), nigdy w kodzie. Pliku `.env` nie czytać.
4. Nie zmieniać kształtu istniejących odpowiedzi bez potrzeby; jeśli trzeba, opisać zmianę w odpowiedzi końcowej.
