# API – skrót

| Metoda | Ścieżka | Opis |
|---|---|---|
| GET/POST | `/books` | katalog, dodanie książki (`?q=` szuka w tytule i autorze) |
| GET/PATCH | `/books/{id}` | szczegóły, zmiana tytułu/autora/liczby egzemplarzy |
| GET | `/books/{id}/queue` | kolejka rezerwacji |
| GET/POST | `/members` | czytelnicy, rejestracja |
| POST | `/members/{id}/deactivate` | zamknięcie konta |
| GET | `/members/{id}/loans` | wypożyczenia czytelnika |
| POST | `/loans` | wypożyczenie |
| GET | `/loans/{id}` | szczegóły wypożyczenia |
| POST | `/loans/{id}/return` | zwrot (nalicza karę po terminie) |
| POST | `/reservations` | rezerwacja (tylko gdy brak wolnych egzemplarzy) |
| POST | `/reservations/{id}/cancel` | anulowanie rezerwacji |
| POST | `/fines` | kara ręczna |
| POST | `/fines/{id}/pay`, `/fines/{id}/waive` | opłacenie, umorzenie |
| GET | `/fines/member/{id}`, `/fines/member/{id}/summary` | kary czytelnika |
| GET | `/reports/overdue`, `/reports/fines`, `/reports/popular` | raporty |

Błędy: `{"error": {"code": "...", "message": "..."}}`.
