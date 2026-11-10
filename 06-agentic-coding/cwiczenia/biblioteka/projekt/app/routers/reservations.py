import sqlite3

from fastapi import APIRouter, Depends

from app.db import get_conn
from app.schemas.reservations import ReservationCreate, ReservationOut
from app.services import reservation_service

router = APIRouter()


@router.post("", response_model=ReservationOut, status_code=201)
def reserve(payload: ReservationCreate, conn: sqlite3.Connection = Depends(get_conn)):
    return reservation_service.reserve(conn, payload.book_id, payload.member_id)


@router.get("/{reservation_id}", response_model=ReservationOut)
def get_reservation(reservation_id: int, conn: sqlite3.Connection = Depends(get_conn)):
    return reservation_service.get_reservation(conn, reservation_id)


@router.post("/{reservation_id}/cancel", response_model=ReservationOut)
def cancel(reservation_id: int, conn: sqlite3.Connection = Depends(get_conn)):
    return reservation_service.cancel(conn, reservation_id)
