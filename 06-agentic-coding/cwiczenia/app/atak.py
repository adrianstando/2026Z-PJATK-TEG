"""Sprawdzenie luk w app.py bez uruchamiania serwera (FastAPI TestClient, świeża baza w katalogu tymczasowym).

Uruchomienie: python atak.py            (sprawdza app.py obok tego pliku)
              python atak.py KATALOG    (sprawdza KATALOG/app.py, np. aplikację napisaną przez agenta)
Każdy wiersz to jeden atak. "LUKA" = atak się udał, "ok" = nie udał się.
Skrypt działa też po poprawkach w app.py (inne pola, walidacja, statusy).
"""

import hashlib
import os
import re
import sys
import tempfile
import warnings
import time
from concurrent.futures import ThreadPoolExecutor

HERE = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
os.chdir(tempfile.mkdtemp())  # app.db powstaje tutaj, nie w repo
os.environ.setdefault("SECRET_KEY", "atak-" + "k" * 40)
os.environ.setdefault("JWT_SECRET", "atak-" + "k" * 40)  # poprawnie wdrożona aplikacja ma klucz w środowisku
warnings.filterwarnings("ignore")

import jwt  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

import app as target  # noqa: E402

client = TestClient(target.app, raise_server_exceptions=False)
client.__enter__()  # uruchamia lifespan/startup aplikacji (tabele, konto admina), jak prawdziwy serwer
PASSWORD = "haslo-12345"


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def user(name):
    client.post("/register", json={"username": name, "password": PASSWORD})
    r = client.post("/login", json={"username": name, "password": PASSWORD})
    if r.status_code == 422:  # logowanie formularzem OAuth2 zamiast JSON
        r = client.post("/login", data={"username": name, "password": PASSWORD})
    body = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
    return body.get("token") or body.get("access_token")


def rows(body):
    """Lista z odpowiedzi: sama lista albo pierwsza lista w słowniku (np. {"ranking": [...]})."""
    if isinstance(body, dict):
        body = next((v for v in body.values() if isinstance(v, list)), [])
    return body


def ranking():
    r = client.get("/ranking")
    if r.status_code in (401, 403):
        r = client.get("/ranking", headers=auth(user("_obserwator")))
    return rows(r.json())


def points(name):
    rows_ = ranking()
    return next((u.get("points") for u in rows_ if u.get("username") == name), None)


def check(name):
    def wrap(fn):
        try:
            ok, detail = fn()
        except Exception as e:  # po poprawkach atak może się wywrócić: to znaczy, że nie zadziałał
            ok, detail = False, f"atak nie przeszedł ({type(e).__name__})"
        print(f"[{'LUKA' if ok else 'ok  '}] {name}: {detail}")
    return wrap


@check("wyciek-odpowiedzi")
def _():
    r = client.get("/tasks")
    who = "bez logowania"
    if r.status_code in (401, 403):
        r, who = client.get("/tasks", headers=auth(user("_obserwator"))), "po zalogowaniu"
    t = rows(r.json())
    return "answer" in t[0], f"GET /tasks {who} -> {t[0]}"


@check("sql-injection")
def _():
    r = client.post("/login", json={"username": "admin' --", "password": "cokolwiek"})
    tok = r.json().get("token") or r.json().get("access_token") if r.status_code == 200 else None
    admin = bool(tok) and bool(jwt.decode(tok, options={"verify_signature": False}).get("is_admin"))
    return admin, f"login jako \"admin' --\" -> HTTP {r.status_code}, admin={admin}"


ala = user("ala")
ola = user("ola")


@check("zaufanie-do-klienta")
def _():
    r = client.post("/submit", json={"task_id": 1, "answer": "5", "correct": True, "points": 1000}, headers=auth(ala))
    p = points("ala")
    return bool(p and p > 0), f"odpowiedź '5' na 2 + 2 (correct=true, points=1000) -> HTTP {r.status_code}, punkty ali: {p}"


@check("race-condition")
def _():
    with ThreadPoolExecutor(10) as ex:
        codes = list(ex.map(lambda _: client.post("/submit", json={"task_id": 3, "answer": "1410", "correct": True, "points": 3}, headers=auth(ola)).status_code, range(10)))
    p = points("ola")
    return bool(p and p > 3), f"10 równoległych poprawnych odpowiedzi, HTTP 200: {codes.count(200)}; punkty za zadanie warte 3: {p}"


@check("idor")
def _():
    r = client.get("/submissions/1", headers=auth(ola))
    body = r.json() if r.status_code == 200 else {}
    return r.status_code == 200, f"ola czyta zgłoszenie 1 (ali) -> HTTP {r.status_code} {body.get('answer', '')!r}"


@check("wyciek-hasel")
def _():
    row = next((u for u in ranking() if u.get("username") in ("admin", "ala")), {})
    leaked = "password" in row
    md5 = row.get("password") == hashlib.md5(b"admin123").hexdigest()
    return leaked, f"ranking zwraca pola {sorted(row)}" + (f"; hasz admina to md5('admin123'): {md5}" if leaked else "")


@check("sekret-w-kodzie")
def _():
    src = open(os.path.join(HERE, "app.py")).read()
    m = re.search(r"""(?:SECRET|KEY)\w*\s*=\s*(?:os\.(?:\w+\.get|getenv)\(\s*["']\w+["']\s*,\s*)?["']([^"']{4,})["']""", src)
    if not m:
        return False, "w app.py nie ma klucza zapisanego na sztywno"
    user("ela")
    victim = next((u for u in ranking() if u.get("username") == "ela"), {})
    vid = victim.get("id", 4)
    for sub in ("1", "admin"):  # różne aplikacje trzymają w "sub" id albo nazwę użytkownika
        claims = {"id": 1, "user_id": 1, "sub": sub, "username": "admin", "is_admin": True, "role": "admin", "exp": int(time.time()) + 600}
        forged = jwt.encode(claims, m.group(1), algorithm="HS256")
        r = client.delete(f"/users/{vid}", headers=auth(forged))
        if r.status_code in (200, 204):
            break
    return r.status_code in (200, 204), f"token admina podpisany kluczem z kodu ({m.group(1)[:12]}…) -> DELETE /users/{vid}: HTTP {r.status_code}"


@check("brak-walidacji")
def _():
    r = client.post("/submit", json={"task_id": 999, "answer": "x" * 1_000_000, "correct": False, "points": -50}, headers=auth(ala))
    return r.status_code == 200, f"task_id=999, odpowiedź 1 MB -> HTTP {r.status_code}"


@check("blad-500-zamiast-401")
def _():
    r = client.get("/submissions/1", headers={"Authorization": "Bearer zly-token"})
    return r.status_code >= 500, f"zły token -> HTTP {r.status_code}"


@check("brak-testow")
def _():
    tests = [f for f in os.listdir(HERE) if f.startswith("test_")]
    return not tests, f"pliki test_*.py: {len(tests)}"
