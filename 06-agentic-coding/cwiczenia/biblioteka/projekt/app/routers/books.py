import sqlite3

from fastapi import APIRouter, Depends

from app.db import get_conn
from app.schemas.books import BookCreate, BookOut, BookUpdate
from app.schemas.reservations import ReservationOut
from app.services import book_service, reservation_service

router = APIRouter()


@router.get("", response_model=list[BookOut])
def list_books(q: str | None = None, conn: sqlite3.Connection = Depends(get_conn)):
    return book_service.list_books(conn, q)


@router.post("", response_model=BookOut, status_code=201)
def add_book(payload: BookCreate, conn: sqlite3.Connection = Depends(get_conn)):
    return book_service.add_book(conn, payload.isbn, payload.title, payload.author, payload.copies)


@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: int, conn: sqlite3.Connection = Depends(get_conn)):
    return book_service.get_book(conn, book_id)


@router.patch("/{book_id}", response_model=BookOut)
def update_book(book_id: int, payload: BookUpdate, conn: sqlite3.Connection = Depends(get_conn)):
    return book_service.update_book(conn, book_id, payload.model_dump(exclude_unset=True))


@router.get("/{book_id}/queue", response_model=list[ReservationOut])
def reservation_queue(book_id: int, conn: sqlite3.Connection = Depends(get_conn)):
    return reservation_service.queue_for_book(conn, book_id)
