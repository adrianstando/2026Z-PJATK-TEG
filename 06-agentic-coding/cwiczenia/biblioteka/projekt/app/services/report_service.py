import sqlite3

from app import clock, money
from app.repositories import report_repo
from app.services import fine_service


def overdue(conn: sqlite3.Connection) -> list[dict]:
    today = clock.today_iso()
    items = []
    for row in report_repo.overdue_loans(conn, today):
        days = clock.days_between(row["due_date"], today)
        items.append({**row, "days_overdue": days, "expected_fine_grosze": fine_service.overdue_fine(days)})
    return items


def fines(conn: sqlite3.Connection) -> dict:
    members = [
        {**row, "unpaid_pln": money.format_pln(row["unpaid_grosze"])}
        for row in report_repo.unpaid_fines_by_member(conn)
    ]
    total = sum(m["unpaid_grosze"] for m in members)
    return {"total_unpaid_grosze": total, "total_unpaid_pln": money.format_pln(total), "members": members}


def popular(conn: sqlite3.Connection, limit: int = 10) -> list[dict]:
    return report_repo.popular_books(conn, limit)
