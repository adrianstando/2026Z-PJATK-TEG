---
name: notebook-format
description: >
  Zasady formatu notebooków Jupyter w tym repo, dzięki którym notebook poprawnie wyświetla się na stronie
  (/notebook/<slug>/) i zasila slajdy prezentacji. Do użycia przy tworzeniu lub zmianie pliku .ipynb
  w folderze zajęć oraz przy diagnozowaniu, dlaczego notebook źle wygląda na stronie.
---

# notebook-format

Strona nie uruchamia notebooków. W czasie builda czyta zapisane w `.ipynb` komórki i ich wyniki:

- `web/src/lib/notebooks.ts` renderuje cały notebook na stronie `/notebook/<slug>/` (oraz `zadanie.ipynb` na `/notebook/<slug>-zadanie/`),
- `web/scripts/sync-notebooks.mjs` wyciąga komórki z tagiem `web:<klucz>` do `web/src/content/generated/<folder>.json`, skąd biorą je slajdy.

Notebook jest więc źródłem prawdy, a to, co widać na stronie, to dokładnie to, co jest zapisane w pliku.

## Pliki i nazwy

- Folder zajęć `NN-slug/` z `notebook.ipynb` (przykłady) i opcjonalnie `zadanie.ipynb`.
- Folder musi być wpisany w `LESSONS` w `web/src/content/course.ts` (pole `folder`); flagi `notebook` i `task` włączają linki na karcie zajęć.

## Struktura

1. **Pierwsza komórka markdown zaczyna się od `# Tytuł`.** Tytuł trafia do nagłówka strony; sam `#` nie jest powtarzany w treści.
2. **Każdy `##` zaczyna nową sekcję**, czyli osobną planszę z nawigacją strzałkami ← →. Nagłówek `##` musi być **pierwszą linią komórki**, bo tekst nad nim trafiłby do nowej sekcji.
3. `###` i niższe nie dzielą na plansze; służą do podziału wewnątrz sekcji.
4. Sekcja to 1 temat: krótki opis, 1–3 komórki kodu, ewentualnie ćwiczenie.

## Markdown

Obsługiwane (GitHub Flavored Markdown): nagłówki, listy, tabele, cytaty `>`, pogrubienie, kursywa, kod w tekście, bloki kodu z językiem, linki, obrazki z adresem `https://`.

Nieobsługiwane, nie używać:

- **LaTeX** (`$...$`, `$$...$$`): wyświetli się jako surowy tekst. Wzory zapisywać zwykłym tekstem (`2 − 2·cos(a, b)`) albo jako kod.
- **HTML w markdownie** (`<br>`, `<div>`, `<img>`): nie jest renderowany.
- **Obrazki z lokalnej ścieżki** (`![](rysunek.png)`): link prowadzi do podglądu na GitHubie, a nie do pliku obrazu. Używać adresu `https://raw.githubusercontent.com/...` albo wygenerować wykres w komórce kodu.

Linki względne (`../00-dostep-do-llm/README.md`, `zadanie.ipynb`) są zamieniane na adresy w repozytorium na GitHubie.

## Komórki kodu i wyniki

- **Notebook commitowany z wynikami**, uruchomiony od góry do dołu w świeżym kernelu:
  ```bash
  jupyter nbconvert --to notebook --execute --inplace NN-slug/notebook.ipynb
  ```
- Wyświetlane typy wyników: tekst (`print`, wartość ostatniego wyrażenia), obrazy PNG/JPEG (wykresy matplotlib), błędy. Kolory ANSI są usuwane.
- Niewyświetlane: wyniki HTML (tabele pandas pokażą się jako tekst), widgety, wykresy interaktywne (plotly, bokeh). Do wykresów matplotlib z `plt.show()`.
- Pusta komórka kodu wyświetla się jako ramka „miejsce na własny kod”; tak oznacza się miejsce na ćwiczenie.
- Długie wyniki są przewijane w oknie o stałej wysokości. Do slajdów wyniki krótkie: kilkanaście linii, bez list setek liczb.
- Wykresy są osadzane w stronie jako obraz; rozmiar umiarkowany (`figsize` do ok. 14×6, domyślne `dpi`).

## Bezpieczeństwo wyników

- Żadnych kluczy API, tokenów ani haseł w kodzie **ani w wynikach** (np. `print(os.getenv(...))`).
- Żadnych ścieżek z dysku autora (`/home/...`, `C:\Users\...`) w wynikach i kodzie.
- Tracebacki tylko tam, gdzie błąd jest celem przykładu.

## Komórki na slajdach (`web:*`)

- Tag w metadanych komórki: `web:<klucz>` (Jupyter i VS Code: *Add Cell Tag*), np. `web:first-call`.
- Lista kluczy wymaganych przez stronę jest w `NOTEBOOKS` w `web/scripts/sync-notebooks.mjs`. **Brak tagu przerywa build**; komórka bez wyniku daje ostrzeżenie.
- Zmiana nazwy tagu wymaga zmiany w skrypcie i na stronie zajęć.
- Komórka `web:setup` drukuje jedną linię w formacie
  `czat: <dostawca> (<model>, klasyczny: <model>) | embeddingi: <dostawca> (<model>)`;
  strona z niej podpisuje wyniki nazwami modeli.
- Komórka pokazywana na slajdzie powinna mieścić się na ekranie: do ok. 25 linii kodu.

## Sprawdzenie

```bash
cd web && npm run sync && npm run dev     # potem /notebook/<slug>/ i strona zajęć
```

Wygenerowanych plików `web/src/content/generated/*.json` nie edytuje się ręcznie.
