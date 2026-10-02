---
name: notebook-format
description: >
  Format rules for Jupyter notebooks in this repo so they render correctly on the site
  (/notebook/<slug>/) and feed the presentation slides. Use when creating or editing an .ipynb
  in a lesson folder, or when diagnosing why a notebook renders badly on the site.
---

# notebook-format

The site never runs notebooks. At build time it reads cells and saved outputs from `.ipynb`:

- `web/src/lib/notebooks.ts` renders the whole notebook at `/notebook/<slug>/` (and `zadanie.ipynb` at `/notebook/<slug>-zadanie/`),
- `web/scripts/sync-notebooks.mjs` extracts cells tagged `web:<key>` into `web/src/content/generated/<folder>.json`, which the slides read.

The notebook is the source of truth: the site shows exactly what is saved in the file.

## Files and names

- Lesson folder `NN-slug/` with `notebook.ipynb` (examples) and optional `zadanie.ipynb` (assignment).
- The folder must be listed in `LESSONS` in `web/src/content/course.ts` (`folder` field); flags `notebook` and `task` enable links on the lesson card.

## Structure

1. **First markdown cell starts with `# Title`.** The title goes to the page header; the `#` is not repeated in the body.
2. **Each `##` starts a new section**, i.e. a separate board with ← → navigation. The `##` heading must be **the first line of the cell**, otherwise text above it lands in the previous section.
3. `###` and lower do not split boards; use them inside a section.
4. One section = one topic: short description, 1–3 code cells, optional exercise.

## Markdown

Supported (GitHub Flavored Markdown): headings, lists, tables, `>` quotes, bold, italics, inline code, fenced code with language, links, images with `https://` URLs.

Not supported, do not use:

- **LaTeX** (`$...$`, `$$...$$`): shows as raw text. Write formulas as plain text (`2 − 2·cos(a, b)`) or as code.
- **HTML in markdown** (`<br>`, `<div>`, `<img>`): not rendered.
- **Images from local paths** (`![](figure.png)`): the link points to the GitHub preview, not the image. Use `https://raw.githubusercontent.com/...` or generate the plot in a code cell.

Relative links (`../00-dostep-do-llm/README.md`, `zadanie.ipynb`) are rewritten to GitHub repository URLs.

## Code cells and outputs

- **Commit notebooks with outputs**, executed top to bottom in a fresh kernel:
  ```bash
  jupyter nbconvert --to notebook --execute --inplace NN-slug/notebook.ipynb
  ```
- Rendered output types: text (`print`, last expression value), PNG/JPEG images (matplotlib), errors. ANSI colors are stripped.
- Not rendered: HTML outputs (pandas tables show as text), widgets, interactive plots (plotly, bokeh). Use matplotlib with `plt.show()`.
- An empty code cell renders as a "place for your code" box; use it to mark exercises.
- Long outputs scroll in a fixed-height box. Outputs for slides must be short: a dozen lines, no lists of hundreds of numbers.
- Plots are embedded as images; moderate size (`figsize` up to ~14×6, default `dpi`).

## Output safety

- No API keys, tokens or passwords in code **or outputs** (e.g. `print(os.getenv(...))`).
- No author disk paths (`/home/...`, `C:\Users\...`) in outputs or code.
- Tracebacks only where the error is the point of the example.

## Slide cells (`web:*`)

- Tag in cell metadata: `web:<key>` (Jupyter and VS Code: *Add Cell Tag*), e.g. `web:first-call`.
- Keys required by the site are listed in `NOTEBOOKS` in `web/scripts/sync-notebooks.mjs`. **A missing tag fails the build**; a cell without output gives a warning.
- Renaming a tag requires changes in the script and on the lesson page.
- The `web:setup` cell prints one line in the format
  `czat: <provider> (<model>, klasyczny: <model>) | embeddingi: <provider> (<model>)`;
  the site parses it to label outputs with model names.
- A cell shown on a slide must fit the screen: up to ~25 lines of code.

## Check

```bash
cd web && npm run sync && npm run dev     # then /notebook/<slug>/ and the lesson page
```

Generated `web/src/content/generated/*.json` files are never edited by hand.
