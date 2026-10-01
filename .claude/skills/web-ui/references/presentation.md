# Wzorce prezentacji

Strona zajęć to **jednocześnie** prezentacja prowadzącego (projektor, klawiatura) i materiał dla studentów (scroll, telefon).

## Tryb prezentera

- Każda plansza to `<Slide id>` (min. wysokość ekranu, `data-slide`).
- `PresenterKeys`: → ↓ PageDown Spacja = następna, ← ↑ PageUp = poprzednia, F = pełny ekran. Pilot do prezentacji działa od razu, bo wysyła PageUp/PageDown.
- Interaktywne elementy (suwaki, przełączniki) nie przechwytują strzałek poza fokusem.

## Struktura zajęć (90 min)

1. **Hero**: numer zajęć, tytuł, lead, agenda jako chipy.
2. Organizacja (tylko gdy jest co ogłosić).
3. 6–10 plansz merytorycznych: **jedna teza na planszę**.
4. Plansza końcowa: quiz albo zadanie + linki (Colab, notebook).

## Reguły treści

- **Tytuł = teza.** `accent` to 1–3 słowa z gradientem, a `title` resztę zdania. Dobrze: „Płacisz | za tokeny, nie za słowa”. Źle: „Tokenizacja”.
- **Lead**: 1–3 zdania wyjaśnienia, bez list.
- **Pokaż, potem nazwij.** Najpierw wizualizacja albo wynik, potem pojęcie.
- **Kod + wynik obok siebie** (`grid lg:grid-cols-2`): po lewej `CodeBlock` z `highlight` na 1–3 kluczowych liniach, po prawej `Terminal` z prawdziwym outputem.
- **Liczby z prawdziwych uruchomień**, podpisane modelem (`title` w `Terminal`). Dane historyczne z podpisem roku.
- **Pułapki są cenniejsze niż sukcesy.** Jeśli model zwraca złą odpowiedź (Darwin zamiast Newtona), pokaż to w `Callout kind="warning"` i powiedz, na których zajęciach to naprawimy.
- Maks. ~40 słów tekstu ciągłego na planszy, wyłączając kod.

## Responsywność

Projektor 1440×900 i telefon 390×844. Siatki `lg:grid-cols-*` składają się do jednej kolumny, a SVG ma `viewBox` i `w-full`.
