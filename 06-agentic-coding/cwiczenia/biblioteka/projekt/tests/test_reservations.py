from conftest import error_code


def _reserve(client, book_id, member_id):
    return client.post("/reservations", json={"book_id": book_id, "member_id": member_id})


def test_cannot_reserve_available_book(client, make_book, make_member):
    resp = _reserve(client, make_book()["id"], make_member()["id"])
    assert resp.status_code == 409
    assert error_code(resp) == "book_available"


def test_reserve_when_all_copies_loaned(client, make_book, make_member, make_loan):
    book = make_book(copies=1)
    make_loan(book["id"], make_member()["id"])
    resp = _reserve(client, book["id"], make_member()["id"])
    assert resp.status_code == 201
    assert resp.json()["status"] == "active"


def test_cannot_reserve_twice(client, make_book, make_member, make_loan):
    book = make_book()
    make_loan(book["id"], make_member()["id"])
    member = make_member()
    _reserve(client, book["id"], member["id"])
    assert error_code(_reserve(client, book["id"], member["id"])) == "already_reserved"


def test_returned_copy_is_held_for_queue(client, make_book, make_member, make_loan):
    book = make_book()
    loan = make_loan(book["id"], make_member()["id"])
    waiting = make_member()
    _reserve(client, book["id"], waiting["id"])
    client.post(f"/loans/{loan['id']}/return")

    other = client.post("/loans", json={"book_id": book["id"], "member_id": make_member()["id"]})
    assert other.status_code == 409
    assert error_code(other) == "book_reserved"

    mine = client.post("/loans", json={"book_id": book["id"], "member_id": waiting["id"]})
    assert mine.status_code == 201
    assert client.get(f"/books/{book['id']}/queue").json() == []


def test_cancel_reservation(client, make_book, make_member, make_loan):
    book = make_book()
    make_loan(book["id"], make_member()["id"])
    reservation = _reserve(client, book["id"], make_member()["id"]).json()
    resp = client.post(f"/reservations/{reservation['id']}/cancel")
    assert resp.json()["status"] == "cancelled"
    again = client.post(f"/reservations/{reservation['id']}/cancel")
    assert again.status_code == 409
    assert error_code(again) == "reservation_not_active"
