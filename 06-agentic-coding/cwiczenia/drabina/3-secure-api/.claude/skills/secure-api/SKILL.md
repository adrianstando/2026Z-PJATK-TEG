---
name: secure-api
description: Reguły bezpieczeństwa dla endpointów FastAPI w tym projekcie (logowanie, punkty, dostęp do danych). Używać przy każdej zmianie lub dodaniu endpointu.
---

# secure-api

Reguły, których agent sam z siebie nie przyjmie. Każda ma powód.

## Dane wejściowe

- Każde pole wejściowe ma typ i granice w modelu Pydantic (`Field(min_length=…, max_length=…)`, `ge`, `le`). Odpowiedź: max 1000 znaków, hasło 8–128.
- Identyfikatory z URL i ciała (np. `task_id`) sprawdza się w bazie; brak = 404, nie 200.

## Zaufanie

- **Klient nie decyduje o wyniku.** Poprawność odpowiedzi i liczbę punktów liczy serwer z tabeli `tasks`. Model wejściowy nie ma pól `correct` ani `points`.
- Odpowiedzi do zadań (`tasks.answer`) nigdy nie wychodzą z API.

## Dostęp

- Zalogowany użytkownik widzi tylko swoje zasoby: zapytanie zawiera `AND user_id = ?` z id z tokenu. Cudzy zasób = 404 (nie 403, żeby nie zdradzać istnienia).
- Uwierzytelnianie przez zależność `Depends(current_user)`; zły lub wygasły token = 401, nigdy 500.
- Token ma `exp` (max 1 h) i jest weryfikowany. Klucz z `os.environ["SECRET_KEY"]`.
- Operacje admina sprawdzają uprawnienia w bazie; sam token nie wystarcza.

## Baza

- Wyłącznie zapytania parametryzowane (`?`). Żadnych f-stringów ani `+` w SQL.
- Hasła: `hashlib.scrypt` albo `bcrypt` z solą; nigdy MD5/SHA bez soli. Kolumna `password` nie trafia do żadnej odpowiedzi; odpowiedzi budować z jawnej listy pól.
- „Tylko raz” wymusza baza: `UNIQUE(user_id, task_id)` na poprawnych zgłoszeniach i `INSERT … ON CONFLICT DO NOTHING`; punkty zwiększać atomowo `UPDATE users SET points = points + ?`. Sprawdzenie w Pythonie przed zapisem nie chroni przed równoległymi żądaniami.

## Konfiguracja

- `debug=False`; CORS tylko dla znanych originów z konfiguracji, bez `*` razem z `allow_credentials`.
