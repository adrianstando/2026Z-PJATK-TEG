# Notatki z wdrożenia (2023)

Spisane po przepisaniu wypożyczalni z wersji 1 (`legacy/`). Część rzeczy
może być nieaktualna.

## API

- Błędy zwracamy przez `HTTPException(status_code=400, detail="...")`.
  Front wyświetla pole `detail`.
- Ścieżki definiujemy w routerach w pełnej postaci, np. `@router.get("/books/{id}")`.
- Nowy moduł = nowy plik w `app/routers/`, FastAPI sam go znajdzie.

## Baza

- Schemat jest w `migrations/001_init.sql`. Jak trzeba dodać kolumnę, dopisujemy
  ją tam i usuwamy lokalny plik `library.db`.
- Kary trzymamy w złotówkach (REAL), zaokrąglamy do 2 miejsc przy wyświetlaniu.

## Plany

- Przedłużanie wypożyczeń jak w v1: +7 dni od dnia przedłużenia, bez limitu
  (zob. `legacy/library_v1.py::extend_loan`).
- Powiadomienia e-mail o zbliżającym się terminie.

## Testy

    pytest
