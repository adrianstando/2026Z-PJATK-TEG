import sqlite3

from app.repositories import row_to_dict, rows_to_dicts

_COLUMNS = "id, book_id, member_id, loaned_on, due_date, returned_on"


def insert(conn: sqlite3.Connection, book_id: int, member_id: int, loaned_on: str, due_date: str) -> int:
    cur = conn.execute(
        "INSERT INTO loans (book_id, member_id, loaned_on, due_date) VALUES (?, ?, ?, ?)",
        (book_id, member_id, loaned_on, due_date),
    )
    return cur.lastrowid


def get(conn: sqlite3.Connection, loan_id: int) -> dict | None:
    return row_to_dict(
        conn.execute(f"SELECT {_COLUMNS} FROM loans WHERE id = ?", (loan_id,)).fetchone()
    )


def list_for_member(conn: sqlite3.Connection, member_id: int, active_only: bool = False) -> list[dict]:
    sql = f"SELECT {_COLUMNS} FROM loans WHERE member_id = ?"
    if active_only:
        sql += " AND returned_on IS NULL"
    return rows_to_dicts(conn.execute(sql + " ORDER BY loaned_on, id", (member_id,)).fetchall())


def count_active_for_member(conn: sqlite3.Connection, member_id: int) -> int:
    row = conn.execute(
        "SELECT COUNT(*) AS n FROM loans WHERE member_id = ? AND returned_on IS NULL",
        (member_id,),
    ).fetchone()
    return row["n"]


def find_active(conn: sqlite3.Connection, book_id: int, member_id: int) -> dict | None:
    return row_to_dict(
        conn.execute(
            f"SELECT {_COLUMNS} FROM loans WHERE book_id = ? AND member_id = ? AND returned_on IS NULL",
            (book_id, member_id),
        ).fetchone()
    )


def mark_returned(conn: sqlite3.Connection, loan_id: int, returned_on: str) -> None:
    conn.execute("UPDATE loans SET returned_on = ? WHERE id = ?", (returned_on, loan_id))
