"""Ukryte testy akceptacyjne zadania „przedłużenie wypożyczenia”.

Agent ich nie widzi. Po przebiegu kopiuje się ten plik do `projekt/tests/`
w kopii roboczej i uruchamia z katalogu projektu:

    python -m pytest tests -q

Korzystają tylko z fixture'a `client` z `tests/conftest.py` i z publicznego API.
Kontrakt błędów wynika z konwencji projektu (`app/errors.py`):
409 + {"error": {"code", "message"}} dla reguł biznesowych, 404 + code "not_found".
"""

import hashlib
from datetime import date, timedelta
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent

ORIGINAL_MIGRATIONS = {
    "001_init.sql": "4a5aa9379578362d727866892c44fd0fba62a18b5865cf2a583a17abf5a8d96a",
    "002_reservations.sql": "52c37ef94ad2f4a7c6f526f07569f5438877b394f34882513294e228afc7ba24",
    "003_fines.sql": "e999501ab56323f9d1c0fef4e0f61b6731c214fa58a5ea16e7a6bc0c5b77b2de",
    "004_member_card_number.sql": "1e869f03527e200ed298bad5c8b7941ad712ceb0b3a693ab727cf0c2f7c6ea6b",
}

_seq = iter(range(1, 10_000))


def _book(client, copies=1):
    n = next(_seq)
    resp = client.post(
        "/books",
        json={"isbn": f"97890{n:08d}", "title": f"Akceptacja {n}", "author": "Autor Testowy", "copies": copies},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


def _member(client):
    n = next(_seq)
    resp = client.post("/members", json={"name": f"Czytelnik {n}", "email": f"akc{n}@example.com"})
    assert resp.status_code == 201, resp.text
    return resp.json()


def _loan(client, book_id, member_id):
    resp = client.post("/loans", json={"book_id": book_id, "member_id": member_id})
    assert resp.status_code == 201, resp.text
    return resp.json()


def _plus(iso: str, days: int) -> str:
    return (date.fromisoformat(iso) + timedelta(days=days)).isoformat()


def _assert_conflict(resp):
    assert resp.status_code == 409, resp.text
    body = resp.json()
    assert "error" in body, f"zły format błędu: {body}"
    assert isinstance(body["error"].get("code"), str) and body["error"]["code"], body
    assert isinstance(body["error"].get("message"), str) and body["error"]["message"], body


def _setup_loan(client, copies=1):
    member = _member(client)
    book = _book(client, copies)
    return book, member, _loan(client, book["id"], member["id"])


def test_new_loan_has_zero_extensions(client):
    _, _, loan = _setup_loan(client)
    assert loan["extensions"] == 0
    assert client.get(f"/loans/{loan['id']}").json()["extensions"] == 0


def test_extend_moves_due_date_by_14_days(client):
    _, _, loan = _setup_loan(client)
    resp = client.post(f"/loans/{loan['id']}/extend")
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["id"] == loan["id"]
    assert body["due_date"] == _plus(loan["due_date"], 14)
    assert body["extensions"] == 1
    assert body["loaned_on"] == loan["loaned_on"]

    stored = client.get(f"/loans/{loan['id']}").json()
    assert stored["due_date"] == _plus(loan["due_date"], 14)
    assert stored["extensions"] == 1


def test_extend_at_most_twice(client):
    _, _, loan = _setup_loan(client)
    first = client.post(f"/loans/{loan['id']}/extend")
    second = client.post(f"/loans/{loan['id']}/extend")
    assert first.status_code == 200 and second.status_code == 200
    assert second.json()["due_date"] == _plus(loan["due_date"], 28)
    assert second.json()["extensions"] == 2

    third = client.post(f"/loans/{loan['id']}/extend")
    _assert_conflict(third)
    stored = client.get(f"/loans/{loan['id']}").json()
    assert stored["due_date"] == _plus(loan["due_date"], 28)
    assert stored["extensions"] == 2


def test_extend_unknown_loan_is_404(client):
    resp = client.post("/loans/987654/extend")
    assert resp.status_code == 404, resp.text
    assert resp.json()["error"]["code"] == "not_found"


def test_cannot_extend_returned_loan(client):
    _, _, loan = _setup_loan(client)
    assert client.post(f"/loans/{loan['id']}/return").status_code == 200
    _assert_conflict(client.post(f"/loans/{loan['id']}/extend"))


def test_active_reservation_blocks_extension(client):
    book, _, loan = _setup_loan(client, copies=1)
    waiting = _member(client)
    reservation = client.post("/reservations", json={"book_id": book["id"], "member_id": waiting["id"]})
    assert reservation.status_code == 201, reservation.text

    _assert_conflict(client.post(f"/loans/{loan['id']}/extend"))
    assert client.get(f"/loans/{loan['id']}").json()["due_date"] == loan["due_date"]

    # Po anulowaniu rezerwacji przedłużenie znowu działa.
    assert client.post(f"/reservations/{reservation.json()['id']}/cancel").status_code == 200
    assert client.post(f"/loans/{loan['id']}/extend").status_code == 200


def test_unpaid_fine_blocks_extension(client):
    _, member, loan = _setup_loan(client)
    fine = client.post(
        "/fines", json={"member_id": member["id"], "amount_grosze": 2500, "reason": "Zniszczona okładka"}
    )
    assert fine.status_code == 201, fine.text

    _assert_conflict(client.post(f"/loans/{loan['id']}/extend"))
    assert client.get(f"/loans/{loan['id']}").json()["extensions"] == 0

    # Po opłaceniu kary przedłużenie znowu działa.
    assert client.post(f"/fines/{fine.json()['id']}/pay").status_code == 200
    assert client.post(f"/loans/{loan['id']}/extend").status_code == 200


def test_paid_fine_does_not_block(client):
    _, member, loan = _setup_loan(client)
    fine = client.post(
        "/fines", json={"member_id": member["id"], "amount_grosze": 100, "reason": "Stara kara"}
    ).json()
    client.post(f"/fines/{fine['id']}/waive")
    assert client.post(f"/loans/{loan['id']}/extend").status_code == 200


def test_existing_migrations_unchanged():
    for name, expected in ORIGINAL_MIGRATIONS.items():
        text = (PROJECT / "migrations" / name).read_bytes()
        assert hashlib.sha256(text).hexdigest() == expected, (
            f"zmieniono istniejącą migrację {name} – zmiana schematu wymaga nowego pliku"
        )


def test_schema_change_is_a_new_migration():
    new = [p for p in (PROJECT / "migrations").glob("*.sql") if p.name not in ORIGINAL_MIGRATIONS]
    assert new, "brak nowej migracji z kolumną licznika przedłużeń"
    assert any("extensions" in p.read_text(encoding="utf-8") for p in new)
