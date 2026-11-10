"""Wypełnia lokalną bazę przykładowymi danymi.

Użycie (z katalogu projektu):  python scripts/seed.py [ścieżka_do_bazy]
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import config, db  # noqa: E402
from app.services import book_service, loan_service, member_service  # noqa: E402

BOOKS = [
    ("9788324631766", "Lalka", "Bolesław Prus", 3),
    ("9788373271890", "Pan Tadeusz", "Adam Mickiewicz", 2),
    ("9788308049327", "Ferdydurke", "Witold Gombrowicz", 1),
    ("9788375780635", "Solaris", "Stanisław Lem", 2),
]
MEMBERS = [("Anna Nowak", "anna@example.com"), ("Jan Kowalski", "jan@example.com")]


def main(path: str) -> None:
    conn = db.connect(path)
    db.migrate(conn)
    books = [book_service.add_book(conn, *b) for b in BOOKS]
    members = [member_service.register(conn, *m) for m in MEMBERS]
    loan_service.borrow(conn, books[0]["id"], members[0]["id"])
    loan_service.borrow(conn, books[2]["id"], members[1]["id"])
    print(f"Gotowe: {len(books)} książki, {len(members)} czytelników -> {path}")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else config.DEFAULT_DB_PATH)
