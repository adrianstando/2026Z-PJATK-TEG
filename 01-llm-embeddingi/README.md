# Zajęcia 1: LLM i embeddingi

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/adrianstando/2026Z-PJATK-TEG/blob/main/01-llm-embeddingi/notebook.ipynb)
[![Open in Deepnote](https://deepnote.com/buttons/launch-in-deepnote-small.svg)](https://deepnote.com/launch?url=https://github.com/adrianstando/2026Z-PJATK-TEG/blob/main/01-llm-embeddingi/notebook.ipynb)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/adrianstando/2026Z-PJATK-TEG)

- **Prezentacja:** https://adrianstando.github.io/2026Z-PJATK-TEG/zajecia/01-llm-embeddingi/
- **Notebook z wynikami:** https://adrianstando.github.io/2026Z-PJATK-TEG/notebook/01-llm-embeddingi/
- **Zadanie:** [zadanie.ipynb](zadanie.ipynb) · [Colab](https://colab.research.google.com/github/adrianstando/2026Z-PJATK-TEG/blob/main/01-llm-embeddingi/zadanie.ipynb)

## Zakres

- proces generowania tekstu: rozkład kolejnego tokenu, temperatura, top-k, top-p,
- tokeny i koszt wywołania, w tym tokeny rozumowania,
- wywołanie modelu z Pythona, rozmowa z historią, prosty agent z narzędziami,
- embeddingi i miary podobieństwa (cosinus, iloczyn skalarny, odległość euklidesowa),
- mini-wyszukiwarka wektorowa.

## Przed zajęciami

Skonfigurowany dostęp do modelu: [00-dostep-do-llm](../00-dostep-do-llm/README.md).

## Zadanie

[zadanie.ipynb](zadanie.ipynb): dostęp do LLM i wywołanie z wymuszonym formatem, porównanie kosztu w tokenach (polski i angielski), mini-wyszukiwarka na własnych dokumentach z analizą błędu.

Oddanie mailem z tematem `[TEG] lab-01`, notebook z wynikami komórek, przed zajęciami 2.

## Uwagi do notebooka

- Pierwsza komórka kodu wybiera dostawcę (`azure`, `openai`, `deepseek`, `ollama`, `proxy`); dalszy kod jest wspólny.
- Zapisane wyniki: czat z OpenAI (`gpt-5-nano`, `gpt-4.1-mini`), embeddingi z lokalnej Ollamy (`embeddinggemma`), a w porównaniach modeli także `text-embedding-3-small`. Inne modele dadzą inne liczby; różnice między modelami też są przedmiotem porównań.
- Komórki z tagiem `web:*` są pokazywane na prezentacji.
