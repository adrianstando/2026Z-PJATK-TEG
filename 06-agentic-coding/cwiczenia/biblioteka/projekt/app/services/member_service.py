import sqlite3

from app import clock, db
from app.errors import DomainError, NotFoundError
from app.repositories import fine_repo, loan_repo, member_repo


def get_member(conn: sqlite3.Connection, member_id: int) -> dict:
    member = member_repo.get(conn, member_id)
    if member is None:
        raise NotFoundError("czytelnik", member_id)
    return member


def list_members(conn: sqlite3.Connection, active_only: bool = False) -> list[dict]:
    return member_repo.list_all(conn, active_only)


def register(conn: sqlite3.Connection, name: str, email: str) -> dict:
    email = email.strip().lower()
    if member_repo.get_by_email(conn, email) is not None:
        raise DomainError("email_taken", f"Adres {email} jest już zarejestrowany")
    with db.transaction(conn):
        member_id = member_repo.insert(conn, name.strip(), email, clock.today_iso())
    return get_member(conn, member_id)


def deactivate(conn: sqlite3.Connection, member_id: int) -> dict:
    """Zamyka konto. Wymaga zwrotu wszystkich książek i rozliczenia kar."""
    get_member(conn, member_id)
    if loan_repo.count_active_for_member(conn, member_id) > 0:
        raise DomainError("member_has_active_loans", "Czytelnik ma niezwrócone książki")
    if fine_repo.unpaid_total(conn, member_id) > 0:
        raise DomainError("member_has_unpaid_fines", "Czytelnik ma nieopłacone kary")
    with db.transaction(conn):
        member_repo.set_active(conn, member_id, False)
    return get_member(conn, member_id)
