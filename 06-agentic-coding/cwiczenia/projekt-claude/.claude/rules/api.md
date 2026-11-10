---
paths:
  - "app.py"
  - "routers/**/*.py"
---

# Endpointy API

- Odpowiedzi budować z jawnej listy pól (model Pydantic odpowiedzi), nigdy `dict(row)`.
- Błędy klienta to 4xx z polem `detail`; zły lub brakujący token = 401, cudzy zasób = 404.
- Nowy endpoint: najpierw test w `test_app.py`, potem kod.
