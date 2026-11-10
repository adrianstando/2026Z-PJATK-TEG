"""Szuka zapytań SQL sklejanych z napisów (f-string, +, %, .format) w plikach .py.

Uruchomienie: python .claude/skills/secure-api/scripts/find_raw_sql.py [katalog]
Wynik: plik:linia i fragment; kod wyjścia 1, gdy coś znaleziono.
"""

import pathlib
import re
import sys

SQL = re.compile(r"\b(SELECT\s.+\sFROM|INSERT\s+INTO|UPDATE\s+\w+\s+SET|DELETE\s+FROM)\b", re.I)
RAW = re.compile(r"""f["'].*\{|["']\s*\+|%\s*\(|\.format\(""")

root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".")
hits = 0
for f in sorted(root.rglob("*.py")):
    if ".claude" in f.parts:
        continue
    for i, line in enumerate(f.read_text().splitlines(), 1):
        if SQL.search(line) and RAW.search(line):
            print(f"{f}:{i}: {line.strip()[:100]}")
            hits += 1
sys.exit(1 if hits else 0)
