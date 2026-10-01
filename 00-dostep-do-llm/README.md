# 00. Dostęp do modeli językowych

Dostęp do co najmniej jednego modelu należy skonfigurować przed pierwszymi zajęciami. Zalecane są dwie opcje, na wypadek gdyby jedna przestała działać w trakcie zajęć.

## Porównanie opcji

| Opcja | Koszt | Czat | Embeddingi | Uwagi |
|---|---|---|---|---|
| [GitHub Copilot](#github-copilot) | darmowy dla studentów (Student Developer Pack) | ✅ | ❌ | najlepsze modele bez opłat; z Pythona przez Copilot SDK albo proxy |
| [GitHub Models](#github-models) | darmowe | ✅ | ✅ | wystarczy konto GitHub; dzienne limity zapytań |
| [Ollama](#ollama) | darmowe, lokalnie | ✅ | ✅ | wymaga mocnego komputera; modele wyraźnie słabsze od komercyjnych |
| [Azure for Students](#azure-for-students) | 100 USD na 12 miesięcy | ✅ | ✅ | brak najnowszych modeli; dostępność zależy od regionu |
| [Proxy dla subskrypcji](#proxy-dla-subskrypcji) | w ramach subskrypcji Copilot / Claude / ChatGPT | ✅ | ❌ | tylko na własnym komputerze |
| [DeepSeek](#deepseek-i-openrouter) | płatne, bardzo tanie | ✅ | ❌ | serwery w Chinach |
| [OpenRouter](#deepseek-i-openrouter) | płatne; część modeli darmowa | ✅ | ✅ | jeden klucz do modeli wielu dostawców |
| [OpenAI, Anthropic](#openai-i-anthropic) | płatne | ✅ | ✅ (OpenAI) | najnowsze modele |

**Zalecenie:** GitHub Copilot do czatu i agentów, a do embeddingów GitHub Models albo Ollama.

Wszystkie opcje poza samym Copilot SDK udostępniają API zgodne z OpenAI, więc kod z zajęć działa z każdą z nich. W notebookach dostawcę wybiera się zmienną `LLM_PROVIDER` w pliku `.env`:

```bash
cp .env.example .env     # w głównym folderze repozytorium
```

> **Plik `.env` nie może trafić do repozytorium ani do maila z zadaniem.** Klucz opublikowany w publicznym repozytorium trzeba natychmiast unieważnić: automaty skanują GitHuba w ciągu kilku minut.

---

## GitHub Copilot

W ramach [GitHub Student Developer Pack](https://education.github.com/pack) studenci dostają bezpłatnie GitHub Copilot Pro: dostęp do modeli OpenAI, Anthropic i Google w ramach miesięcznego limitu. Ta sama subskrypcja obsługuje agentów kodujących (Copilot w VS Code i Copilot CLI), wykorzystywanych na zajęciach 6 i w projekcie.

1. Zgłoszenie do Student Developer Pack z adresu uczelnianego; weryfikacja trwa zwykle od kilku godzin do kilku dni.
2. Instalacja Copilot CLI i logowanie: `copilot login`.
3. Użycie z Pythona na jeden z dwóch sposobów:
   - bezpośrednio przez [Copilot SDK](examples/07_copilot_sdk.py) (`pip install github-copilot-sdk`),
   - przez [proxy dla subskrypcji](#proxy-dla-subskrypcji), które udostępnia Copilota jako API zgodne z OpenAI. Wtedy działa cały kod z notebooków (`LLM_PROVIDER=proxy`).

Copilot nie udostępnia embeddingów, więc do nich potrzebny jest GitHub Models albo Ollama.

## GitHub Models

Darmowy dostęp do modeli OpenAI i innych dostawców przez konto GitHub. Działa w Colabie, Deepnote i lokalnie.

1. [Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/personal-access-tokens) → *Generate new token*.
2. Ważność do końca semestru; w *Permissions → Account permissions* uprawnienie **Models: Read-only**.
3. Wpis w `.env`:
   ```
   LLM_PROVIDER=github
   GITHUB_TOKEN=github_pat_...
   ```
4. Test: `python examples/01_github_models.py`.

Modele: `openai/gpt-4.1-mini`, `openai/gpt-5-nano`, `openai/text-embedding-3-small` i [inne](https://github.com/marketplace?type=models). Dzienne limity są niskie, ale wystarczają na zajęcia.

## Ollama

Modele działają lokalnie: bez opłat, bez konta i bez internetu. Wymagany mocny komputer (min. 16 GB RAM, najlepiej z kartą graficzną). Nie działa w Colabie.

1. Instalacja: [ollama.com/download](https://ollama.com/download).
2. Pobranie modeli:
   ```bash
   ollama pull gemma4:e4b        # czat i tool calling, model rozumujący (~10 GB)
   ollama pull gemma3:1b         # mały model bez rozumowania (~0,8 GB)
   ollama pull embeddinggemma    # embeddingi (~0,6 GB)
   ```
3. Wpis w `.env`: `LLM_PROVIDER=ollama`.
4. Test: `python examples/08_ollama.py`.

Modele lokalne są dużo słabsze od komercyjnych, ale wystarczają do zrozumienia mechaniki i nie mają limitów zapytań.

## Azure for Students

100 USD do wykorzystania w ciągu 12 miesięcy, bez karty kredytowej, po weryfikacji adresu uczelnianego.

Subskrypcja studencka nie daje dostępu do najnowszych modeli. Dostępne są mniejsze modele (np. `gpt-4o-mini`, `gpt-oss`) z niskimi limitami ([szczegóły limitów](https://learn.microsoft.com/azure/ai-foundry/openai/quotas-limits#other-offer-types)). Dostępność modeli dla subskrypcji studenckich różni się między regionami, dlatego przy konfiguracji należy sprawdzić kilka regionów.

1. Aktywacja: [azure.microsoft.com/free/students](https://azure.microsoft.com/free/students/), logowanie adresem uczelnianym.
2. W [Azure AI Foundry](https://ai.azure.com): utworzenie zasobu. Przed wyborem regionu trzeba sprawdzić w *Model catalog*, gdzie dostępne są potrzebne modele.
3. *Models + endpoints → Deploy model*: osobny deployment dla każdego modelu, np. `gpt-4o-mini` i `text-embedding-3-small`. Nazwa deploymentu to wartość parametru `model=` w kodzie.
4. Endpoint i klucz z zakładki zasobu, wpis w `.env`:
   ```
   LLM_PROVIDER=azure
   AZURE_OPENAI_ENDPOINT=https://<zasob>.openai.azure.com/
   AZURE_OPENAI_API_KEY=...
   ```
5. Test: `python examples/02_azure_openai.py`.

Błąd `Insufficient quota` oznacza, że dany model ma w subskrypcji limit 0. Rozwiązaniem jest inny model albo inny region.

## Proxy dla subskrypcji

[`tools/teg-proxy`](../tools/teg-proxy/README.md) to lokalny serwer zgodny z API OpenAI, który korzysta z subskrypcji przez oficjalne SDK agentów:

| Subskrypcja | Wymagany program | Model w kodzie |
|---|---|---|
| GitHub Copilot | Copilot CLI (`copilot login`) | `copilot/gpt-5-mini` |
| Claude Pro / Max | Claude Code (`claude`, potem `/login`) | `claude-haiku-4-5` |
| ChatGPT Plus / Pro | Codex (`codex login`) | `codex/gpt-5.5` |

Uruchomienie:

```bash
cd tools/teg-proxy
pip install -r requirements.txt
python -m teg_proxy --providers copilot,claude,codex
```

W notebookach: `LLM_PROVIDER=proxy`. Proxy nie liczy embeddingów; do nich służy `EMBED_PROVIDER` (domyślnie Ollama).

> Proxy służy wyłącznie do użytku własnego. Subskrypcja jest osobista, a udostępnianie jej innym osobom łamie regulamin dostawcy.

## DeepSeek i OpenRouter

- **[DeepSeek](https://platform.deepseek.com):** bardzo tanie API zgodne z OpenAI (`base_url="https://api.deepseek.com"`, modele `deepseek-chat` i `deepseek-reasoner`). Brak embeddingów. Dane przetwarzane są na serwerach w Chinach, więc nie nadaje się do danych wrażliwych. `LLM_PROVIDER=deepseek`, `DEEPSEEK_API_KEY=...`. Przykład: [`examples/10_deepseek.py`](examples/10_deepseek.py).
- **[OpenRouter](https://openrouter.ai):** jeden klucz do modeli wielu dostawców; część modeli (oznaczonych `:free`) jest darmowa z limitami. Przykład: [`examples/11_openrouter.py`](examples/11_openrouter.py).

## OpenAI i Anthropic

- **OpenAI:** klucz na [platform.openai.com/api-keys](https://platform.openai.com/api-keys); doładowanie 5 USD wystarcza na zajęcia w całym semestrze. `LLM_PROVIDER=openai`, `OPENAI_API_KEY=sk-...`.
- **Anthropic (Claude):** klucz na [platform.claude.com](https://platform.claude.com). Anthropic nie udostępnia modeli embeddingów.

Po założeniu konta należy od razu ustawić limit wydatków (OpenAI: *Limits*, Anthropic: *Spend limits*).

## Agenci kodujący

Do zajęć 6, skillathonu i projektu potrzebny jest agent kodujący. Najprostsza opcja to **GitHub Copilot** (darmowy dla studentów, VS Code i CLI). Alternatywy: Claude Code (subskrypcja Claude), Codex (subskrypcja ChatGPT), [Google Antigravity](https://antigravity.google) (środowisko z agentem; warunki planu darmowego do sprawdzenia przy rejestracji).

---

## Przykłady wywołań z Pythona

Wszystkie w katalogu [`examples/`](examples/):

| Plik | Zawartość | Instalacja |
|---|---|---|
| [`01_github_models.py`](examples/01_github_models.py) | czat i embeddingi przez GitHub Models | `pip install openai python-dotenv` |
| [`02_azure_openai.py`](examples/02_azure_openai.py) | Azure OpenAI (`AzureOpenAI`, deploymenty) | jw. |
| [`03_openai.py`](examples/03_openai.py) | OpenAI API, `usage` i tokeny rozumowania | jw. |
| [`04_anthropic.py`](examples/04_anthropic.py) | Anthropic Messages API: inny kształt odpowiedzi | `pip install anthropic` |
| [`05_claude_agent_sdk.py`](examples/05_claude_agent_sdk.py) | agent Claude Code z Pythona, czytający pliki w katalogu | `pip install claude-agent-sdk` + Claude Code |
| [`06_codex_sdk.py`](examples/06_codex_sdk.py) | agent OpenAI Codex z Pythona | `pip install openai-codex` + Codex |
| [`07_copilot_sdk.py`](examples/07_copilot_sdk.py) | GitHub Copilot z Pythona | `pip install github-copilot-sdk` + Copilot CLI |
| [`08_ollama.py`](examples/08_ollama.py) | modele lokalne, ten sam klient `OpenAI` | Ollama |
| [`09_teg_proxy.py`](examples/09_teg_proxy.py) | subskrypcje przez proxy | uruchomione proxy |
| [`10_deepseek.py`](examples/10_deepseek.py) | DeepSeek | `pip install openai python-dotenv` |
| [`11_openrouter.py`](examples/11_openrouter.py) | OpenRouter | jw. |

Przykłady 01–04 i 08–11 to zwykłe API: wiadomości na wejściu, tekst na wyjściu. Przykłady 05–07 to **agenci**: dostają zadanie, samodzielnie wybierają narzędzia (odczyt plików, terminal) i działają w pętli. Ich SDK wymagają zainstalowanego w systemie programu agenta (`claude`, `codex`, `copilot`), ponieważ uruchamiają go pod spodem.

## Środowisko do notebooków

| Środowisko | Uruchomienie | Zalety | Ograniczenia |
|---|---|---|---|
| Google Colab | przycisk *Open in Colab* przy zajęciach; klucze w panelu *Secrets* z dostępem dla notebooka | brak instalacji | brak Ollamy i proxy; środowisko znika po zamknięciu |
| Deepnote | *Open in Deepnote*, darmowy plan [Education](https://deepnote.com/education) | wspólna edycja notebooka w zespole | wymaga konta |
| GitHub Codespaces | [![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/adrianstando/2026Z-PJATK-TEG) | pełne VS Code w przeglądarce, terminal, Docker | limit godzin (wyższy ze Student Developer Pack) |
| lokalnie | `pip install -r requirements.txt` albo `uv sync` | działa wszystko, w tym Ollama, Neo4j i proxy | instalacja po stronie użytkownika |
