import sqlite3

from app import clock, config, db
from app.errors import DomainError, NotFoundError
from app.repositories import fine_repo, loan_repo, reservation_repo
from app.services import book_service, fine_service, member_service


def get_loan(conn: sqlite3.Connection, loan_id: int) -> dict:
    loan = loan_repo.get(conn, loan_id)
    if loan is None:
        raise NotFoundError("wypożyczenie", loan_id)
    return loan


def list_for_member(conn: sqlite3.Connection, member_id: int, active_only: bool = False) -> list[dict]:
    member_service.get_member(conn, member_id)
    return loan_repo.list_for_member(conn, member_id, active_only)


def borrow(conn: sqlite3.Connection, book_id: int, member_id: int) -> dict:
    book = book_service.get_book(conn, book_id)
    member = member_service.get_member(conn, member_id)

    if not member["active"]:
        raise DomainError("member_inactive", "Konto czytelnika jest zamknięte")
    if loan_repo.find_active(conn, book_id, member_id) is not None:
        raise DomainError("already_borrowed", "Czytelnik ma już tę książkę")
    if loan_repo.count_active_for_member(conn, member_id) >= config.MAX_ACTIVE_LOANS:
        raise DomainError(
            "loan_limit_reached", f"Limit {config.MAX_ACTIVE_LOANS} wypożyczeń naraz został osiągnięty"
        )
    if fine_repo.unpaid_total(conn, member_id) > 0:
        raise DomainError("member_has_unpaid_fines", "Czytelnik ma nieopłacone kary")
    if book["available"] <= 0:
        raise DomainError("book_unavailable", f"Brak wolnych egzemplarzy: {book['title']}")

    # Wolne egzemplarze trzymamy dla osób z kolejki rezerwacji.
    queue = reservation_repo.list_active_for_book(conn, book_id)
    own = next((r for r in queue if r["member_id"] == member_id), None)
    if own is None and len(queue) >= book["available"]:
        raise DomainError("book_reserved", "Wolne egzemplarze czekają na osoby z rezerwacją")

    loaned_on = clock.today_iso()
    due_date = clock.add_days(loaned_on, config.LOAN_PERIOD_DAYS)
    with db.transaction(conn):
        loan_id = loan_repo.insert(conn, book_id, member_id, loaned_on, due_date)
        if own is not None:
            reservation_repo.set_status(conn, own["id"], "fulfilled")
    return get_loan(conn, loan_id)


def return_book(conn: sqlite3.Connection, loan_id: int) -> dict:
    """Zwrot książki. Po terminie nalicza karę. Zwraca {loan, fine_grosze}."""
    loan = get_loan(conn, loan_id)
    if loan["returned_on"] is not None:
        raise DomainError("loan_already_returned", f"Wypożyczenie #{loan_id} zostało już zwrócone")

    today = clock.today_iso()
    days_late = clock.days_between(loan["due_date"], today)
    fine = fine_service.overdue_fine(days_late)
    with db.transaction(conn):
        loan_repo.mark_returned(conn, loan_id, today)
        if fine > 0:
            fine_service.issue(
                conn, loan["member_id"], fine, f"Przetrzymanie {days_late} dni", loan_id=loan_id
            )
    return {"loan": get_loan(conn, loan_id), "fine_grosze": fine}
