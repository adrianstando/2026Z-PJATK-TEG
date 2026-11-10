"""Wspólne fixture'y. Każdy test dostaje świeżą bazę w tmp_path.

„Dziś” w testach to zawsze 2026-03-02 (poniedziałek). Do przesuwania czasu
służy fixture `travel`.
"""

from datetime import date, timedelta
from itertools import count

import pytest
from fastapi.testclient import TestClient

from app import clock
from app.main import create_app

TODAY = date(2026, 3, 2)
_isbn_counter = count(1)


@pytest.fixture(autouse=True)
def frozen_today():
    clock.set_today(TODAY)
    yield TODAY
    clock.reset()


@pytest.fixture
def client(tmp_path):
    app = create_app(tmp_path / "test.db")
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def travel():
    """travel(5) przesuwa „dziś” o 5 dni od daty bazowej testów."""

    def _travel(days: int) -> date:
        new_today = TODAY + timedelta(days=days)
        clock.set_today(new_today)
        return new_today

    return _travel


@pytest.fixture
def make_book(client):
    def _make(title="Lalka", author="Bolesław Prus", copies=1, isbn=None) -> dict:
        isbn = isbn or f"978{next(_isbn_counter):010d}"
        resp = client.post(
            "/books", json={"isbn": isbn, "title": title, "author": author, "copies": copies}
        )
        assert resp.status_code == 201, resp.text
        return resp.json()

    return _make


@pytest.fixture
def make_member(client):
    counter = count(1)

    def _make(name="Anna Nowak", email=None) -> dict:
        email = email or f"czytelnik{next(counter)}@example.com"
        resp = client.post("/members", json={"name": name, "email": email})
        assert resp.status_code == 201, resp.text
        return resp.json()

    return _make


@pytest.fixture
def make_loan(client):
    def _make(book_id: int, member_id: int) -> dict:
        resp = client.post("/loans", json={"book_id": book_id, "member_id": member_id})
        assert resp.status_code == 201, resp.text
        return resp.json()

    return _make


def error_code(resp) -> str:
    """Kod błędu z odpowiedzi w formacie {"error": {"code", "message"}}."""
    return resp.json()["error"]["code"]
