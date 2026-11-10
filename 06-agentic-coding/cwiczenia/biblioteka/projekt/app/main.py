"""Fabryka aplikacji.

Uruchomienie lokalne:  uvicorn app.main:create_app --factory --reload
"""

from pathlib import Path

from fastapi import FastAPI

from app import config, db
from app.errors import install_error_handlers
from app.routers import books, fines, loans, members, reports, reservations

# Rejestr routerów: (router, prefiks, tag w dokumentacji).
# Prefiks nadajemy wyłącznie tutaj – ścieżki w routerach są względne.
# Router, którego nie ma na tej liście, nie jest dostępny w API.
ROUTERS = [
    (books.router, "/books", "książki"),
    (members.router, "/members", "czytelnicy"),
    (loans.router, "/loans", "wypożyczenia"),
    (reservations.router, "/reservations", "rezerwacje"),
    (fines.router, "/fines", "kary"),
    (reports.router, "/reports", "raporty"),
]


def create_app(db_path: str | Path | None = None) -> FastAPI:
    app = FastAPI(title="Wypożyczalnia – API", version="2.3.0")
    app.state.db_path = str(db_path or config.DEFAULT_DB_PATH)

    conn = db.connect(app.state.db_path)
    try:
        db.migrate(conn)
    finally:
        conn.close()

    install_error_handlers(app)
    for router, prefix, tag in ROUTERS:
        app.include_router(router, prefix=prefix, tags=[tag])

    @app.get("/health", tags=["inne"])
    def health():
        return {"status": "ok"}

    return app
