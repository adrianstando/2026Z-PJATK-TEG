"""Moduł wypożyczeń (wersja 1).

Jeden plik: dostęp do bazy, reguły i formatowanie. Kwoty w złotówkach,
daty w formacie DD.MM.RRRR.
"""

import sqlite3
from datetime import datetime, timedelta

DB = "biblioteka_v1.db"
FINE_PER_DAY = 0.10  # zł za dzień
LOAN_DAYS = 21
EXTEND_DAYS = 7


def _conn():
    conn = sqlite3.connect(DB)
    conn.row_factory = sqlite3.Row
    return conn


def _parse(d):
    return datetime.strptime(d, "%d.%m.%Y")


def _fmt(d):
    return d.strftime("%d.%m.%Y")


def calculate_fine(days_late):
    if days_late <= 0:
        return 0.0
    return days_late * FINE_PER_DAY


def borrow(book_id, member_id):
    conn = _conn()
    now = datetime.now()
    conn.execute(
        "INSERT INTO wypozyczenia (ksiazka, czytelnik, od, do) VALUES (?, ?, ?, ?)",
        (book_id, member_id, _fmt(now), _fmt(now + timedelta(days=LOAN_DAYS))),
    )
    conn.commit()


def extend_loan(loan_id, days=EXTEND_DAYS):
    """Przedłuża wypożyczenie od dzisiaj. Bez limitu przedłużeń."""
    conn = _conn()
    row = conn.execute("SELECT * FROM wypozyczenia WHERE id = ?", (loan_id,)).fetchone()
    if row is None:
        return {"ok": False, "blad": "brak wypożyczenia"}, 400
    new_due = datetime.now() + timedelta(days=days)
    conn.execute("UPDATE wypozyczenia SET do = ? WHERE id = ?", (_fmt(new_due), loan_id))
    conn.commit()
    return {"ok": True, "do": _fmt(new_due)}, 200


def give_back(loan_id):
    conn = _conn()
    row = conn.execute("SELECT * FROM wypozyczenia WHERE id = ?", (loan_id,)).fetchone()
    if row is None:
        return {"ok": False, "blad": "brak wypożyczenia"}, 400
    late = (datetime.now() - _parse(row["do"])).days
    fine = calculate_fine(late)
    if fine:
        conn.execute(
            "INSERT INTO kary (czytelnik, kwota) VALUES (?, ?)", (row["czytelnik"], round(fine, 2))
        )
    conn.execute("DELETE FROM wypozyczenia WHERE id = ?", (loan_id,))
    conn.commit()
    return {"ok": True, "kara": f"{fine:.2f} zł"}, 200
