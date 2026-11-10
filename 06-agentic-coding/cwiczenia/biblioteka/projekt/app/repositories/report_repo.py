"""Zapytania raportowe (tylko odczyt, z JOIN-ami)."""

import sqlite3

from app.repositories import rows_to_dicts


def overdue_loans(conn: sqlite3.Connection, today_iso: str) -> list[dict]:
    return rows_to_dicts(
        conn.execute(
            """
            SELECT l.id AS loan_id, b.title AS book_title, m.name AS member_name, l.due_date
            FROM loans l
            JOIN books b ON b.id = l.book_id
            JOIN members m ON m.id = l.member_id
            WHERE l.returned_on IS NULL AND l.due_date < ?
            ORDER BY l.due_date, l.id
            """,
            (today_iso,),
        ).fetchall()
    )


def unpaid_fines_by_member(conn: sqlite3.Connection) -> list[dict]:
    return rows_to_dicts(
        conn.execute(
            """
            SELECT member_id, SUM(amount_grosze) AS unpaid_grosze
            FROM fines
            WHERE status = 'unpaid'
            GROUP BY member_id
            ORDER BY unpaid_grosze DESC, member_id
            """
        ).fetchall()
    )


def popular_books(conn: sqlite3.Connection, limit: int) -> list[dict]:
    return rows_to_dicts(
        conn.execute(
            """
            SELECT b.id AS book_id, b.title, COUNT(l.id) AS loans
            FROM books b LEFT JOIN loans l ON l.book_id = b.id
            GROUP BY b.id
            ORDER BY loans DESC, b.title
            LIMIT ?
            """,
            (limit,),
        ).fetchall()
    )
