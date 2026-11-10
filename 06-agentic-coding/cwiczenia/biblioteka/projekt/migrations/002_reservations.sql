-- Rezerwacje książek, których wszystkie egzemplarze są wypożyczone.
-- status: active -> fulfilled (czytelnik wypożyczył) albo cancelled.

CREATE TABLE reservations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id     INTEGER NOT NULL REFERENCES books(id),
    member_id   INTEGER NOT NULL REFERENCES members(id),
    created_on  TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'fulfilled', 'cancelled'))
);

CREATE INDEX idx_reservations_book ON reservations(book_id, status);
