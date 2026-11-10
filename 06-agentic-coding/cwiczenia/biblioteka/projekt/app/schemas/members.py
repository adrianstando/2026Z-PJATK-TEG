from pydantic import BaseModel, Field

from app.schemas.common import IsoDate


class MemberCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[a-z]{2,}$")


class MemberOut(BaseModel):
    id: int
    name: str
    email: str
    card_number: str
    joined_on: IsoDate
    active: bool
