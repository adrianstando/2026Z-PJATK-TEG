# Responsywność i znane błędy

Lista powstała z błędów naprawianych w tym repo. Każdy punkt to objaw → przyczyna → rozwiązanie.

## Rozdzielczości

- Sprawdzane zawsze: **1440×900** (projektor) i **390×844** (telefon).
- Siatki: `grid gap-6 lg:grid-cols-2`; poniżej `lg` jedna kolumna. Kolumny o stałej szerokości (`lg:grid-cols-[1fr_24rem]`) tylko z prefiksem `lg:`.
- Tabele zawsze w kontenerze `overflow-x-auto`.
- Długie wyniki w terminalu: `max-h-[30rem] overflow-auto whitespace-pre-wrap`.
- Elementy dodatkowe na wąskim ekranie chowane (`hidden md:flex`), nigdy ściskane.
- SVG: `viewBox` + `className="h-auto w-full"`; rozmiar fontu w SVG w jednostkach `viewBox`, więc na telefonie maleje razem z rysunkiem. Etykiety muszą być czytelne przy szerokości 360 px.

## Błędy już naprawione (nie powtarzać)

| Objaw | Przyczyna | Rozwiązanie |
|---|---|---|
| Etykiety przy krawędzi wykresu ucięte („zaskocz…”) | tekst wychodzi poza `viewBox`, a `<svg>` domyślnie ucina zawartość | margines wewnętrzny w `viewBox` na etykiety albo `overflow-visible` na `<svg>` |
| Dół liter g, y, ę ucięty w dużym nagłówku | maska `overflow-hidden` przy animacji wjazdu słów jest dokładnie na wysokość linii | `pb-[0.2em]` na masce i `-mb-[0.2em]`, żeby nie zmienić odstępów |
| Linie nie trafiają w wyróżnione punkty | `scale` na grupie `<g>` w SVG skaluje od środka pudełka elementu i przesuwa punkt | powiększać promień (`r` + CSS `transition`), nie skalować grupy |
| Węzły grafu nie pojawiają się | `whileInView` na elemencie z `scale: 0` ma zerowy rozmiar i nigdy nie wchodzi w kadr | animację wejścia sterować z rodzica (`whileInView` na `<svg>`, dzieci tylko `variants`) |
| Błędy „attribute r/cx/x2: Expected length, undefined” | `motion.circle`/`motion.line` animujące atrybuty geometrii; ustawienie wartości statycznie nie zawsze pomaga | geometria (`cx`, `cy`, `r`, `x2`) jako zwykły atrybut zwykłego elementu SVG + CSS `transition`; `motion.line` tylko do `pathLength` i `opacity` |
| Suwak bez nazwy dla czytnika ekranu | `aria-label` na `Slider.Root`, a rolę `slider` ma `Slider.Thumb` | `aria-label` na `Slider.Thumb` |
| Strona się wywraca po zmianie notebooka w trakcie `npm run dev` | wygenerowany JSON z komórkami jest starszy niż notebook | `npm run sync`; dostęp do komórek przez `NB[...]` z wartością zastępczą |
| Ostrzeżenie o niezgodności hydratacji na `<body>` | rozszerzenia przeglądarki (np. Grammarly) dopisują atrybuty | `suppressHydrationWarning` tylko na `<body>` |
| Ostrzeżenie Next o `scroll-behavior: smooth` | brak atrybutu na `<html>` | `data-scroll-behavior="smooth"` na `<html>` |
| Emoji jako puste kwadraty | font bez glifów emoji | w `--font-sans` fonty emoji na końcu listy; emoji i tak tylko tam, gdzie niosą informację |
| Biały tekst na przycisku poniżej WCAG AA | `brand-500` z białym ma 3,9:1 | tło `primary` (`brand-600`), hover przez `brightness-110` |
| Kolumny tabeli w terminalu rozjeżdżają się na telefonie | `whitespace-pre-wrap` łamie wiersze tabeli | `Terminal wrap={false}`: `whitespace-pre` i przewijanie w poziomie |
| Punkty z jednej grupy zlewają się w jeden na wykresie 2D | wspólny rzut PCA wielu grup: największa wariancja jest między grupami | rzut liczony dla wybranej grupy; dla 3 punktów rysunek dokładny (trójkąt z odległości) |
| Animacja ciągła rozprasza i obciąża CPU | stały obrót kamery w 3D | animacja ciągła domyślnie wyłączona, przycisk start/stop |

## Nawigacja

- `PresenterKeys` (w layoutcie): ← → i PageUp/PageDown skaczą po elementach z `data-slide`; ↑ ↓ i spacja przewijają normalnie.
- Elementy z `data-slide` mają `scroll-mt-*` większy niż wysokość paska nawigacji, żeby nagłówek nie chował się pod paskiem.
- Okruszki (`Breadcrumbs`) na każdej podstronie; na stronie głównej brak.
