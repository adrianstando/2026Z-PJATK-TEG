# Technologie Generatywne (TEG) — PJATK 2026Z

Repozytorium zawiera materiały do laboratoriów z technologii generatywnych na PJATK w semestrze zimowym 2026/27.

**Strona z prezentacjami:** https://adrianstando.github.io/2026Z-PJATK-TEG/

## Tematyka zajęć

Celem kursu jest nauczenie budowania aplikacji opartych na dużych modelach językowych (LLM) w praktyce. Główne tematy:

- jak działają LLM-y: tokeny, generowanie tekstu, parametry, koszt,
- embeddingi i wyszukiwanie semantyczne,
- RAG (Retrieval-Augmented Generation): chunking, bazy wektorowe, wyszukiwanie hybrydowe, reranking, ewaluacja,
- agenci: tool calling, ReAct, pamięć, LangGraph,
- grafy wiedzy i GraphRAG (Neo4j),
- MCP (Model Context Protocol) i systemy wieloagentowe,
- praca z agentami kodującymi (Claude Code, Codex, GitHub Copilot) i dlaczego vibe coding to jeszcze nie programowanie.

## Organizacja zajęć

8 spotkań po 90 minut. Każde zajęcia składają się z trzech części:

1. **wprowadzenie**: krótka prezentacja z interaktywnymi przykładami,
2. **notebook**: przykłady kodu do uruchomienia i modyfikacji,
3. **zadanie** do wykonania na zajęciach albo po nich.

Przed pierwszymi zajęciami należy skonfigurować dostęp do modelu językowego: [00-dostep-do-llm](00-dostep-do-llm/README.md).

## Środowisko pracy

Notebooki można uruchomić w przeglądarce, bez instalacji, albo lokalnie:

| Gdzie | Jak | Kiedy wybrać |
|---|---|---|
| **Google Colab** | przycisk *Open in Colab* przy zajęciach | najszybszy start, darmowy |
| **Deepnote** | przycisk *Open in Deepnote* | wspólna praca kilku osób na jednym notebooku; darmowy plan Education |
| **GitHub Codespaces** | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/adrianstando/2026Z-PJATK-TEG) | pełne VS Code w przeglądarce; studenci z GitHub Student Developer Pack mają 180 h/mies. |
| **lokalnie** | `uv sync` albo `pip install -r requirements.txt` | Ollama, Neo4j, praca nad projektem |

## Terminy zajęć i zadania

