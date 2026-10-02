# Presentation patterns

A lesson page is **both** the instructor's presentation (projector, keyboard) and student material (scroll, phone).

## Presenter mode

- Each board is a `<Slide id>` (min. screen height, `data-slide`).
- `PresenterKeys`: → ↓ PageDown Space = next, ← ↑ PageUp = previous, F = fullscreen. Presentation clickers work out of the box (they send PageUp/PageDown).
- Interactive elements (sliders, toggles) don't capture arrows unless focused.

## Lesson structure (90 min)

1. **Hero**: lesson number, title, lead, agenda as chips.
2. Organization (only when there is something to announce).
3. 6–10 content boards: **one thesis per board**.
4. Final board: quiz or assignment + links (Colab, notebook).

## Content rules

- **Title = thesis.** `accent` is 1–3 gradient words, `title` the rest of the sentence. Good: „Płacisz | za tokeny, nie za słowa”. Bad: „Tokenizacja”.
- **Lead**: 1–3 explanatory sentences, no lists.
- **Show, then name.** Visualization or output first, then the concept.
- **Code + output side by side** (`grid lg:grid-cols-2`): left `CodeBlock` with `highlight` on 1–3 key lines, right `Terminal` with real output.
- **Numbers from real runs**, labeled with the model (`Terminal` `title`). Historical data labeled with the year.
- **Pitfalls beat successes.** If the model gets it wrong (Darwin instead of Newton), show it in `Callout kind="warning"` and say which lesson fixes it.
- Max ~40 words of running text per board, excluding code.
- Slide text is in Polish.

## Responsiveness

Projector 1440×900 and phone 390×844. `lg:grid-cols-*` grids collapse to one column; SVG has `viewBox` and `w-full`.
