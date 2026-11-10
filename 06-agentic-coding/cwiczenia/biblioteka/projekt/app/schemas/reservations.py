from typing import Literal

from pydantic import BaseModel

from app.schemas.common import IsoDate, PositiveId


class ReservationCreate(BaseModel):
    book_id: PositiveId
    member_id: PositiveId


class ReservationOut(BaseModel):
    id: int
    book_id: int
    member_id: int
    created_on: IsoDate
    status: Literal["active", "fulfilled", "cancelled"]
