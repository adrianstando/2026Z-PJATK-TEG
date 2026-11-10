import sqlite3

from app import clock, config, db, money
from app.errors import DomainError, NotFoundError
from app.repositories import fine_repo
from app.services import member_service


def get_fine(conn: sqlite3.Connection, fine_id: int) -> dict:
    fine = fine_repo.get(conn, fine_id)
    if fine is None:
        raise NotFoundError("kara", fine_id)
    return fine


def list_for_member(conn: sqlite3.Connection, member_id: int, status: str | None = None) -> list[dict]:
    member_service.get_member(conn, member_id)
    return fine_repo.list_for_member(conn, member_id, status)


def overdue_fine(days_late: int) -> int:
    """Kara za przetrzymanie w groszach (z limitem na jedno wypożyczenie)."""
    if days_late <= 0:
        return 0
    return min(days_late * config.FINE_PER_DAY_GROSZE, config.MAX_FINE_PER_LOAN_GROSZE)


def issue(conn: sqlite3.Connection, member_id: int, amount_grosze: int, reason: str,
          loan_id: int | None = None) -> dict:
    """Nakłada karę. Wołane w transakcji wywołującego albo samodzielnie."""
    member_service.get_member(conn, member_id)
    fine_id = fine_repo.insert(conn, member_id, amount_grosze, reason, clock.today_iso(), loan_id)
    return fine_repo.get(conn, fine_id)


def issue_manual(conn: sqlite3.Connection, member_id: int, amount_grosze: int, reason: str) -> dict:
    with db.transaction(conn):
        fine = issue(conn, member_id, amount_grosze, reason)
    return fine


def _settle(conn: sqlite3.Connection, fine_id: int, status: str) -> dict:
    fine = get_fine(conn, fine_id)
    if fine["status"] != "unpaid":
        raise DomainError("fine_already_settled", f"Kara #{fine_id} jest już rozliczona ({fine['status']})")
    with db.transaction(conn):
        fine_repo.settle(conn, fine_id, status, clock.today_iso())
    return get_fine(conn, fine_id)


def pay(conn: sqlite3.Connection, fine_id: int) -> dict:
    return _settle(conn, fine_id, "paid")


def waive(conn: sqlite3.Connection, fine_id: int) -> dict:
    return _settle(conn, fine_id, "waived")


def member_summary(conn: sqlite3.Connection, member_id: int) -> dict:
    member_service.get_member(conn, member_id)
    unpaid = fine_repo.unpaid_total(conn, member_id)
    return {"member_id": member_id, "unpaid_grosze": unpaid, "unpaid_pln": money.format_pln(unpaid)}
