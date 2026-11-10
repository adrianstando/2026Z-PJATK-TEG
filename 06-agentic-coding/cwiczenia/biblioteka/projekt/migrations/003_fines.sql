-- Kary. Kwoty w groszach (INTEGER), nigdy REAL.
-- loan_id jest NULL dla kar nałożonych ręcznie (np. zniszczona książka).

CREATE TABLE fines (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id      INTEGER NOT NULL REFERENCES members(id),
    loan_id        INTEGER REFERENCES loans(id),
    amount_grosze  INTEGER NOT NULL CHECK (amount_grosze > 0),
    reason         TEXT NOT NULL,
    issued_on      TEXT NOT NULL,
    status         TEXT NOT NULL DEFAULT 'unpaid'
                   CHECK (status IN ('unpaid', 'paid', 'waived')),
    settled_on     TEXT
);

CREATE INDEX idx_fines_member ON fines(member_id, status);
