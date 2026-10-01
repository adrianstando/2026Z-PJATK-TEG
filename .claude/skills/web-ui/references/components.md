# Komponenty: atomic design

Atomic design (Brad Frost) to podział UI na poziomy. Każdy poziom składa się **tylko** z poziomów niższych. To porządek, który agent kodujący łatwo utrzymuje: wie, gdzie szukać i gdzie dopisać.

```
atomy        components/ui/         nie znają domeny, 1 element HTML + style
molekuły     components/molecules/  kilka atomów = jedna funkcja (blok kodu, karta)
organizmy    components/viz/        samodzielne sekcje: wizualizacje, nawigacja, hero
             components/site/
             components/lesson/
szablony     components/site/Slide  szkielet planszy
strony       app/**/page.tsx        tylko składanie organizmów + treść
```

## Atomy (`components/ui`)

| Komponent | Kiedy |
|---|---|
| `Badge` (`tone`: neutral/brand/hit/miss/focus) | status, typ aktywności, krótka etykieta |
| `Button` (`variant`: primary/ghost, `asChild`) | akcja; `asChild` + `<Link>`/`<a>` do nawigacji (Radix Slot) |
| `Panel` | każdy „szklany” prostokąt: tło kart, okien, wizualizacji |
| `Eyebrow` | nadtytuł sekcji, zawsze mono i uppercase |
| `Kbd` | skrót klawiszowy |

## Molekuły (`components/molecules`)

| Komponent | Kiedy |
|---|---|
| `SectionHeading` | **każda** sekcja zaczyna się od niego |
| `CodeBlock` (async, serwerowy) | kod; `highlight={[n]}` wskazuje linie (od 1) |
| `CodeTabs` | ten sam przykład w kilku wariantach (Radix Tabs, pigułka z `layoutId`) |
| `Terminal` | wynik komórki; linie dopisują się po wejściu w kadr; `wrap={false}` dla tabel |
| `Callout` (`insight` / `warning`) | jedna myśl do zapamiętania albo pułapka; max 1 na slajd |
| `LessonCard` | kafelek zajęć na stronie głównej |
| `Markdown` | README z repo w stylu strony (jedno źródło prawdy) |
| `notebook/NotebookView` | notebook `.ipynb` sekcja po sekcji: markdown, kod, zapisane wyniki, wykresy |

## Organizmy

| Komponent | Co pokazuje |
|---|---|
| `viz/SamplingViz` | proces generowania: temperatura → top-k → top-p → losowanie, tabela kolejnych generowań |
| `viz/TokenizerViz` | tekst pocięty prawdziwym tokenizerem (Radix ToggleGroup) |
| `viz/EmbeddingSpace` | słowa w 2D (t-SNE), sąsiedzi liczeni na pełnych wektorach |
| `viz/VectorSpace3D` | dwa wektory w 3D (rzut prostokątny, obracana kamera) i cztery miary: cosinus, iloczyn, L2, L1 |
| `viz/VectorSearchViz` | zapytanie → skan wszystkich wektorów → top-k (liczone na żywo) |
| `viz/ContextSpace` | kot / pies / kotek w kontekstach, dwa modele; trójkąt z dokładnymi odległościami (twierdzenie cosinusów) |
| `viz/MiniGraph` | graf wiedzy rysowany krawędź po krawędzi, podświetlona ścieżka odpowiedzi |
| `viz/HeroConstellation` | ozdoba hero strony głównej z prawdziwych embeddingów |
| `viz/GradingBar` | 100 pkt jako pasek segmentów |
| `site/SiteNav`, `site/Breadcrumbs`, `site/Slide`, `site/PresenterKeys`, `site/BackgroundMesh` | rama strony, okruszki i nawigacja klawiaturą |
| `lesson/HeroTitle` | tytuł otwierający z animacją słów |

## Reguły pisania komponentu

- Komentarz nad komponentem: **poziom + jedno zdanie, po co jest** (`/** Molekuła: … */`).
- `"use client"` tylko gdy potrzebny stan, efekt albo motion. `CodeBlock` i strony zostają serwerowe.
- Propsy minimalne. Zamiast 10 flag zrób drugi komponent.
- Klasy łącz przez `cn()` z `lib/cn.ts`. Komponent przyjmuje `className` do pozycjonowania z zewnątrz.
- Interakcja (suwak, przełącznik, zakładki, tooltip, dialog) zawsze przez prymityw **Radix**, bo daje dostępność z klawiatury za darmo.
