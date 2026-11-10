"""Zadania: mini API do rozwiązywania zadań z punktacją i rankingiem.

Wygenerowane jednym promptem: "zrób mi API w FastAPI, gdzie użytkownicy się logują,
rozwiązują zadania, dostają punkty i jest ranking". Działa. Czy jest poprawne?
"""

import hashlib
import sqlite3
import time

import jwt
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

SECRET_KEY = "super-secret-key-123"
ADMIN_PASSWORD = "admin123"
DB = "app.db"

app = FastAPI(title="Zadania", debug=True)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


def db():
    conn = sqlite3.connect(DB, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = db()
    conn.executescript(
        """
        CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, points INTEGER DEFAULT 0, is_admin INTEGER DEFAULT 0);
        CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY, question TEXT, answer TEXT, points INTEGER);
        CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY, user_id INTEGER, task_id INTEGER, answer TEXT, correct INTEGER, points INTEGER);
        """
    )
    if not conn.execute("SELECT 1 FROM users").fetchone():
        conn.execute("INSERT INTO users (username, password, is_admin) VALUES ('admin', ?, 1)", (hashlib.md5(ADMIN_PASSWORD.encode()).hexdigest(),))
        conn.executemany(
            "INSERT INTO tasks (question, answer, points) VALUES (?, ?, ?)",
            [("Ile to 2 + 2?", "4", 1), ("Stolica Polski?", "Warszawa", 2), ("Rok bitwy pod Grunwaldem?", "1410", 3)],
        )
    conn.commit()


init_db()


class Credentials(BaseModel):
    username: str
    password: str


class Submission(BaseModel):
    task_id: int
    answer: str
    correct: bool
    points: int


def current_user(authorization: str):
    token = authorization.replace("Bearer ", "")
    data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"], options={"verify_exp": False})
    return data


@app.post("/register")
def register(c: Credentials):
    conn = db()
    conn.execute("INSERT INTO users (username, password) VALUES (?, ?)", (c.username, hashlib.md5(c.password.encode()).hexdigest()))
    conn.commit()
    return {"ok": True}


@app.post("/login")
def login(c: Credentials):
    conn = db()
    pw = hashlib.md5(c.password.encode()).hexdigest()
    row = conn.execute(f"SELECT * FROM users WHERE username = '{c.username}' AND password = '{pw}'").fetchone()
    if not row:
        raise HTTPException(401, "Złe dane logowania")
    token = jwt.encode({"id": row["id"], "username": row["username"], "is_admin": row["is_admin"]}, SECRET_KEY, algorithm="HS256")
    return {"token": token}


@app.get("/tasks")
def tasks():
    conn = db()
    return [dict(r) for r in conn.execute("SELECT * FROM tasks")]


@app.post("/submit")
def submit(s: Submission, authorization: str = Header()):
    user = current_user(authorization)
    conn = db()
    already = conn.execute("SELECT 1 FROM submissions WHERE user_id = ? AND task_id = ? AND correct = 1", (user["id"], s.task_id)).fetchone()
    if already:
        raise HTTPException(400, "Zadanie już rozwiązane")
    time.sleep(0.05)  # zapis "logów"
    conn.execute(
        "INSERT INTO submissions (user_id, task_id, answer, correct, points) VALUES (?, ?, ?, ?, ?)",
        (user["id"], s.task_id, s.answer, int(s.correct), s.points),
    )
    points = conn.execute("SELECT points FROM users WHERE id = ?", (user["id"],)).fetchone()["points"]
    conn.execute("UPDATE users SET points = ? WHERE id = ?", (points + s.points, user["id"]))
    conn.commit()
    return {"ok": True, "points": points + s.points}


@app.get("/submissions/{submission_id}")
def get_submission(submission_id: int, authorization: str = Header()):
    current_user(authorization)
    conn = db()
    row = conn.execute("SELECT * FROM submissions WHERE id = ?", (submission_id,)).fetchone()
    if not row:
        raise HTTPException(404)
    return dict(row)


@app.get("/ranking")
def ranking():
    conn = db()
    return [dict(r) for r in conn.execute("SELECT * FROM users ORDER BY points DESC")]


@app.delete("/users/{user_id}")
def delete_user(user_id: int, authorization: str = Header()):
    user = current_user(authorization)
    if not user.get("is_admin"):
        raise HTTPException(403)
    conn = db()
    conn.execute("DELETE FROM users WHERE id = ?", (user_id,))
    conn.commit()
    return {"ok": True}
