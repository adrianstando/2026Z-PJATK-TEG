# Wypożyczalnia – API

API wypożyczalni biblioteki miejskiej: katalog, czytelnicy, wypożyczenia,
rezerwacje, kary i raporty. FastAPI + SQLite.

## Uruchomienie

    pip install -r requirements.txt
    python scripts/seed.py          # opcjonalnie: przykładowe dane w library.db
    uvicorn app.main:create_app --factory --reload

Dokumentacja endpointów: `/docs` po uruchomieniu albo `docs/api.md`.

## Testy

    python -m pytest tests -q
