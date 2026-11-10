# Zajęcia 4: GraphRAG i grafy wiedzy

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/adrianstando/2026Z-PJATK-TEG/blob/main/04-graphrag/notebook.ipynb)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/adrianstando/2026Z-PJATK-TEG)

- **Prezentacja:** https://adrianstando.github.io/2026Z-PJATK-TEG/zajecia/04-graphrag/
- **Notebook z wynikami:** https://adrianstando.github.io/2026Z-PJATK-TEG/notebook/04-graphrag/
- **Zadanie:** [zadanie.ipynb](zadanie.ipynb) · [Colab](https://colab.research.google.com/github/adrianstando/2026Z-PJATK-TEG/blob/main/04-graphrag/zadanie.ipynb)

## Zakres

- graf typu property graph i Neo4j: węzły, relacje, właściwości; te same dane w tabelach relacyjnych,
- składnia Cypher na przykładach: `MATCH`, `WHERE`, `RETURN`, agregacje, ścieżki, `WITH`, `MERGE`, `DETACH DELETE`,
- ekstrakcja grafu wiedzy z tekstu przez LLM: schemat Pydantic i structured outputs,
- spójność encji („K8s” i „Kubernetes” to jeden węzeł),
- graf TalentMatch i dłuższe zapytanie dopasowania kandydatów do zapytania ofertowego (RFP),
- agentic GraphRAG: agent w LangGraph z narzędziem do zapytań Cypher,
- porównanie RAG, structured RAG (filtr po metadanych + wyszukiwanie wektorowe) i GraphRAG.

## Przed zajęciami

1. Skonfigurowany dostęp do modelu: [00-dostep-do-llm](../00-dostep-do-llm/README.md). Ekstrakcja grafu korzysta ze structured outputs, a agent z wywołań narzędzi; najpewniej działa to w OpenAI i Azure.
2. Baza Neo4j, jeden z dwóch sposobów poniżej.

### Neo4j

| Sposób | Jak |
|---|---|
| **Docker Compose** (lokalnie albo w chmurze, np. GitHub Codespaces) | `docker compose up -d` w tym folderze. Przeglądarka grafu: http://localhost:7474 (w Codespaces z zakładki *Ports*), logowanie `neo4j` / `password123`. Zatrzymanie: `docker compose down` (dane zostają w wolumenie; `down -v` je usuwa). |
| **Neo4j AuraDB Free** | Darmowa instancja w chmurze: https://console.neo4j.io → *Create instance* → *Free*. Plik `.txt` pobrany przy tworzeniu zawiera `NEO4J_URI` (`neo4j+s://…`), `NEO4J_USERNAME` i `NEO4J_PASSWORD`; trzeba je wpisać do `.env` albo do *Secrets* w Colabie. Instancja usypia się po kilku dniach bez użycia. |

Notebook czyta `NEO4J_URI`, `NEO4J_USERNAME` i `NEO4J_PASSWORD`; bez nich łączy się z lokalnym Dockerem.

## Dane

`data/` zawiera 14 syntetycznych CV i 3 zapytania ofertowe w Markdownie, wygenerowane skryptem `data/generate_data.py` (bez LLM, zawsze ten sam wynik). `ground_truth.json` to fakty, z których powstały teksty: służy do sprawdzenia jakości ekstrakcji i wyliczenia poprawnych odpowiedzi.

Po uruchomieniu notebooka w `data/` pojawiają się `extracted.json` (wynik ekstrakcji, ponowne uruchomienie nie wywołuje modelu) i `results.json` (porównanie trzech podejść, z którego korzysta prezentacja).

## Zadanie

[zadanie.ipynb](zadanie.ipynb): własna baza Neo4j, graf z pięciu przepisów ze strony aniagotuje.pl wyodrębniony przez LLM według podanego schematu i agent ReAct z jednym narzędziem `run_cypher`, który odpowiada na pytania typu „mam mąkę, jajka i cukier, co mogę upiec?”.

Oddanie mailem z tematem `[TEG] lab-04`: notebook z wynikami komórek i folder `przepisy/`, przed zajęciami 5.

## Uwagi do notebooka

- Pierwsza komórka kodu wybiera dostawcę modelu (`LLM_PROVIDER`), jak na zajęciach 1.
- Zapisane wyniki: OpenAI (`gpt-5-nano` do ekstrakcji i filtrów, `gpt-5.4-nano` dla agenta i odpowiedzi RAG, `text-embedding-3-small`), Neo4j 2026.09 w Dockerze. Inne modele dadzą inne wyniki ekstrakcji i porównania.
- Biblioteki: oficjalny sterownik `neo4j`, SDK `openai`, Chroma, LangGraph. Gotowe odpowiedniki z bibliotek: `neo4j-graphrag` (Neo4j) oraz `langchain-neo4j`.
- Komórki z tagiem `web:*` są pokazywane na prezentacji.
