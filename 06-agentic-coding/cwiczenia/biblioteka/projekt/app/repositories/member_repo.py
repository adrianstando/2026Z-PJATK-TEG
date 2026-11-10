import sqlite3

from app.repositories import row_to_dict, rows_to_dicts

_COLUMNS = "id, name, email, card_number, joined_on, active"


def insert(conn: sqlite3.Connection, name: str, email: str, joined_on: str) -> int:
    cur = conn.execute(
        "INSERT INTO members (name, email, joined_on) VALUES (?, ?, ?)",
        (name, email, joined_on),
    )
    member_id = cur.lastrowid
    conn.execute(
        "UPDATE members SET card_number = printf('K-%06d', id) WHERE id = ?", (member_id,)
    )
    return member_id


def get(conn: sqlite3.Connection, member_id: int) -> dict | None:
    return row_to_dict(
        conn.execute(f"SELECT {_COLUMNS} FROM members WHERE id = ?", (member_id,)).fetchone()
    )


def get_by_email(conn: sqlite3.Connection, email: str) -> dict | None:
    return row_to_dict(
        conn.execute(f"SELECT {_COLUMNS} FROM members WHERE email = ?", (email,)).fetchone()
    )


def list_all(conn: sqlite3.Connection, active_only: bool = False) -> list[dict]:
    sql = f"SELECT {_COLUMNS} FROM members"
    if active_only:
        sql += " WHERE active = 1"
    return rows_to_dicts(conn.execute(sql + " ORDER BY name").fetchall())


def set_active(conn: sqlite3.Connection, member_id: int, active: bool) -> None:
    conn.execute("UPDATE members SET active = ? WHERE id = ?", (int(active), member_id))
