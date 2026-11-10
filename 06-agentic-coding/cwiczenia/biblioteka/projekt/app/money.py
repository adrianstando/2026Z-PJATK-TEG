"""Pomocnicze funkcje do kwot.

W całym systemie kwoty to liczby całkowite w groszach. Złotówki pojawiają się
wyłącznie w tekstach dla ludzi (raporty), nigdy w bazie ani w obliczeniach.
"""


def format_pln(grosze: int) -> str:
    """1250 -> '12,50 zł'."""
    sign = "-" if grosze < 0 else ""
    grosze = abs(grosze)
    return f"{sign}{grosze // 100},{grosze % 100:02d} zł"


def pln_to_grosze(text: str) -> int:
    """'12,50' albo '12.50' -> 1250. Używane tylko przy imporcie starych danych."""
    text = text.strip().replace(" zł", "").replace(",", ".")
    if "." in text:
        whole, frac = text.split(".", 1)
        frac = (frac + "00")[:2]
    else:
        whole, frac = text, "00"
    sign = -1 if whole.startswith("-") else 1
    return sign * (abs(int(whole)) * 100 + int(frac))
