from conftest import error_code


def test_borrow_sets_due_date(client, make_book, make_member, make_loan):
    loan = make_loan(make_book()["id"], make_member()["id"])
    assert loan["loaned_on"] == "2026-03-02"
    assert loan["due_date"] == "2026-04-01"
    assert loan["returned_on"] is None


def test_borrow_reduces_availability(client, make_book, make_member, make_loan):
    book = make_book(copies=2)
    make_loan(book["id"], make_member()["id"])
    assert client.get(f"/books/{book['id']}").json()["available"] == 1


def test_no_free_copies(client, make_book, make_member, make_loan):
    book = make_book(copies=1)
    make_loan(book["id"], make_member()["id"])
    resp = client.post("/loans", json={"book_id": book["id"], "member_id": make_member()["id"]})
    assert resp.status_code == 409
    assert error_code(resp) == "book_unavailable"


def test_same_book_twice(client, make_book, make_member, make_loan):
    book = make_book(copies=2)
    member = make_member()
    make_loan(book["id"], member["id"])
    resp = client.post("/loans", json={"book_id": book["id"], "member_id": member["id"]})
    assert error_code(resp) == "already_borrowed"


def test_loan_limit(client, make_book, make_member, make_loan):
    member = make_member()
    for _ in range(5):
        make_loan(make_book()["id"], member["id"])
    resp = client.post("/loans", json={"book_id": make_book()["id"], "member_id": member["id"]})
    assert resp.status_code == 409
    assert error_code(resp) == "loan_limit_reached"


def test_unpaid_fines_block_borrowing(client, make_book, make_member):
    member = make_member()
    client.post("/fines", json={"member_id": member["id"], "amount_grosze": 300, "reason": "Zalana okładka"})
    resp = client.post("/loans", json={"book_id": make_book()["id"], "member_id": member["id"]})
    assert resp.status_code == 409
    assert error_code(resp) == "member_has_unpaid_fines"


def test_unknown_member_is_404(client, make_book):
    resp = client.post("/loans", json={"book_id": make_book()["id"], "member_id": 77})
    assert resp.status_code == 404
    assert error_code(resp) == "not_found"


def test_return_on_time(client, make_book, make_member, make_loan, travel):
    loan = make_loan(make_book()["id"], make_member()["id"])
    travel(30)
    resp = client.post(f"/loans/{loan['id']}/return")
    assert resp.status_code == 200
    body = resp.json()
    assert body["loan"]["returned_on"] == "2026-04-01"
    assert body["fine_grosze"] == 0


def test_late_return_creates_fine(client, make_book, make_member, make_loan, travel):
    member = make_member()
    loan = make_loan(make_book()["id"], member["id"])
    travel(34)  # 4 dni po terminie
    body = client.post(f"/loans/{loan['id']}/return").json()
    assert body["fine_grosze"] == 200
    fines = client.get(f"/fines/member/{member['id']}").json()
    assert [(f["amount_grosze"], f["loan_id"]) for f in fines] == [(200, loan["id"])]


def test_fine_is_capped(client, make_book, make_member, make_loan, travel):
    loan = make_loan(make_book()["id"], make_member()["id"])
    travel(400)
    assert client.post(f"/loans/{loan['id']}/return").json()["fine_grosze"] == 5000


def test_double_return(client, make_book, make_member, make_loan):
    loan = make_loan(make_book()["id"], make_member()["id"])
    client.post(f"/loans/{loan['id']}/return")
    resp = client.post(f"/loans/{loan['id']}/return")
    assert resp.status_code == 409
    assert error_code(resp) == "loan_already_returned"


def test_member_loans(client, make_book, make_member, make_loan):
    member = make_member()
    first = make_loan(make_book()["id"], member["id"])
    make_loan(make_book()["id"], member["id"])
    client.post(f"/loans/{first['id']}/return")
    resp = client.get(f"/members/{member['id']}/loans", params={"active_only": True})
    assert len(resp.json()) == 1
