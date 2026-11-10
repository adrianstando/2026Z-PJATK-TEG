import sqlite3

from app.repositories import row_to_dict, rows_to_dicts

_COLUMNS = "id, member_id, loan_id, amount_grosze, reason, issued_on, status, settled_on"


def insert(
    conn: sqlite3.Connection,
    member_id: int,
    amount_grosze: int,
    reason: str,
    issued_on: str,
    loan_id: int | None = None,
) -> int:
    cur = conn.execute(
        "INSERT INTO fines (member_id, loan_id, amount_grosze, reason, issued_on) "
        "VALUES (?, ?, ?, ?, ?)",
        (member_id, loan_id, amount_grosze, reason, issued_on),
    )
    return cur.lastrowid


def get(conn: sqlite3.Connection, fine_id: int) -> dict | None:
    return row_to_dict(
        conn.execute(f"SELECT {_COLUMNS} FROM fines WHERE id = ?", (fine_id,)).fetchone()
    )


def list_for_member(conn: sqlite3.Connection, member_id: int, status: str | None = None) -> list[dict]:
    sql = f"SELECT {_COLUMNS} FROM fines WHERE member_id = ?"
    params: tuple = (member_id,)
    if status:
        sql += " AND status = ?"
        params += (status,)
    return rows_to_dicts(conn.execute(sql + " ORDER BY issued_on, id", params).fetchall())


def unpaid_total(conn: sqlite3.Connection, member_id: int) -> int:
    """Suma nieopłaconych kar członka w groszach (0, gdy brak)."""
    row = conn.execute(
        "SELECT COALESCE(SUM(amount_grosze), 0) AS total FROM fines "
        "WHERE member_id = ? AND status = 'unpaid'",
        (member_id,),
    ).fetchone()
    return row["total"]


def settle(conn: sqlite3.Connection, fine_id: int, status: str, settled_on: str) -> None:
    conn.execute(
        "UPDATE fines SET status = ?, settled_on = ? WHERE id = ?", (status, settled_on, fine_id)
    )
