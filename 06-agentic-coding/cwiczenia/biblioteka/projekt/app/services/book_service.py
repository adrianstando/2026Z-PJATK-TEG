import sqlite3

from app import db
from app.errors import DomainError, NotFoundError
from app.repositories import book_repo


def get_book(conn: sqlite3.Connection, book_id: int) -> dict:
    book = book_repo.get(conn, book_id)
    if book is None:
        raise NotFoundError("książka", book_id)
    return book


def list_books(conn: sqlite3.Connection, query: str | None = None) -> list[dict]:
    return book_repo.list_all(conn, query)


def add_book(conn: sqlite3.Connection, isbn: str, title: str, author: str, copies: int) -> dict:
    if book_repo.get_by_isbn(conn, isbn) is not None:
        raise DomainError("isbn_taken", f"Książka o ISBN {isbn} już jest w katalogu")
    with db.transaction(conn):
        book_id = book_repo.insert(conn, isbn, title.strip(), author.strip(), copies)
    return get_book(conn, book_id)


def update_book(conn: sqlite3.Connection, book_id: int, fields: dict) -> dict:
    book = get_book(conn, book_id)
    copies = fields.get("copies")
    if copies is not None:
        loaned = book["copies"] - book["available"]
        if copies < loaned:
            raise DomainError(
                "copies_below_loaned",
                f"Nie można zmniejszyć liczby egzemplarzy do {copies} – wypożyczonych jest {loaned}",
            )
    with db.transaction(conn):
        book_repo.update(conn, book_id, {k: v for k, v in fields.items() if v is not None})
    return get_book(conn, book_id)
