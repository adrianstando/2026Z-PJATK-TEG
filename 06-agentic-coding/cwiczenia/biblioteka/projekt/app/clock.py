"""Jedyne źródło „dzisiejszej daty” w aplikacji.

Daty przechowujemy i zwracamy jako tekst ISO `YYYY-MM-DD`.
Nie wywołuj `date.today()` ani `datetime.now()` poza tym modułem:
testy ustawiają datę przez `set_today()`.
"""

from datetime import date, timedelta

_override: date | None = None


def today() -> date:
    """Zwraca dzisiejszą datę (albo datę ustawioną w testach)."""
    return _override or date.today()


def today_iso() -> str:
    return to_iso(today())


def set_today(value: date) -> None:
    """Ustawia sztuczną datę (tylko testy i skrypty)."""
    global _override
    _override = value


def reset() -> None:
    global _override
    _override = None


def to_iso(value: date) -> str:
    return value.isoformat()


def parse_iso(value: str) -> date:
    return date.fromisoformat(value)


def add_days(iso_value: str, days: int) -> str:
    """Przesuwa datę ISO o podaną liczbę dni i zwraca ją jako ISO."""
    return to_iso(parse_iso(iso_value) + timedelta(days=days))


def days_between(start_iso: str, end_iso: str) -> int:
    """Liczba dni od `start_iso` do `end_iso` (ujemna, gdy end jest wcześniej)."""
    return (parse_iso(end_iso) - parse_iso(start_iso)).days
