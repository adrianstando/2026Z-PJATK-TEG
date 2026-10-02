# CLAUDE.md

Instructions for Claude Code working in this repository.

## Repository

Lab materials for Generative Technologies (Technologie Generatywne, PJATK, 2026Z): notebooks, a presentation site (`web/`) and tools (`tools/`). Course content in Polish; code and identifiers in English, code comments in Polish.

## Map

| Path | Contents | Run |
|---|---|---|
| `00-dostep-do-llm/` | LLM access guide and examples | `python examples/07_ollama.py` |
| `NN-*/notebook.ipynb`, `NN-*/zadanie.ipynb` | lesson notebooks; source of site content | Jupyter / Colab; `LLM_PROVIDER` in `.env` |
| `web/` | Next.js 16, static export to GitHub Pages | `cd web && npm ci && npm run dev` |
| `.claude/DESIGN.md` | design system in [DESIGN.md](https://github.com/google-labs-code/design.md) format: tokens and rules | `cd web && npm run design:lint` |
| `web/scripts/check-design-tokens.mjs` | colors in `DESIGN.md` ↔ `globals.css` must match | runs before `dev` and `build` |
| `web/scripts/sync-notebooks.mjs` | `web:*` notebook cells → `web/src/content/generated/` | runs before `dev` and `build` |
| `web/scripts/generate_data.py` | embeddings and tokens for visualizations → `web/src/data/` | `npm run data` (Ollama with `embeddinggemma`) |
| `tools/teg-proxy/` | subscription proxy: OpenAI-compatible server (Copilot, Claude, Codex) | `python -m teg_proxy` |

## Rules

1. **Visual changes in `web/`:** tokens and rules from [`DESIGN.md`](DESIGN.md); how to build and known bugs in [`skills/web-ui`](skills/web-ui/SKILL.md).
2. **Notebooks:** format in [`skills/notebook-format`](skills/notebook-format/SKILL.md). The site never runs notebooks, it only reads saved outputs.
3. The site is static: no API routes, no keys, no model calls in the browser.
4. `web/src/content/generated/` and `web/src/data/` are script-generated; never edit by hand.
5. Model IDs and library APIs only from docs or the installed package, never from memory.
6. Secrets only in `.env` (gitignored).

## Before handing over changes

```bash
cd web && npm run typecheck && npm run build
```

Visuals: `npx serve web/out`, changed pages at 1440×900 and 390×844, empty browser console.

## Commits

Conventional commits in English: `feat(web): …`, `fix(notebook-01): …`, `docs: …`. One commit = one logical change.

## Skills

Project skills in `.claude/skills/` load when relevant: `web-ui` (UI in `web/`) and `notebook-format` (notebooks rendered on the site). After a visual change: Playwright screenshot at 1440×900 and 390×844, and look at it before reporting the change as done.
