# Przepis: nowa wizualizacja

Przykład: „wyszukiwanie hybrydowe: BM25 + embeddingi + fuzja rang” na zajęcia 2.

## 1. Dane: policz wcześniej, zapisz JSON

W `web/scripts/generate_data.py` (albo osobnym skrypcie w `web/scripts/`) policz to, co potrzebne, i zapisz do `web/src/data/<nazwa>.json`. Zasady:

- prawdziwe modele (Ollama `embeddinggemma`, tiktoken, rank_bm25), żadnych kluczy API,
- wektory zaokrąglone do 4 miejsc (rozmiar pliku),
- współrzędne 2D znormalizowane do [0, 1],
- w docstringu skryptu: komenda uruchomienia i **dlaczego** wybrany model/rzut.

## 2. Komponent w `components/viz/`

```tsx
"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import data from "@/data/hybrid.json";
import { Panel } from "@/components/ui/Panel";

/** Organizm: <jedno zdanie, jaki proces pokazuje>. Dane: scripts/<skrypt>. */
export function HybridSearchViz() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  // stan = krok procesu albo parametr sterowany przez prowadzącego
  ...
  return (
    <div ref={ref}>
      <Panel className="p-6 md:p-8">{/* SVG z viewBox albo siatka */}</Panel>
    </div>
  );
}
```

## 3. Lista kontrolna

- [ ] Odpowiada na pytanie „jaki krok procesu pokazuje ruch?”.
- [ ] Kolory: `hit` dla wyników, `focus` dla zapytania lub tego, co steruje, `cat-*` dla serii. Nic spoza tokenów.
- [ ] Sterowanie przez Radix (`Slider`, `ToggleGroup`, `Tabs`), z `aria-label`.
- [ ] Liczby `font-mono tabular-nums`.
- [ ] Działa bez JS w pierwszym renderze (SSR pokazuje stan początkowy).
- [ ] Zero błędów w konsoli (patrz pułapki w `motion.md`).
- [ ] Wpis w tabeli organizmów w `components.md`.
