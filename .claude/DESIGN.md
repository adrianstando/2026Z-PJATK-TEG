---
version: alpha
name: TEG Night Blue
description: Design system strony z materiałami do laboratoriów Technologie Generatywne (web/). Prezentacje dla projektora i materiał do czytania na telefonie.
colors:
  primary: "#1f5fd1"
  on-primary: "#ffffff"
  ink-950: "#050b1f"
  ink-900: "#0a1430"
  ink-800: "#111e45"
  ink-700: "#1a2a5c"
  fg: "#eef3ff"
  fg-muted: "#a9b6d8"
  fg-subtle: "#6c7ba5"
  brand-300: "#93c2ff"
  brand-400: "#5ea3ff"
  brand-500: "#2f7cf6"
  brand-600: "#1f5fd1"
  cyan-400: "#2fd8e8"
  hit: "#3ee0a4"
  miss: "#ff7a8a"
  focus: "#ffc94d"
  cat-1: "#5ea3ff"
  cat-2: "#2fd8e8"
  cat-3: "#ffc94d"
  cat-4: "#ff8fb1"
  line: "rgb(169 182 216 / 0.14)"
  line-strong: "rgb(169 182 216 / 0.28)"
  panel: "rgb(255 255 255 / 0.035)"
  panel-hi: "rgb(255 255 255 / 0.07)"
typography:
  display:
    fontFamily: Geist
    fontSize: 128px
    fontWeight: "600"
    lineHeight: "0.95"
    letterSpacing: -0.04em
  headline:
    fontFamily: Geist
    fontSize: 60px
    fontWeight: "600"
    lineHeight: "1.08"
    letterSpacing: -0.025em
  title:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: "600"
    lineHeight: "1.4"
  body-lg:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: "400"
    lineHeight: "1.65"
  body-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  eyebrow:
    fontFamily: Geist Mono
    fontSize: 12px
    fontWeight: "400"
    lineHeight: "1.4"
    letterSpacing: 0.22em
  code:
    fontFamily: Geist Mono
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.7"
  data:
    fontFamily: Geist Mono
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.4"
    fontFeature: tnum
rounded:
  chip: 0.5rem
  card: 1.25rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  card-padding: 24px
  section-y: 112px
  container: 1280px
  reading-width: 896px
components:
  page:
    backgroundColor: "{colors.ink-950}"
    textColor: "{colors.fg}"
    typography: "{typography.body-md}"
  panel:
    backgroundColor: "#0e1427"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
  panel-hover:
    backgroundColor: "#161c2f"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.full}"
    padding: 10px 20px
  button-ghost:
    backgroundColor: transparent
    textColor: "{colors.fg}"
    rounded: "{rounded.full}"
    padding: 10px 20px
  button-ghost-hover:
    backgroundColor: "#161c2f"
  eyebrow:
    textColor: "{colors.brand-400}"
    typography: "{typography.eyebrow}"
  section-heading:
    textColor: "{colors.fg}"
    typography: "{typography.headline}"
  lead:
    textColor: "{colors.fg-muted}"
    typography: "{typography.body-lg}"
  callout-insight:
    backgroundColor: "#141622"
    textColor: "{colors.fg}"
    rounded: 12px
    padding: 16px 20px
  callout-warning:
    backgroundColor: "#141225"
    textColor: "{colors.fg}"
    rounded: 12px
    padding: 16px 20px
  code-block:
    backgroundColor: "#0e1427"
    textColor: "{colors.fg}"
    typography: "{typography.code}"
    rounded: "{rounded.card}"
  terminal:
    backgroundColor: "{colors.ink-950}"
    textColor: "{colors.fg-muted}"
    typography: "{typography.code}"
    rounded: "{rounded.card}"
  badge-focus:
    backgroundColor: "#1e1e24"
    textColor: "{colors.focus}"
    rounded: "{rounded.full}"
    padding: 2px 10px
  token-chip:
    rounded: "{rounded.chip}"
    typography: "{typography.code}"
    padding: 6px 8px
---

## Overview

Granatowa noc i niebieskie światło. Strona służy jednocześnie jako prezentacja na projektorze (ciemna sala, duże nagłówki, sterowanie klawiaturą) i jako materiał do przeczytania na telefonie. Charakter jest techniczny i spokojny: ciemne tło z wolno dryfującymi plamami niebieskiego i cyjanu, delikatna siatka, szklane panele. Ruch pokazuje proces, którego dotyczy slajd (losowanie tokenu, porównanie wektorów, rysowanie grafu), a nie zdobi.

Implementacja: Next.js (statyczny eksport), Tailwind CSS v4, prymitywy Radix UI, `motion`. Sposób budowania komponentów i lista błędów, których należy unikać, są w skillu [`skills/web-ui`](skills/web-ui/SKILL.md).

## Colors

Tokeny kolorów są zdefiniowane w `web/src/app/globals.css` (`@theme` oraz `:root` dla warstw półprzezroczystych) i muszą być identyczne z tym plikiem; build sprawdza zgodność.

