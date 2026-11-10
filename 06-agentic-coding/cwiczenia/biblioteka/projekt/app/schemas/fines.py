from typing import Literal

from pydantic import BaseModel, Field

from app.schemas.common import Grosze, IsoDate, PositiveId


class FineCreate(BaseModel):
    member_id: PositiveId
    amount_grosze: Grosze = Field(gt=0)
    reason: str = Field(min_length=3, max_length=300)


class FineOut(BaseModel):
    id: int
    member_id: int
    loan_id: int | None
    amount_grosze: Grosze
    reason: str
    issued_on: IsoDate
    status: Literal["unpaid", "paid", "waived"]
    settled_on: IsoDate | None = None


class MemberFinesSummary(BaseModel):
    member_id: int
    unpaid_grosze: Grosze
    unpaid_pln: str


class FinesReport(BaseModel):
    total_unpaid_grosze: Grosze
    total_unpaid_pln: str
    members: list[MemberFinesSummary]