| Termin | Nr | Zajęcia | Zakres | Na koniec | Materiały |
|--------|----|---------|--------|-----------|-----------|
| przed 1. | 0 | [Dostęp do LLM](00-dostep-do-llm/README.md) | Azure for Students, Ollama, OpenAI, Anthropic, teg-proxy; wywołania z Pythona | — | [instrukcja](00-dostep-do-llm/README.md) |
| 03.10.2026 | 1 | [LLM i embeddingi](01-llm-embeddingi/README.md) | - Proces generowania tekstu, tokeny, koszt <br> - Wywołanie modelu z Pythona, prosty agent <br> - Embeddingi, miary podobieństwa, wyszukiwanie wektorowe | **[zadanie](01-llm-embeddingi/zadanie.ipynb)** | [prezentacja](https://adrianstando.github.io/2026Z-PJATK-TEG/zajecia/01-llm-embeddingi/) · [notebook](https://adrianstando.github.io/2026Z-PJATK-TEG/notebook/01-llm-embeddingi/) · [![Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/adrianstando/2026Z-PJATK-TEG/blob/main/01-llm-embeddingi/notebook.ipynb) |
| 17.10.2026 | 2 | [RAG](02-rag/README.md) | - Chunking <br> - Chroma i filtrowanie po metadanych <br> - Wyszukiwanie hybrydowe (BM25) i reranking <br> - Ewaluacja: hit rate, MRR, LLM jako sędzia | **[zadanie](02-rag/zadanie.ipynb)** | [prezentacja](https://adrianstando.github.io/2026Z-PJATK-TEG/zajecia/02-rag/) · [notebook](https://adrianstando.github.io/2026Z-PJATK-TEG/notebook/02-rag/) · [![Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/adrianstando/2026Z-PJATK-TEG/blob/main/02-rag/notebook.ipynb) |
| 07.11.2026 | 3 | [Agenci](03-agenci/README.md) | - Tool calling <br> - ReAct w LangGraph <br> - Pamięć <br> - Agentic RAG | **[zadanie](03-agenci/zadanie.ipynb)** | [prezentacja](https://adrianstando.github.io/2026Z-PJATK-TEG/zajecia/03-agenci/) · [notebook](https://adrianstando.github.io/2026Z-PJATK-TEG/notebook/03-agenci/) · [![Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/adrianstando/2026Z-PJATK-TEG/blob/main/03-agenci/notebook.ipynb) |
| 21.11.2026 | 4 | [GraphRAG](04-graphrag/README.md) | - Neo4j i Cypher <br> - Ekstrakcja grafu wiedzy przez LLM <br> - Agentic GraphRAG <br> - RAG, structured RAG i GraphRAG | **[zadanie](04-graphrag/zadanie.ipynb)** | [prezentacja](https://adrianstando.github.io/2026Z-PJATK-TEG/zajecia/04-graphrag/) · [notebook](https://adrianstando.github.io/2026Z-PJATK-TEG/notebook/04-graphrag/) · [![Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/adrianstando/2026Z-PJATK-TEG/blob/main/04-graphrag/notebook.ipynb) |
| 05.12.2026 | 5 | [MCP i multi-agent](05-mcp-multi-agent/README.md) | - Model Context Protocol, własny serwer MCP <br> - Systemy wieloagentowe | **[zadanie](05-mcp-multi-agent/zadanie.ipynb)** + **test** | [prezentacja](https://adrianstando.github.io/2026Z-PJATK-TEG/zajecia/05-mcp-multi-agent/) · [notebook](https://adrianstando.github.io/2026Z-PJATK-TEG/notebook/05-mcp-multi-agent/) · [![Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/adrianstando/2026Z-PJATK-TEG/blob/main/05-mcp-multi-agent/notebook.ipynb) |
| 19.12.2026 | 6 | [Agentic coding](06-agentic-coding/README.md) | - Agent = model + harness; Claude Code, Codex, Copilot <br> - `CLAUDE.md`, skille, hooki, pluginy, design system <br> - Przegląd luk w kodzie wygenerowanym przez agenta <br> - Przygotowanie do skillathonu | **[zadanie](06-agentic-coding/zadanie.md)** | [prezentacja](https://adrianstando.github.io/2026Z-PJATK-TEG/zajecia/06-agentic-coding/) · [materiały](06-agentic-coding/cwiczenia/README.md) |
| 09.01.2027 | 7 | [Skillathon](07-skillathon/README.md) | - Praca w grupach z agentem kodującym | **skillathon** | w przygotowaniu |
| 23.01.2027 | 8 | Prezentacje | - Prezentacje i obrona projektów | **prezentacja** | — |

## Zasady oceniania

Składowe zaliczenia (łącznie 100 pkt):

| Składowa | Punkty | Opis |
|---|---|---|
| **Projekt** | 50 | własny system z min. 8 z 12 zagadnień kursu (zespół 3-osobowy: 10) + prezentacja; [szczegóły](projekt/README.md) |
| **Test** | 30 | zajęcia 5, pytania praktyczne; **warunek zaliczenia: min. 50%** |
| **Praca na zajęciach** | 12 | zadania do wykonania na zajęciach lub po nich |
| **Skillathon** | 8 | praca w grupach z agentem kodującym na przedostatnich zajęciach |

**Oceny końcowe:**

| Punkty | Ocena |
|--------|-------|
| 90–100 | 5 |
| 80–89 | 4.5 |
| 70–79 | 4 |
| 60–69 | 3.5 |
| 50–59 | 3 |
| < 50 | 2 |

### Projekt

Pełny opis, lista zagadnień i trzy przykładowe projekty: **[projekt/README.md](projekt/README.md)**.

- Jeden projekt w parach, temat własny do zatwierdzenia przez prowadzącego. Zespół 3-osobowy tylko wtedy, gdy liczba osób w grupie jest nieparzysta.
- Projekt wykorzystuje co najmniej **8 z 12 zagadnień** z zajęć (m.in. RAG, ewaluacja, agenci, GraphRAG, MCP), a projekt zespołu 3-osobowego co najmniej **10 z 12**.
- Zgłoszenie zespołu i tematu mailem do **19.12.2026** (`[TEG] propozycja-projektu`). **Mail wysyła jedna osoba, pozostałe osoby z zespołu muszą być w DW.**
- Oddanie do **22.01.2027, 23:59** (`[TEG] projekt`): prezentacja (PDF), dokumentacja (PDF) i folder z kodem (zip z `.git`, bez `.env`, `.venv`, `__pycache__`, `node_modules`).
- Korzystanie z agentów kodujących jest dozwolone pod warunkiem rzetelnej konfiguracji: skille, pliki `AGENTS.md` / `CLAUDE.md`, pluginy, opis sposobu pracy w repozytorium i historia commitów pokazująca rozwój projektu.
- Prezentacja i obrona na zajęciach 8 (23.01.2027).

### Zadania mailem

- **Temat wiadomości:** `[TEG] lab-01`, `[TEG] lab-02` itd.
- W załączniku notebook z wynikami komórek albo link do repozytorium.
- **Bez** `.env`, `.venv` i `node_modules`.

### Zasady dodatkowe

- Klucze API wyłącznie w `.env` (w `.gitignore`). Klucz opublikowany w repozytorium trzeba od razu unieważnić.

## Struktura repozytorium

```
00-dostep-do-llm/     instrukcja dostępu do modeli + przykłady w Pythonie
01-llm-embeddingi/    notebook do zajęć 1
0X-.../               kolejne zajęcia (pojawiają się w trakcie semestru)
projekt/              opis projektu, lista zagadnień i przykładowe projekty
tools/teg-proxy/      proxy dla subskrypcji: lokalny serwer zgodny z API OpenAI (Copilot / Claude / Codex)
web/                  strona z prezentacjami (Next.js, statyczny eksport na GitHub Pages)
.claude/              CLAUDE.md, DESIGN.md (design system strony) i skille dla agenta kodującego
```

Strona w `web/` jest przykładem pracy z agentem kodującym: design system opisany w skillu, `CLAUDE.md` i kod generowany według tych zasad. Temat zajęć 6.
