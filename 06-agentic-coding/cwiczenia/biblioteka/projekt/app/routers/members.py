import sqlite3

from fastapi import APIRouter, Depends

from app.db import get_conn
from app.schemas.loans import LoanOut
from app.schemas.members import MemberCreate, MemberOut
from app.services import loan_service, member_service

router = APIRouter()


@router.get("", response_model=list[MemberOut])
def list_members(active_only: bool = False, conn: sqlite3.Connection = Depends(get_conn)):
    return member_service.list_members(conn, active_only)


@router.post("", response_model=MemberOut, status_code=201)
def register(payload: MemberCreate, conn: sqlite3.Connection = Depends(get_conn)):
    return member_service.register(conn, payload.name, payload.email)


@router.get("/{member_id}", response_model=MemberOut)
def get_member(member_id: int, conn: sqlite3.Connection = Depends(get_conn)):
    return member_service.get_member(conn, member_id)


@router.post("/{member_id}/deactivate", response_model=MemberOut)
def deactivate(member_id: int, conn: sqlite3.Connection = Depends(get_conn)):
    return member_service.deactivate(conn, member_id)


@router.get("/{member_id}/loans", response_model=list[LoanOut])
def member_loans(member_id: int, active_only: bool = False, conn: sqlite3.Connection = Depends(get_conn)):
    return loan_service.list_for_member(conn, member_id, active_only)
