from pydantic import BaseModel, Field

from app import config


class BookCreate(BaseModel):
    isbn: str = Field(pattern=r"^(97[89])?\d{9}[\dX]$", examples=["9788324631766"])
    title: str = Field(min_length=1, max_length=300)
    author: str = Field(min_length=1, max_length=200)
    copies: int = Field(default=1, ge=1, le=config.MAX_COPIES_PER_TITLE)


class BookUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    author: str | None = Field(default=None, min_length=1, max_length=200)
    copies: int | None = Field(default=None, ge=1, le=config.MAX_COPIES_PER_TITLE)


class BookOut(BaseModel):
    id: int
    isbn: str
    title: str
    author: str
    copies: int
    available: int
