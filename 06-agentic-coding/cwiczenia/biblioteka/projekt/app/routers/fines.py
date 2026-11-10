import sqlite3
from typing import Literal

from fastapi import APIRouter, Depends

from app.db import get_conn
from app.schemas.fines import FineCreate, FineOut, MemberFinesSummary
from app.services import fine_service

router = APIRouter()


@router.post("", response_model=FineOut, status_code=201)
def issue(payload: FineCreate, conn: sqlite3.Connection = Depends(get_conn)):
    """Kara nałożona ręcznie przez bibliotekarza (np. zniszczenie książki)."""
    return fine_service.issue_manual(conn, payload.member_id, payload.amount_grosze, payload.reason)


@router.get("/member/{member_id}", response_model=list[FineOut])
def member_fines(
    member_id: int,
    status: Literal["unpaid", "paid", "waived"] | None = None,
    conn: sqlite3.Connection = Depends(get_conn),
):
    return fine_service.list_for_member(conn, member_id, status)


@router.get("/member/{member_id}/summary", response_model=MemberFinesSummary)
def member_summary(member_id: int, conn: sqlite3.Connection = Depends(get_conn)):
    return fine_service.member_summary(conn, member_id)


@router.get("/{fine_id}", response_model=FineOut)
def get_fine(fine_id: int, conn: sqlite3.Connection = Depends(get_conn)):
    return fine_service.get_fine(conn, fine_id)


@router.post("/{fine_id}/pay", response_model=FineOut)
def pay(fine_id: int, conn: sqlite3.Connection = Depends(get_conn)):
    return fine_service.pay(conn, fine_id)


@router.post("/{fine_id}/waive", response_model=FineOut)
def waive(fine_id: int, conn: sqlite3.Connection = Depends(get_conn)):
    return fine_service.waive(conn, fine_id)
