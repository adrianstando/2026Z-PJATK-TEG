# CLAUDE.md

Instrukcje dla Claude Code pracującego w tym repozytorium.

## Repozytorium

Materiały do laboratoriów Technologie Generatywne (PJATK, 2026Z): notebooki, strona z prezentacjami (`web/`) i narzędzia (`tools/`). Treści po polsku; kod i identyfikatory po angielsku, komentarze w kodzie po polsku.

## Mapa

| Ścieżka | Zawartość | Uruchomienie |
|---|---|---|
| `00-dostep-do-llm/` | instrukcja dostępu do LLM i przykłady | `python examples/01_github_models.py` |
| `NN-*/notebook.ipynb`, `NN-*/zadanie.ipynb` | notebooki zajęć; źródło treści strony | Jupyter / Colab; `LLM_PROVIDER` w `.env` |
| `web/` | Next.js 16, statyczny eksport na GitHub Pages | `cd web && npm ci && npm run dev` |
| `.claude/DESIGN.md` | design system w formacie [DESIGN.md](https://github.com/google-labs-code/design.md): tokeny i zasady | `cd web && npm run design:lint` |
| `web/scripts/check-design-tokens.mjs` | zgodność kolorów `DESIGN.md` ↔ `globals.css` | automatycznie przed `dev` i `build` |
| `web/scripts/sync-notebooks.mjs` | komórki `web:*` z notebooków → `web/src/content/generated/` | automatycznie przed `dev` i `build` |
| `web/scripts/generate_data.py` | embeddingi i tokeny do wizualizacji → `web/src/data/` | `npm run data` (Ollama z `embeddinggemma`) |
| `tools/teg-proxy/` | proxy dla subskrypcji: serwer zgodny z API OpenAI (Copilot, Claude, Codex) | `python -m teg_proxy` |

## Zasady

1. **Zmiany wizualne w `web/`:** tokeny i zasady z [`DESIGN.md`](DESIGN.md), sposób budowania i znane błędy w [`skills/web-ui`](skills/web-ui/SKILL.md).
2. **Notebooki:** format opisany w [`skills/notebook-format`](skills/notebook-format/SKILL.md). Strona nie uruchamia notebooków, tylko czyta zapisane wyniki.
3. Strona jest statyczna: bez API routes, bez kluczy, bez zapytań do modeli w przeglądarce.
4. `web/src/content/generated/` i `web/src/data/` są generowane przez skrypty; bez ręcznej edycji.
5. ID modeli i API bibliotek wyłącznie z dokumentacji albo zainstalowanego pakietu, nigdy z pamięci.
6. Sekrety tylko w `.env` (w `.gitignore`).

## Sprawdzenie przed oddaniem zmian

```bash
cd web && npm run typecheck && npm run build
```

Wygląd: `npx serve web/out`, zmienione strony w 1440×900 i 390×844, pusta konsola przeglądarki.

## Commity

Conventional commits po angielsku: `feat(web): …`, `fix(notebook-01): …`, `docs: …`. Jeden commit to jedna logiczna zmiana.

## Skille

Skille projektu w `.claude/skills/` ładują się, gdy pasują do zadania: `web-ui` (interfejs w `web/`) i `notebook-format` (format notebooków wyświetlanych na stronie). Po zmianie wizualnej: zrzut ekranu (Playwright) w 1440×900 i 390×844 i jego obejrzenie przed zgłoszeniem, że zmiana jest gotowa.
