# Zajęcia 5: MCP i systemy wieloagentowe

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/adrianstando/2026Z-PJATK-TEG/blob/main/05-mcp-multi-agent/notebook.ipynb)
[![Open in Deepnote](https://deepnote.com/buttons/launch-in-deepnote-small.svg)](https://deepnote.com/launch?url=https://github.com/adrianstando/2026Z-PJATK-TEG/blob/main/05-mcp-multi-agent/notebook.ipynb)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/adrianstando/2026Z-PJATK-TEG)

- **Prezentacja:** https://adrianstando.github.io/2026Z-PJATK-TEG/zajecia/05-mcp-multi-agent/
- **Notebook z wynikami:** https://adrianstando.github.io/2026Z-PJATK-TEG/notebook/05-mcp-multi-agent/

## Zakres

- Model Context Protocol: host, klient, serwer; tools, resources, prompts; transport stdio i streamable HTTP,
- własny serwer MCP w Pythonie (`FastMCP` z oficjalnego SDK `mcp`) nad bazą SQLite: [`nordwind_mcp.py`](nordwind_mcp.py),
- komunikaty JSON-RPC wysłane ręcznie (`initialize`, `tools/list`, `tools/call`),
- klient MCP z SDK i agent LangChain z narzędziami serwera (`langchain-mcp-adapters`),
- podłączenie serwera do Claude Code, VS Code i MCP Inspector,
- bezpieczeństwo: prompt injection w wynikach narzędzi, najmniejsze uprawnienia, zatwierdzanie przez człowieka,
- systemy wieloagentowe: supervisor, handoff, orchestrator–workers (`Send` w LangGraph), writer–critic i porównanie kosztu z jednym agentem.

## Przed zajęciami

Skonfigurowany dostęp do modelu z obsługą tool calling: [00-dostep-do-llm](../00-dostep-do-llm/README.md). Do MCP Inspector potrzebny jest Node.js (w Colabie jest zainstalowany).

## Serwer poza notebookiem

```bash
python nordwind_mcp.py                                  # stdio
python nordwind_mcp.py --http                           # http://127.0.0.1:8000/mcp
npx @modelcontextprotocol/inspector python nordwind_mcp.py
claude mcp add nordwind -- python nordwind_mcp.py       # Claude Code
```

Notebook zapisuje ten sam plik komórką `%%writefile`. SDK `mcp` jest przypięty do wersji 1.x (`mcp<2`), bo tej wymaga `langchain-mcp-adapters`.

## Zadanie

[`zadanie.ipynb`](zadanie.ipynb): własny serwer MCP domowej biblioteki (co najmniej pięć narzędzi w `FastMCP`), test klientem MCP bez modelu i podłączenie serwera do agenta: w LangChain albo w Claude Code, Codex, VS Code lub Claude Desktop (wtedy zrzuty ekranu). Oddanie mailem z tematem `[TEG] lab-05` przed zajęciami 6.

## Test

Na zajęciach: około 30 minut, zakres zajęć 1–5, zaliczenie od 50% punktów.

## Uwagi do notebooka

- Pierwsza komórka kodu wybiera dostawcę tak samo jak na zajęciach 1 i 3.
- Zapisane wyniki: OpenAI, agenci na `gpt-4.1-mini`. Przebiegi agentów zmieniają się między uruchomieniami (inne wywołania, inna liczba kroków, czasem inny wynik testu prompt injection).
- Komórki z tagiem `web:*` są pokazywane na prezentacji.
