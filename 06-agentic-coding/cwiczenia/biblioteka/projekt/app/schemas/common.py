"""Typy wspólne dla schematów."""

from typing import Annotated

from pydantic import Field

# Data jako tekst ISO, np. "2026-03-02".
IsoDate = Annotated[str, Field(pattern=r"^\d{4}-\d{2}-\d{2}$", examples=["2026-03-02"])]

# Kwota w groszach. 1250 = 12,50 zł.
Grosze = Annotated[int, Field(ge=0, examples=[1250])]

PositiveId = Annotated[int, Field(gt=0)]
