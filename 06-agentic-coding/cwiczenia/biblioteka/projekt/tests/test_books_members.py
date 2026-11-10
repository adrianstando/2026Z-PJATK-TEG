from conftest import error_code


def test_add_and_get_book(client, make_book):
    book = make_book(title="Pan Tadeusz", author="Adam Mickiewicz", copies=3)
    assert book["available"] == 3

    resp = client.get(f"/books/{book['id']}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Pan Tadeusz"


def test_duplicate_isbn_is_conflict(client, make_book):
    make_book(isbn="9788324631766")
    resp = client.post(
        "/books", json={"isbn": "9788324631766", "title": "X", "author": "Y", "copies": 1}
    )
    assert resp.status_code == 409
    assert error_code(resp) == "isbn_taken"


def test_invalid_isbn_uses_error_envelope(client):
    resp = client.post("/books", json={"isbn": "123", "title": "X", "author": "Y"})
    assert resp.status_code == 422
    assert error_code(resp) == "invalid_input"


def test_unknown_book_is_404(client):
    resp = client.get("/books/999")
    assert resp.status_code == 404
    assert error_code(resp) == "not_found"


def test_search_books(client, make_book):
    make_book(title="Lalka", author="Bolesław Prus")
    make_book(title="Quo vadis", author="Henryk Sienkiewicz")
    resp = client.get("/books", params={"q": "sienk"})
    assert [b["title"] for b in resp.json()] == ["Quo vadis"]


def test_cannot_reduce_copies_below_loaned(client, make_book, make_member, make_loan):
    book = make_book(copies=2)
    make_loan(book["id"], make_member()["id"])
    make_loan(book["id"], make_member()["id"])
    resp = client.patch(f"/books/{book['id']}", json={"copies": 1})
    assert resp.status_code == 409
    assert error_code(resp) == "copies_below_loaned"


def test_register_member(client, make_member, frozen_today):
    member = make_member(name="Jan Kowalski", email="Jan@Example.com")
    assert member["email"] == "jan@example.com"
    assert member["card_number"] == f"K-{member['id']:06d}"
    assert member["joined_on"] == frozen_today.isoformat()
    assert member["active"] is True


def test_duplicate_email(client, make_member):
    make_member(email="a@example.com")
    resp = client.post("/members", json={"name": "Inna Osoba", "email": "a@example.com"})
    assert resp.status_code == 409
    assert error_code(resp) == "email_taken"


def test_deactivate_requires_returned_books(client, make_book, make_member, make_loan):
    member = make_member()
    make_loan(make_book()["id"], member["id"])
    resp = client.post(f"/members/{member['id']}/deactivate")
    assert resp.status_code == 409
    assert error_code(resp) == "member_has_active_loans"


def test_deactivate(client, make_member):
    member = make_member()
    resp = client.post(f"/members/{member['id']}/deactivate")
    assert resp.status_code == 200
    assert resp.json()["active"] is False
