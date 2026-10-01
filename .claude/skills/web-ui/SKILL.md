---
name: web-ui
description: >
  Sposób budowania interfejsu w web/ (Next.js, Tailwind v4, Radix, motion): gdzie leży który komponent,
  jak dodać slajd, wizualizację albo animację, jak sprawdzić wygląd na projektorze i telefonie oraz
  jakich znanych błędów unikać. Do użycia przy każdej zmianie wizualnej w web/.
---

# web-ui

Tożsamość wizualna (kolory, typografia, odstępy, kształty, komponenty) jest opisana w **[`.claude/DESIGN.md`](../../DESIGN.md)**, w formacie [DESIGN.md](https://github.com/google-labs-code/design.md). Ten skill nie powtarza tokenów, tylko opisuje, jak je stosować w kodzie.

## Stack

Next.js 16 (App Router, `output: "export"` na GitHub Pages) · React 19 · TypeScript strict · Tailwind CSS v4 · [Radix UI](https://www.radix-ui.com/primitives) (`radix-ui`) · `motion` (`motion/react`) · `lucide-react` · `shiki` (kolorowanie kodu w czasie builda).

Strona jest statyczna: bez API routes, bez zapytań do modeli w przeglądarce, bez kluczy. Dane do wizualizacji liczy `web/scripts/generate_data.py` i zapisuje w `web/src/data/`.

## Tokeny w kodzie

- `DESIGN.md` (YAML) → `web/src/app/globals.css` (`@theme` i `:root`) → klasy Tailwinda (`bg-ink-950`, `text-fg-muted`, `border-hit/40`) albo `var(--color-…)` w SVG.
- Zgodność kolorów sprawdza `web/scripts/check-design-tokens.mjs` przed `dev` i `build`. Format pliku: `npm run design:lint`.
- Nowy kolor: najpierw `DESIGN.md`, potem `globals.css`, dopiero potem komponent.

## Zasady

1. **Tylko istniejące klocki** ([references/components.md](references/components.md)): atomy `components/ui` → molekuły `components/molecules` → organizmy `components/viz|site|lesson|notebook` → strony `app/**/page.tsx`, które tylko składają organizmy.
2. **Interakcje przez Radix** (Slider, ToggleGroup, Tabs), z `aria-label` na elemencie z rolą.
3. **Animacja pokazuje krok procesu** ([references/motion.md](references/motion.md)) i respektuje `prefers-reduced-motion`.
4. **Treść slajdów** według [references/presentation.md](references/presentation.md); kod i wyniki z notebooka (skill `notebook-format`).
5. **Każda zmiana sprawdzona na 1440×900 i 390×844**, z pustą konsolą przeglądarki ([references/responsive-and-pitfalls.md](references/responsive-and-pitfalls.md)).

## Nowa sekcja zajęć

1. `web/src/app/zajecia/<slug>/page.tsx`: `<Slide id="…">`; `id` to krótki slug, służy jako kotwica i cel skoku strzałkami.
2. `<SectionHeading eyebrow="NN · Temat" accent="Teza" title="ciąg dalszy" lead="…" />`.
3. Jeden główny organizm (wizualizacja albo kod + terminal), każdy w `<Reveal delay={…}>`.
4. Najwyżej jeden `<Callout>`.
5. Wpis do agendy w hero (link do `#id`).

## Nowa wizualizacja

[references/viz-recipe.md](references/viz-recipe.md).

## Sprawdzenie

```bash
cd web && npm run typecheck && npm run build && npx serve out
```

Zrzuty ekranu (Playwright) w obu rozdzielczościach, po zakończeniu animacji (ok. 5 s po wejściu sekcji w kadr).
