from conftest import error_code


def _fine(client, member_id, amount=1250, reason="Zniszczona okładka"):
    resp = client.post("/fines", json={"member_id": member_id, "amount_grosze": amount, "reason": reason})
    assert resp.status_code == 201, resp.text
    return resp.json()


def test_manual_fine(client, make_member):
    member = make_member()
    fine = _fine(client, member["id"])
    assert fine["status"] == "unpaid"
    assert fine["loan_id"] is None
    summary = client.get(f"/fines/member/{member['id']}/summary").json()
    assert summary == {"member_id": member["id"], "unpaid_grosze": 1250, "unpaid_pln": "12,50 zł"}


def test_amount_must_be_positive_integer(client, make_member):
    member = make_member()
    for amount in (0, -5, 12.5):
        resp = client.post("/fines", json={"member_id": member["id"], "amount_grosze": amount, "reason": "abc"})
        assert resp.status_code == 422, amount


def test_pay_and_waive(client, make_member):
    member = make_member()
    paid = client.post(f"/fines/{_fine(client, member['id'])['id']}/pay").json()
    assert paid["status"] == "paid" and paid["settled_on"] == "2026-03-02"
    waived = client.post(f"/fines/{_fine(client, member['id'])['id']}/waive").json()
    assert waived["status"] == "waived"
    assert client.get(f"/fines/member/{member['id']}/summary").json()["unpaid_grosze"] == 0


def test_cannot_pay_twice(client, make_member):
    fine = _fine(client, make_member()["id"])
    client.post(f"/fines/{fine['id']}/pay")
    resp = client.post(f"/fines/{fine['id']}/pay")
    assert resp.status_code == 409
    assert error_code(resp) == "fine_already_settled"


def test_overdue_report(client, make_book, make_member, make_loan, travel):
    book = make_book(title="Ferdydurke")
    make_loan(book["id"], make_member(name="Ewa Lis")["id"])
    travel(33)
    report = client.get("/reports/overdue").json()
    assert report == [
        {
            "loan_id": 1,
            "book_title": "Ferdydurke",
            "member_name": "Ewa Lis",
            "due_date": "2026-04-01",
            "days_overdue": 3,
            "expected_fine_grosze": 150,
        }
    ]


def test_fines_report(client, make_member):
    a, b = make_member(), make_member()
    _fine(client, a["id"], 300)
    _fine(client, b["id"], 1000)
    _fine(client, b["id"], 5)
    report = client.get("/reports/fines").json()
    assert report["total_unpaid_grosze"] == 1305
    assert report["total_unpaid_pln"] == "13,05 zł"
    assert [m["member_id"] for m in report["members"]] == [b["id"], a["id"]]


def test_popular_books(client, make_book, make_member, make_loan):
    hit, _ = make_book(title="Hit"), make_book(title="Cisza")
    make_loan(hit["id"], make_member()["id"])
    titles = [row["title"] for row in client.get("/reports/popular", params={"limit": 1}).json()]
    assert titles == ["Hit"]
