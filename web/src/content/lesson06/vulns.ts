// Objaśnienia luk z app.py dla slajdu „Działa to jeszcze nie znaczy poprawnie”.
// Kod, linie i wyniki ataku pochodzą z web/src/data/lesson06-vulns.json (scripts/lesson06_data.py);
// tutaj tylko tekst: nazwa po ludzku, czym jest pojęcie i dlaczego to problem.

export const VULN_TEXT: Record<string, { title: string; concept: string; why: string }> = {
  "sql-injection": {
    title: "SQL injection w logowaniu",
    concept: "Zapytanie SQL jest sklejane z tekstu wpisanego przez użytkownika. Znak ' kończy napis, a -- zamienia resztę zapytania w komentarz, więc warunek na hasło znika.",
    why: "Login „admin' --” z dowolnym hasłem loguje jako administrator. Zapytanie parametryzowane (?) przekazuje dane osobno od kodu SQL.",
  },
  "sekret-w-kodzie": {
    title: "Sekret zapisany w kodzie",
    concept: "Klucz, którym serwer podpisuje tokeny logowania (JWT), jest wpisany w app.py. Kto zna klucz, może sam wystawić token z dowolną treścią.",
    why: "Każdy z dostępem do repo podpisze token administratora. Klucz ma być długi, losowy i czytany ze zmiennej środowiskowej.",
  },
  konfiguracja: {
    title: "Tryb debug i CORS dla wszystkich",
    concept: "CORS to reguła przeglądarki: decyduje, które inne strony mogą wysyłać żądania do API w imieniu zalogowanego użytkownika. Gwiazdka razem z allow_credentials wpuszcza każdą stronę. debug=True pokazuje szczegóły błędów.",
    why: "Obca strona otwarta w przeglądarce ofiary może wołać API z jej uprawnieniami; komunikaty debug zdradzają budowę aplikacji.",
  },
  "blad-500-zamiast-401": {
    title: "Token bez terminu ważności, błąd 500 zamiast 401",
    concept: "Token logowania powinien mieć pole exp (termin ważności), a zły token powinien dać odpowiedź 401 „nie zalogowano”. Tu token działa wiecznie, a zły token wywraca serwer.",
    why: "Wykradziony token działa zawsze. Błąd 500 przy złym tokenie to sygnał, że obsługa błędów nie istnieje.",
  },
  "wyciek-hasel": {
    title: "Hasła jako MD5 bez soli",
    concept: "Hasz to jednokierunkowy skrót hasła. MD5 liczy się błyskawicznie, a bez soli (losowego dodatku do każdego hasła) to samo hasło ma zawsze ten sam hasz, więc łamie się je gotowymi tablicami.",
    why: "Wyciek bazy = wyciek haseł. Do haseł służą wolne funkcje z solą: scrypt, bcrypt, argon2.",
  },
  "wyciek-odpowiedzi": {
    title: "Odpowiedzi do zadań w GET /tasks",
    concept: "SELECT * zwraca wszystkie kolumny tabeli, także te, których klient nie powinien widzieć.",
    why: "Lista zadań bez logowania zawiera poprawne odpowiedzi. Odpowiedź API buduje się z jawnej listy pól.",
  },
  "zaufanie-do-klienta": {
    title: "Serwer wierzy klientowi",
    concept: "Klient sam przysyła, czy odpowiedź jest poprawna i ile punktów mu się należy. Wszystko, co przychodzi od klienta, można podmienić.",
    why: "Odpowiedź „5” na 2 + 2 z points=1000 daje 1000 punktów. Poprawność i punkty liczy serwer z własnej tabeli.",
  },
  "brak-walidacji": {
    title: "Brak walidacji danych wejściowych",
    concept: "Walidacja to sprawdzenie typu, długości i zakresu danych przed użyciem: czy zadanie istnieje, czy tekst nie ma miliona znaków, czy punkty nie są ujemne.",
    why: "Serwer zapisuje 1 MB śmieci do nieistniejącego zadania. Limity w modelu Pydantic (max_length, ge) zatrzymują to na wejściu.",
  },
  "race-condition": {
    title: "Race condition: wyścig równoległych żądań",
    concept: "Kod najpierw sprawdza „czy zadanie już rozwiązane”, a potem zapisuje wynik. Dziesięć żądań wysłanych naraz przechodzi sprawdzenie, zanim którekolwiek zapisze wynik.",
    why: "Zadanie warte 3 punkty daje 30. „Tylko raz” musi wymuszać baza (UNIQUE), a punkty zwiększa jedno atomowe UPDATE.",
  },
  idor: {
    title: "IDOR: dostęp do cudzych rekordów",
    concept: "IDOR (insecure direct object reference): endpoint zwraca rekord po numerze z adresu i nie sprawdza, czy należy do zalogowanego użytkownika.",
    why: "Ola czyta zgłoszenia Ali, zmieniając liczbę w adresie. Zapytanie musi zawierać AND user_id = ? z tokenu.",
  },
  "wyciek-hasel-ranking": {
    title: "Ranking z haszami haseł",
    concept: "Publiczny endpoint zwraca cały wiersz użytkownika, razem z kolumnami password i is_admin.",
    why: "Każdy odwiedzający pobiera hasze haseł i wie, kto jest administratorem.",
  },
  "brak-testow": {
    title: "Brak testów",
    concept: "Test automatyczny sprawdza regułę za każdym razem, gdy zmienia się kod: na przykład że cudze zgłoszenie daje 404.",
    why: "Bez testów nikt nie wie, czy poprawka jednej luki nie otworzyła innej. Agent też nie ma czym sprawdzić swojej pracy.",
  },
};
