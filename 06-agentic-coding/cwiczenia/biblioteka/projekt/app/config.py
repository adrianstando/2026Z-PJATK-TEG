"""Ustawienia domenowe wypożyczalni.

Wszystkie kwoty są w groszach (int), wszystkie okresy w dniach.
Nie wpisuj tych liczb na sztywno w serwisach – importuj je stąd.
"""

import os

# Wypożyczenia
LOAN_PERIOD_DAYS = 30
MAX_ACTIVE_LOANS = 5

# Kary za przetrzymanie
FINE_PER_DAY_GROSZE = 50
MAX_FINE_PER_LOAN_GROSZE = 5000

# Książki
MAX_COPIES_PER_TITLE = 50

# Baza danych (w testach podawana jawnie do create_app)
DEFAULT_DB_PATH = os.environ.get("LIBRARY_DB", "library.db")
