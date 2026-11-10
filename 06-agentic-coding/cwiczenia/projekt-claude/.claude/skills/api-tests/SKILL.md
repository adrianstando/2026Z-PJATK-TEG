---
name: api-tests
description: Jak pisać testy API w tym projekcie (pytest + TestClient, osobna baza na test). Używać przy dodawaniu lub zmianie endpointu i przy naprawie błędu.
---

# api-tests

- `pytest` + `fastapi.testclient.TestClient`; każdy test na świeżej bazie w `tmp_path` (fixture zmienia `app.DB` przed `init_db()`).
- Na każdy endpoint co najmniej: przypadek poprawny, brak tokenu (401), cudzy zasób (404), złe dane (422).
- Błąd znaleziony ręcznie = najpierw test, który go odtwarza i nie przechodzi, potem poprawka.
- Race condition testuje się realnie: `ThreadPoolExecutor(10)` i ta sama operacja 10 razy; oczekiwany wynik jak dla jednej.
- Nazwy testów opisują regułę: `test_cannot_read_foreign_submission`, nie `test_get_2`.
- Testy nie wołają zewnętrznych usług ani modeli.
