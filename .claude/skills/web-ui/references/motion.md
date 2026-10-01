# Animacje (`motion/react`)

## Zasada

Ruch ma **pokazywać proces**, którego uczymy. Przykłady z repo:

- `EmbeddingSpace`: punkty startują ze środka i „rozjeżdżają się” na swoje miejsca, bo model rozkłada słowa w przestrzeni.
- `VectorSearchViz`: zapytanie spada → linie do **wszystkich** dokumentów (skan) → zostają tylko linie top-k → lista sortuje się z `layout`. Trzy fazy = trzy kroki algorytmu.
- `SamplingViz`: paski prawdopodobieństw płyną sprężyną przy zmianie temperatury, top-k i top-p; odrzucone tokeny bledną.

Jeśli animacja nie odpowiada na pytanie „jaki krok procesu pokazuje?”, usuń ją.

## Gotowe wzorce

| Potrzeba | Jak |
|---|---|
| wejście sekcji / bloku | `<Reveal delay={0.1…0.4}>` (opacity + y + blur, raz) |
| lista pojawia się element po elemencie | rodzic `variants={{ show: { transition: { staggerChildren: 0.06 } } }}`, dzieci `hidden/show` (patrz `Terminal`) |
| liczba / pasek zmienia wartość | `animate={{ width: \`${p * 100}%\` }}` + `transition={{ type: "spring", stiffness: 120, damping: 20 }}` |
| rysowanie linii / krawędzi | `motion.line` / `motion.path` z `initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}`; **zawsze podaj też statyczne x1/y1/x2/y2** |
| zmiana kolejności listy | `<LayoutGroup>` + `motion.li layout` |
| zakładka / pigułka przesuwa się | `layoutId="…"` na tle aktywnego elementu (patrz `CodeTabs`) |
| proces w krokach | stan `phase` + `setTimeout` w `useEffect` zależnym od wejścia (patrz `VectorSearchViz`) |
| start dopiero gdy widoczne | `useInView(ref, { once: true, margin: "-20% 0px" })` |
| paralaksa tła | `useScroll` + `useTransform` (tylko `BackgroundMesh`) |

## Parametry

- Wejścia: `duration 0.7–0.9`, ease `[0.16, 1, 0.3, 1]`.
- Sprężyny elementów danych: `stiffness 70–200`, `damping 14–20`.
- Stagger: 0.03–0.08 s na element; całość krótsza niż ~1.5 s.
- `prefers-reduced-motion`: `useReducedMotion()` → `initial={false}`; globalny CSS skraca resztę.

## Pułapki

Znane błędy animacji i SVG są zebrane w [responsive-and-pitfalls.md](responsive-and-pitfalls.md).
