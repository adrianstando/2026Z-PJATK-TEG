# teg-proxy

Lokalny serwer zgodny z API OpenAI, który pod spodem korzysta z subskrypcji użytkownika:

| Dostawca | SDK | Logowanie | Przykładowy `model` |
|---|---|---|---|
| `claude` | [Claude Agent SDK](https://github.com/anthropics/claude-agent-sdk-python) | `claude` → `/login` (Pro/Max) | `claude-haiku-4-5`, `claude/claude-sonnet-5-5` |
| `copilot` | [GitHub Copilot SDK](https://github.com/github/copilot-sdk) | `copilot login` albo `GITHUB_TOKEN` | `copilot/gpt-5-mini` |
| `codex` | [OpenAI Codex SDK](https://github.com/openai/codex/tree/main/sdk/python) | `codex login` (ChatGPT Plus/Pro) | `codex/gpt-5.5` |

Dzięki temu cały kod z zajęć (`openai.OpenAI`, LangChain, RAGAS) działa **bez klucza API**:

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8787/v1", api_key="teg")
client.chat.completions.create(model="claude-haiku-4-5", messages=[{"role": "user", "content": "Hej!"}])
```

W notebookach wystarczy `LLM_PROVIDER=proxy`.

> **Tylko do własnego użytku.** Proxy nasłuchuje wyłącznie na `127.0.0.1`. Subskrypcja jest osobista: udostępnianie jej innym osobom (np. całej grupie przez tunel) łamie regulaminy Anthropic, GitHuba i OpenAI. Każdy uruchamia proxy u siebie.

## Uruchomienie

```bash
cd tools/teg-proxy
pip install -r requirements.txt        # albo: uv sync --extra all
python -m teg_proxy                    # tylko Claude (domyślnie)
python -m teg_proxy --providers claude,copilot,codex
```

Wymagania: Python 3.11+, zainstalowany i zalogowany agent danego dostawcy. Dostawca, który nie jest włączony, nie wymaga swojego pakietu.

| Zmienna | Domyślnie | Znaczenie |
|---|---|---|
| `TEG_PROXY_PROVIDERS` | `claude` | włączeni dostawcy, pierwszy jest domyślny dla nazw modeli bez prefiksu |
| `TEG_PROXY_IDLE_MINUTES` | `60` | po tylu minutach bezczynności sesja agenta jest zamykana |
| `TEG_PROXY_MAX_SESSIONS` | `8` | ile rozmów trzymać naraz w tle (najstarsza wypada) |
| `TEG_PROXY_API_KEY` | brak | jeśli ustawiony, wymagany nagłówek `Authorization: Bearer <klucz>` |

## Jak to działa

```
klient OpenAI ──► /v1/chat/completions ──► SessionPool ──► Provider (claude | copilot | codex)
                    (cała historia)        (odcisk rozmowy)    └─ AgentSession.ask(prompt)
```

API OpenAI jest **bezstanowe**: klient za każdym razem wysyła całą historię. Agent ma **stan**, a jego uruchomienie trwa kilka sekund. Pula sesji łączy jedno z drugim:

1. Po odpowiedzi sesja agenta zostaje otwarta w tle pod *odciskiem* (SHA-256) całej rozmowy: model, system, wiadomości i właśnie udzielona odpowiedź.
2. Jeśli kolejne zapytanie ma historię pasującą do odcisku, agent dostaje **tylko nową wiadomość**. Zmierzone na Haiku: 5,3 s przy nowej sesji, 1,6 s przy ciepłej.
3. Nowa albo edytowana historia otwiera nową sesję, a cała rozmowa idzie jako transkrypt.
4. Sesja bezczynna przez `TEG_PROXY_IDLE_MINUTES` jest zamykana. Następne zapytanie odtworzy ją od zera, niezauważalnie dla klienta.

Podgląd puli: `GET http://localhost:8787/v1/sessions`.

## Struktura

```
teg_proxy/
├── __main__.py        # CLI: python -m teg_proxy
├── config.py          # zmienne środowiskowe
├── server.py          # FastAPI: /v1/models, /v1/chat/completions, /v1/sessions
├── pool.py            # SessionPool: ciepłe sesje + wygasanie
├── messages.py        # OpenAI messages -> system + transkrypt, odcisk rozmowy
└── providers/
    ├── __init__.py    # REGISTRY + load_providers() (importlib, wg TEG_PROXY_PROVIDERS)
    ├── base.py        # Provider, AgentSession, Usage, ProviderError
    ├── claude.py
    ├── copilot.py
    └── codex.py
```

**Nowy dostawca** to plik `providers/<nazwa>.py` z klasą dziedziczącą po `Provider` (`list_models`, `open_session`) i `AgentSession` (`ask`, `close`) oraz jedna linijka w `REGISTRY`.

## Ograniczenia (celowe: to narzędzie do nauki)

- Tylko czat. Embeddingów nie ma; do nich służy GitHub Models albo Ollama (`embeddinggemma`).
- `temperature`, `top_p` i `max_tokens` są ignorowane.
- Brak tool callingu w formacie OpenAI. Wbudowane narzędzia agentów są **wyłączone**, więc model nic nie czyta ani nie uruchamia na komputerze użytkownika.
- Claude: proxy wyłącza konektory MCP z konta claude.ai (`strict_mcp_config`). Bez tego każde zapytanie miało ~108 tys. tokenów kontekstu zamiast ~400.
- `stream=True` działa, ale odpowiedź przychodzi jednym kawałkiem.

## Stan testów (2026-10-01)

| Dostawca | Status |
|---|---|
| Claude (Haiku 4.5) | przetestowany na żywo: odpowiedzi, historia, ciepłe sesje, wygasanie, streaming |
| Copilot | ścieżka błędu przetestowana (401 bez logowania); odpowiedź do sprawdzenia po `copilot login` |
| Codex | lista modeli i ścieżka błędu przetestowane (401); odpowiedź do sprawdzenia po `codex login` |
