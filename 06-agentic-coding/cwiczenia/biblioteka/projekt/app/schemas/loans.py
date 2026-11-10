from pydantic import BaseModel

from app.schemas.common import Grosze, IsoDate, PositiveId


class LoanCreate(BaseModel):
    book_id: PositiveId
    member_id: PositiveId


class LoanOut(BaseModel):
    id: int
    book_id: int
    member_id: int
    loaned_on: IsoDate
    due_date: IsoDate
    returned_on: IsoDate | None = None


class ReturnOut(BaseModel):
    loan: LoanOut
    fine_grosze: Grosze


class OverdueItem(BaseModel):
    loan_id: int
    book_title: str
    member_name: str
    due_date: IsoDate
    days_overdue: int
    expected_fine_grosze: Grosze
