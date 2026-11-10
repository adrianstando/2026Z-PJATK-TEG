import sqlite3

from app import clock, db
from app.errors import DomainError, NotFoundError
from app.repositories import loan_repo, reservation_repo
from app.services import book_service, member_service


def get_reservation(conn: sqlite3.Connection, reservation_id: int) -> dict:
    reservation = reservation_repo.get(conn, reservation_id)
    if reservation is None:
        raise NotFoundError("rezerwacja", reservation_id)
    return reservation


def queue_for_book(conn: sqlite3.Connection, book_id: int) -> list[dict]:
    book_service.get_book(conn, book_id)
    return reservation_repo.list_active_for_book(conn, book_id)


def reserve(conn: sqlite3.Connection, book_id: int, member_id: int) -> dict:
    """Rezerwacja jest możliwa tylko wtedy, gdy nie ma wolnych egzemplarzy."""
    book = book_service.get_book(conn, book_id)
    member = member_service.get_member(conn, member_id)
    if not member["active"]:
        raise DomainError("member_inactive", "Konto czytelnika jest zamknięte")
    if book["available"] > 0:
        raise DomainError("book_available", "Książka jest dostępna – wypożycz ją zamiast rezerwować")
    if loan_repo.find_active(conn, book_id, member_id) is not None:
        raise DomainError("already_borrowed", "Czytelnik ma już tę książkę")
    if reservation_repo.find_active(conn, book_id, member_id) is not None:
        raise DomainError("already_reserved", "Czytelnik już czeka w kolejce po tę książkę")
    with db.transaction(conn):
        reservation_id = reservation_repo.insert(conn, book_id, member_id, clock.today_iso())
    return get_reservation(conn, reservation_id)


def cancel(conn: sqlite3.Connection, reservation_id: int) -> dict:
    reservation = get_reservation(conn, reservation_id)
    if reservation["status"] != "active":
        raise DomainError("reservation_not_active", f"Rezerwacja #{reservation_id} nie jest aktywna")
    with db.transaction(conn):
        reservation_repo.set_status(conn, reservation_id, "cancelled")
    return get_reservation(conn, reservation_id)
