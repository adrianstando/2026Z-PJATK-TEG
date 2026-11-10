import sqlite3

from fastapi import APIRouter, Depends, Query

from app.db import get_conn
from app.schemas.fines import FinesReport
from app.schemas.loans import OverdueItem
from app.services import report_service

router = APIRouter()


@router.get("/overdue", response_model=list[OverdueItem])
def overdue(conn: sqlite3.Connection = Depends(get_conn)):
    return report_service.overdue(conn)


@router.get("/fines", response_model=FinesReport)
def fines(conn: sqlite3.Connection = Depends(get_conn)):
    return report_service.fines(conn)


@router.get("/popular")
def popular(limit: int = Query(default=10, ge=1, le=100), conn: sqlite3.Connection = Depends(get_conn)):
    return report_service.popular(conn, limit)