- **Ink (950–700):** tła. `ink-950` to tło strony, jaśniejsze stopnie tylko w gradientach i warstwach.
- **Fg, fg-muted, fg-subtle:** trzy poziomy tekstu: nagłówki i treść, lead i opisy, podpisy i metadane.
- **Brand (300–600) i cyan-400:** akcent marki. Gradient `brand-300 → brand-500 → cyan-400` wyłącznie na 1–3 słowach nagłówka.
- **Hit, miss, focus:** kolory semantyczne o stałym znaczeniu: trafienie lub poprawny wynik, błąd lub odrzucony kandydat, element, na który ma patrzeć widz. Nie służą do dekoracji.
- **Cat-1…4:** serie danych w wykresach, maksymalnie cztery, zawsze w tej kolejności.
- **Primary, on-primary:** główny przycisk (biały tekst na `brand-600`, kontrast 5,8:1). Hover to rozjaśnienie o 10% (`brightness-110`), a nie `brand-500`: biały tekst na `brand-500` ma 3,9:1, poniżej WCAG AA.
- **Line, line-strong, panel, panel-hi:** półprzezroczyste obramowania i tła paneli; działają na każdym fragmencie tła.

W tokenach komponentów tła półprzezroczyste są podane jako kolor efektywny po nałożeniu na `ink-950` (np. panel `rgb(255 255 255 / 0.035)` → `#0e1427`), żeby dało się sprawdzić kontrast. Kontrast tekstu na tle strony: `fg` 17:1, `fg-muted` 9,7:1, `fg-subtle` 4,7:1.

## Typography

Geist dla tekstu, Geist Mono dla kodu, liczb w wizualizacjach i nadtytułów. Hierarchię buduje rozmiar, nie liczba krojów.

- **Display:** tylko tytuł otwierający stronę; rozmiar płynny `clamp(3rem, 9vw, 8rem)`, token podaje wartość maksymalną.
- **Headline:** nagłówek sekcji, 36 px na telefonie, 60 px od `md`. Nagłówek jest tezą (np. „Token jest podstawową jednostką”), a nie nazwą tematu.
- **Eyebrow:** nadtytuł nad nagłówkiem, mono, wersaliki, rozstrzelony, w formacie „NN · Temat”.
- **Data:** liczby w tabelach i wizualizacjach zawsze z cyframi tabelarycznymi.

## Layout

- Kontener treści `container` (1280 px) z marginesem `gutter` (24 px); strony tekstowe (README, notebook) mają szerokość `reading-width`.
- Sekcja prezentacji (slajd) ma co najmniej wysokość ekranu i odstęp `section-y` w pionie.
- Siatki `lg:grid-cols-2` i `lg:grid-cols-4` składają się do jednej kolumny poniżej `lg`. Wizualizacje SVG mają `viewBox` i szerokość 100% kontenera.
- Docelowe rozdzielczości do sprawdzenia: 1440×900 (projektor) i 390×844 (telefon).

## Elevation & Depth

Głębię dają warstwy, nie cienie: rozmyte plamy światła w tle (paralaksa przy przewijaniu), półprzezroczyste panele z `backdrop-blur` i obramowaniem `line`. Cień `glow` (niebieska poświata) wyłącznie na głównym przycisku i aktywnym elemencie.

## Shapes

Zaokrąglenia: `card` dla paneli i kart, `chip` dla tokenów i małych etykiet, `full` dla przycisków, przełączników i plakietek. Linie wykresów zaokrąglone (`stroke-linecap: round`).

## Components

Komponenty w podziale atomic design (`web/src/components/`): atomy w `ui/`, molekuły w `molecules/`, organizmy w `viz/`, `site/`, `lesson/` i `notebook/`. Tokeny komponentów w nagłówku pliku odpowiadają ich klasom Tailwind.

- **Panel:** podstawa każdej karty, okna kodu i wizualizacji.
- **Section heading:** eyebrow + headline (pierwsze 1–3 słowa gradientem) + lead.
- **Code block i terminal:** kod z podświetleniem składni obok prawdziwego wyniku z notebooka, podpisanego nazwą modelu.
- **Callout:** jedna myśl na slajd; `insight` (żółta krawędź) do zapamiętania, `warning` (różowa krawędź) dla pułapki.
- **Przyciski:** `primary` dla głównej akcji, `ghost` dla pozostałych.

Linter zgłasza kolory `ink-*`, `cat-*`, `hit`, `miss` itp. jako nieużywane przez komponenty. To zamierzone: używają ich wizualizacje danych, które nie mają tokenów komponentów.

## Do's and Don'ts

- Do: kolory tylko z tokenów; nowy kolor najpierw w tym pliku i w `globals.css`.
- Do: liczby i kod na slajdach z prawdziwych uruchomień notebooka.
- Do: jedna teza na slajd, maksymalnie ok. 40 słów tekstu ciągłego poza kodem.
- Do: interakcje przez prymitywy Radix (dostępność z klawiatury), z etykietą na elemencie, który ma rolę (np. `Slider.Thumb`).
- Don't: hex wpisany w komponencie, nowa biblioteka UI, zrzuty ekranu kodu zamiast tekstu.
- Don't: animacja, która nie pokazuje żadnego kroku procesu; karuzele, autoodtwarzanie, dźwięk.
- Don't: emoji jako ozdoba nagłówków i ramek.
