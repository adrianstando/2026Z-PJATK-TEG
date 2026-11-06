# Zajęcia 3: Agenci i tool calling

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/adrianstando/2026Z-PJATK-TEG/blob/main/03-agenci/notebook.ipynb)
[![Open in Deepnote](https://deepnote.com/buttons/launch-in-deepnote-small.svg)](https://deepnote.com/launch?url=https://github.com/adrianstando/2026Z-PJATK-TEG/blob/main/03-agenci/notebook.ipynb)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/adrianstando/2026Z-PJATK-TEG)

- **Prezentacja:** https://adrianstando.github.io/2026Z-PJATK-TEG/zajecia/03-agenci/
- **Notebook z wynikami:** https://adrianstando.github.io/2026Z-PJATK-TEG/notebook/03-agenci/

## Zakres

- tool calling: `tools`, argumenty jako JSON, `tool_call_id`,
- pętla ReAct napisana ręcznie i koszt rosnącego kontekstu,
- łańcuchy w LangChain, ta sama pętla jako graf w LangGraph (`StateGraph`, `ToolNode`, `tools_condition`) i gotowe `create_agent`,
- pamięć krótkoterminowa (checkpointer, `thread_id`) i długoterminowa (store),
- agentic RAG: agent decyduje, czy i czego szukać,
- wyszukiwanie w sieci z DuckDuckGo (biblioteka `ddgs`).

## Przed zajęciami

Skonfigurowany dostęp do modelu: [00-dostep-do-llm](../00-dostep-do-llm/README.md). Do wyszukiwania w bazie wiedzy potrzebne są embeddingi: lokalna Ollama z `embeddinggemma` albo dostawca z embeddingami (`EMBED_PROVIDER`).

## Zadanie

[zadanie.ipynb](zadanie.ipynb): własny agent kodujący w LangGraph, który na podstawie jednego polecenia tworzy małą aplikację FastAPI z bazą SQLite i testami.

Oddanie mailem z tematem `[TEG] lab-03`, notebook z wynikami komórek, przed zajęciami 4.

## Uwagi do notebooka

- Pierwsza komórka kodu wybiera dostawcę tak samo jak na zajęciach 1.
- Baza wiedzy to 10 krótkich dokumentów fikcyjnej firmy Nordwind: [`data/nordwind.json`](data/nordwind.json). W Colabie notebook pobiera plik z repozytorium.
- Zapisane wyniki: agent na OpenAI (`gpt-5.4-nano`), embeddingi z lokalnej Ollamy (`embeddinggemma`). Przebieg agenta zależy od modelu i zmienia się między uruchomieniami: inna liczba kroków albo inne zapytania to normalne zjawisko.
- Komórki z tagiem `web:*` są pokazywane na prezentacji.
