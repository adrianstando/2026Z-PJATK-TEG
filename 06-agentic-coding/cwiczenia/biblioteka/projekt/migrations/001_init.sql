-- Schemat początkowy: książki, czytelnicy, wypożyczenia.
-- Daty jako TEXT w formacie ISO YYYY-MM-DD.

CREATE TABLE books (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    isbn    TEXT NOT NULL UNIQUE,
    title   TEXT NOT NULL,
    author  TEXT NOT NULL,
    copies  INTEGER NOT NULL CHECK (copies >= 1)
);

CREATE TABLE members (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL UNIQUE,
    joined_on  TEXT NOT NULL,
    active     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE loans (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id      INTEGER NOT NULL REFERENCES books(id),
    member_id    INTEGER NOT NULL REFERENCES members(id),
    loaned_on    TEXT NOT NULL,
    due_date     TEXT NOT NULL,
    returned_on  TEXT
);

CREATE INDEX idx_loans_member ON loans(member_id);
CREATE INDEX idx_loans_book ON loans(book_id);
