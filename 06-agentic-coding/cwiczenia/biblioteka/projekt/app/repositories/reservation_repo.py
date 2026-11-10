import sqlite3

from app.repositories import row_to_dict, rows_to_dicts

_COLUMNS = "id, book_id, member_id, created_on, status"


def insert(conn: sqlite3.Connection, book_id: int, member_id: int, created_on: str) -> int:
    cur = conn.execute(
        "INSERT INTO reservations (book_id, member_id, created_on) VALUES (?, ?, ?)",
        (book_id, member_id, created_on),
    )
    return cur.lastrowid


def get(conn: sqlite3.Connection, reservation_id: int) -> dict | None:
    return row_to_dict(
        conn.execute(
            f"SELECT {_COLUMNS} FROM reservations WHERE id = ?", (reservation_id,)
        ).fetchone()
    )


def list_active_for_book(conn: sqlite3.Connection, book_id: int) -> list[dict]:
    """Aktywne rezerwacje w kolejce (najstarsza pierwsza)."""
    return rows_to_dicts(
        conn.execute(
            f"SELECT {_COLUMNS} FROM reservations WHERE book_id = ? AND status = 'active' "
            "ORDER BY created_on, id",
            (book_id,),
        ).fetchall()
    )


def count_active_for_book(conn: sqlite3.Connection, book_id: int) -> int:
    row = conn.execute(
        "SELECT COUNT(*) AS n FROM reservations WHERE book_id = ? AND status = 'active'",
        (book_id,),
    ).fetchone()
    return row["n"]


def find_active(conn: sqlite3.Connection, book_id: int, member_id: int) -> dict | None:
    return row_to_dict(
        conn.execute(
            f"SELECT {_COLUMNS} FROM reservations "
            "WHERE book_id = ? AND member_id = ? AND status = 'active'",
            (book_id, member_id),
        ).fetchone()
    )


def list_for_member(conn: sqlite3.Connection, member_id: int) -> list[dict]:
    return rows_to_dicts(
        conn.execute(
            f"SELECT {_COLUMNS} FROM reservations WHERE member_id = ? ORDER BY id", (member_id,)
        ).fetchall()
    )


def set_status(conn: sqlite3.Connection, reservation_id: int, status: str) -> None:
    conn.execute("UPDATE reservations SET status = ? WHERE id = ?", (status, reservation_id))
