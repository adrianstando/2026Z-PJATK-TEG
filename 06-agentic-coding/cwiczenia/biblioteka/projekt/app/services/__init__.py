"""Logika biznesowa.

Serwisy przyjmują połączenie (`conn`) i zwykłe wartości, sprawdzają reguły,
wołają repozytoria i zwracają słowniki gotowe do schematów wyjściowych.
Naruszenie reguły = wyjątek z `app.errors`. Zapisy w `db.transaction(conn)`.
"""
