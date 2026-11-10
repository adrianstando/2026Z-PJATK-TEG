"""Dostęp do bazy. Jedyne miejsce w aplikacji, w którym jest SQL.

Funkcje przyjmują połączenie jako pierwszy argument, zwracają `dict`
(albo `None`, gdy nie ma wiersza) i nie zgłaszają błędów domenowych –
to zadanie serwisów. Repozytoria nie otwierają transakcji.
"""

import sqlite3


def row_to_dict(row: sqlite3.Row | None) -> dict | None:
    return dict(row) if row is not None else None


def rows_to_dicts(rows: list[sqlite3.Row]) -> list[dict]:
    return [dict(r) for r in rows]
