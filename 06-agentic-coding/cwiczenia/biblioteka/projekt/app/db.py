"""Połączenie z SQLite i migracje schematu.

Schemat bazy powstaje wyłącznie z plików `migrations/NNN_opis.sql`, wykonywanych
w kolejności numerów. Zastosowane migracje są zapisywane w tabeli
`schema_migrations` razem z sumą kontrolną – zmiana pliku, który już był
zastosowany na produkcji, kończy się błędem przy starcie. Zmiana schematu
= nowy plik z kolejnym numerem.
"""

import hashlib
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator

from fastapi import Request

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "migrations"
MIGRATION_GLOB = "[0-9][0-9][0-9]_*.sql"


class MigrationError(RuntimeError):
    pass


def connect(path: str | Path) -> sqlite3.Connection:
    conn = sqlite3.connect(str(path), check_same_thread=False, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def migration_files() -> list[Path]:
    return sorted(MIGRATIONS_DIR.glob(MIGRATION_GLOB))


def migrate(conn: sqlite3.Connection) -> list[str]:
    """Wykonuje brakujące migracje. Zwraca listę nowo zastosowanych wersji."""
    conn.execute(
        "CREATE TABLE IF NOT EXISTS schema_migrations ("
        " version TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_on TEXT NOT NULL)"
    )
    applied = {
        row["version"]: row["checksum"]
        for row in conn.execute("SELECT version, checksum FROM schema_migrations")
    }
    done = []
    for path in migration_files():
        sql = path.read_text(encoding="utf-8")
        checksum = hashlib.sha256(sql.encode("utf-8")).hexdigest()
        version = path.stem
        if version in applied:
            if applied[version] != checksum:
                raise MigrationError(
                    f"Migracja {path.name} zmieniła się po zastosowaniu. "
                    "Nie edytuj istniejących migracji – dodaj nowy plik."
                )
            continue
        with transaction(conn):
            for statement in _split_statements(sql):
                conn.execute(statement)
            conn.execute(
                "INSERT INTO schema_migrations (version, checksum, applied_on) VALUES (?, ?, date('now'))",
                (version, checksum),
            )
        done.append(version)
    return done


def _split_statements(sql: str) -> list[str]:
    # Migracje są proste (bez triggerów), więc wystarczy podział po średnikach.
    lines = [line for line in sql.splitlines() if not line.strip().startswith("--")]
    return [s.strip() for s in "\n".join(lines).split(";") if s.strip()]


@contextmanager
def transaction(conn: sqlite3.Connection) -> Iterator[sqlite3.Connection]:
    """Jawna transakcja. Każdy zapis w serwisie idzie przez ten context manager."""
    conn.execute("BEGIN")
    try:
        yield conn
    except BaseException:
        conn.execute("ROLLBACK")
        raise
    else:
        conn.execute("COMMIT")


def get_conn(request: Request) -> Iterator[sqlite3.Connection]:
    """Zależność FastAPI: jedno połączenie na żądanie."""
    conn = connect(request.app.state.db_path)
    try:
        yield conn
    finally:
        conn.close()
