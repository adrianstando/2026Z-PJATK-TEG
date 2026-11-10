-- Numer karty bibliotecznej nadawany przy rejestracji (format K-000123).
-- Starsze konta dostają numer wyliczony z id.

ALTER TABLE members ADD COLUMN card_number TEXT;

UPDATE members SET card_number = printf('K-%06d', id) WHERE card_number IS NULL;
