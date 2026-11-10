import sqlite3

from fastapi import APIRouter, Depends

from app.db import get_conn
from app.schemas.loans import LoanCreate, LoanOut, ReturnOut
from app.services import loan_service

router = APIRouter()


@router.post("", response_model=LoanOut, status_code=201)
def borrow(payload: LoanCreate, conn: sqlite3.Connection = Depends(get_conn)):
    return loan_service.borrow(conn, payload.book_id, payload.member_id)


@router.get("/{loan_id}", response_model=LoanOut)
def get_loan(loan_id: int, conn: sqlite3.Connection = Depends(get_conn)):
    return loan_service.get_loan(conn, loan_id)


@router.post("/{loan_id}/return", response_model=ReturnOut)
def return_book(loan_id: int, conn: sqlite3.Connection = Depends(get_conn)):
    return loan_service.return_book(conn, loan_id)
