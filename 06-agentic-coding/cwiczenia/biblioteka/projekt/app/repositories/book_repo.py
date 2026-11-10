import sqlite3

from app.repositories import row_to_dict, rows_to_dicts

_SELECT = """
    SELECT b.id, b.isbn, b.title, b.author, b.copies,
           b.copies - (SELECT COUNT(*) FROM loans l
                       WHERE l.book_id = b.id AND l.returned_on IS NULL) AS available
    FROM books b
"""


def insert(conn: sqlite3.Connection, isbn: str, title: str, author: str, copies: int) -> int:
    cur = conn.execute(
        "INSERT INTO books (isbn, title, author, copies) VALUES (?, ?, ?, ?)",
        (isbn, title, author, copies),
    )
    return cur.lastrowid


def get(conn: sqlite3.Connection, book_id: int) -> dict | None:
    return row_to_dict(conn.execute(_SELECT + " WHERE b.id = ?", (book_id,)).fetchone())


def get_by_isbn(conn: sqlite3.Connection, isbn: str) -> dict | None:
    return row_to_dict(conn.execute(_SELECT + " WHERE b.isbn = ?", (isbn,)).fetchone())


def list_all(conn: sqlite3.Connection, query: str | None = None) -> list[dict]:
    if query:
        like = f"%{query.lower()}%"
        rows = conn.execute(
            _SELECT + " WHERE lower(b.title) LIKE ? OR lower(b.author) LIKE ? ORDER BY b.title",
            (like, like),
        ).fetchall()
    else:
        rows = conn.execute(_SELECT + " ORDER BY b.title").fetchall()
    return rows_to_dicts(rows)


def update(conn: sqlite3.Connection, book_id: int, fields: dict) -> None:
    allowed = {"title", "author", "copies"}
    sets = [f"{name} = ?" for name in fields if name in allowed]
    if not sets:
        return
    values = [fields[name] for name in fields if name in allowed]
    conn.execute(f"UPDATE books SET {', '.join(sets)} WHERE id = ?", (*values, book_id))


def count_available(conn: sqlite3.Connection, book_id: int) -> int:
    row = get(conn, book_id)
    return row["available"] if row else 0
