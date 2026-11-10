# Zajęcia 7: Skillathon

- **Prezentacja, oś czasu zajęć i temat (po podaniu hasła):** https://adrianstando.github.io/2026Z-PJATK-TEG/zajecia/07-skillathon/

Zespoły po 3–4 osoby piszą skille dla agenta kodującego i składają je w jeden plugin. Jedna osoba uruchamia agenta, który buduje z nimi aplikację w Next.js. Temat i sugerowane skille prowadzący podaje na początku zajęć.

**Ocenie podlegają wyłącznie skille zespołu** (plugin albo skonfigurowany folder agenta, w dowolnym narzędziu). Aplikacja służy do sprawdzenia skilli: to, czy powstała, jak działa i jakim modelem została zbudowana, nie wpływa na ocenę.

## Zasady

1. Zespół 3–4 osoby, niezależny od par projektowych. Najlepiej z co najmniej jedną osobą z działającym agentem kodującym.
2. Każda osoba pisze co najmniej jeden skill. Wystarczy do tego czat w przeglądarce (np. darmowy Gemini albo ChatGPT).
3. Jedna osoba zbiera skille i składa z nich plugin albo układa je w folderze konfiguracji agenta.
4. Agenta wybiera zespół: Claude Code, GitHub Copilot (plan Student), Codex, Antigravity, Cursor, OpenCode z darmowymi modelami i inne.

## Harmonogram (90 minut, czasy orientacyjne)

| Czas | Faza | Wynik fazy |
|---|---|---|
| 0–10 | Wstęp i temat | wybrany temat, podział skilli |
| 10–35 | Każda osoba pisze swój skill | co najmniej jeden `SKILL.md` na osobę |
| 35–40 | Plugin | skille w jednym pluginie albo folderze agenta |
| 40–70 | Agent koduje aplikację; reszta zespołu poprawia skille | aplikacja, poprawione skille |
| 70–90 | Prezentacje, do 5 minut na zespół | aplikacja i jedno zdanie o każdym skillu |

## Gdzie leżą skille

| Narzędzie | Folder skilli | Plik instrukcji |
|---|---|---|
| Claude Code | `.claude/skills/` albo plugin (`.claude-plugin/plugin.json` + `skills/`) | `CLAUDE.md` |
| Codex, Antigravity | `.agents/skills/` | `AGENTS.md` |
| GitHub Copilot | `.github/skills/` (czyta też `.claude/skills/`) | `AGENTS.md`, `.github/copilot-instructions.md` |
| Cursor | `.cursor/skills/` (czyta też `.claude/skills/`) | `AGENTS.md` |

## Plugin Claude Code

```
teg-zespol/
├── .claude-plugin/plugin.json     {"name": "teg-zespol", "description": "…", "version": "1.0.0"}
├── skills/<nazwa>/SKILL.md
├── hooks/hooks.json               opcjonalnie
└── agents/                        opcjonalnie: subagenci
```

```bash
claude plugin validate ./teg-zespol
claude --plugin-dir ./teg-zespol
```

Skille z pluginu mają prefiks: `/teg-zespol:nazwa-skilla`. Plugin może złożyć agent w nowej sesji: dostaje wszystkie skille, prośbę o plugin, sprawdzenie, czy opisy się nie nakładają, i propozycje hooków. Dokumentacja: https://code.claude.com/docs/en/plugins/create

## Testy ze znajomymi

Aplikację z laptopa można na chwilę wystawić pod publicznym linkiem. Są na to cztery sposoby: porty w Codespaces, Dev Tunnels w VS Code, Cloudflare Tunnel (bez konta) i ngrok (darmowe konto).

```bash
npx cloudflared tunnel --url http://localhost:3000   # bez konta
ngrok http 3000                                     # darmowe konto
```

W Codespaces: zakładka *Ports*, port 3000, widoczność *Public*. W VS Code: *Dev Tunnels*. Link działa dla każdego, kto go zna.

## Oddanie

Mail z tytułem `[TEG] skillathon` na koniec zajęć: wysyła jedna osoba, pozostali członkowie zespołu w DW (do wiadomości), jak przy zgłoszeniu zespołu projektowego. W zipie:

- konfiguracja agenta: folder `.claude/`, `.agents/`, `.github/` albo `.cursor/` ze skillami lub pluginem i plikiem instrukcji (`CLAUDE.md`, `AGENTS.md`);
- zrzuty ekranu aplikacji z demo.

Bez kodu źródłowego aplikacji.

## Nieobecni

Osoby nieobecne na zajęciach 7 dostają na kanale Teams hasło do innego tematu (na stronie zajęć, slajd „Nieobecni”). Praca samodzielna, oddanie mailem z tytułem `[TEG] skillathon` przed zajęciami 8.

## Poradnik pisania skilli

### Czym jest skill

Skill to katalog z plikiem `SKILL.md`: instrukcja, którą Claude Code wczytuje **sam, gdy zadanie do niej pasuje**, albo na żądanie przez `/nazwa-skilla`. Skille projektu leżą w `.claude/skills/` i trafiają do repo razem z kodem.

```
.claude/skills/
└── walidacja-danych/
    ├── SKILL.md          wymagany: frontmatter + instrukcja
    ├── references/       opcjonalnie: tabele reguł, schematy, czytane na żądanie
    ├── scripts/          opcjonalnie: skrypty do uruchomienia
    └── assets/           opcjonalnie: szablony, dane przykładowe
```

Obok skilli działa `CLAUDE.md`: plik z zasadami projektu, wczytywany w każdej sesji. W sesji `/skills` pokazuje skille widoczne dla Claude Code.

**Inne narzędzia.** Format `SKILL.md` jest otwartym standardem [Agent Skills](https://agentskills.io/specification), więc te same pliki działają w Copilocie, Codex, Antigravity i Cursorze; różni się tylko folder (tabela [Gdzie leżą skille](#gdzie-leżą-skille)). Te narzędzia zamiast `CLAUDE.md` czytają `AGENTS.md`. Codex wywołuje skill wprost przez `$nazwa-skilla`.

### Kiedy skill się ładuje

Ładowanie jest trzystopniowe:

1. **Na starcie** agent zna tylko `name` i `description` wszystkich skilli (ok. 100 tokenów na skill).
2. **Gdy zadanie pasuje do `description`**, agent wczytuje całe `SKILL.md`. Zalecenie standardu: poniżej 5000 tokenów i 500 linii.
3. **Pliki z `references/` i `scripts/`** czyta albo uruchamia dopiero wtedy, gdy `SKILL.md` każe po nie sięgnąć.

Wniosek: o tym, czy skill zadziała, decyduje `description`. Najlepsza treść nic nie da, jeśli agent nie otworzy pliku.

`CLAUDE.md` jest wczytywany zawsze, w każdej sesji (zalecane poniżej 200 linii). Trafiają tam zasady obowiązujące w każdym zadaniu (polecenia, struktura, styl). Skill zawiera wiedzę potrzebną tylko przy określonym typie zadania.

### Frontmatter

```yaml
---
name: walidacja-danych
description: Reguły walidacji danych wejściowych i komunikaty błędów zwracane użytkownikowi. Używać przy dodawaniu formularza, endpointu albo importu pliku, przy obsłudze błędnych danych i przy pisaniu komunikatów o błędach.
---
```

| Pole | Wymagania |
|---|---|
| `name` | małe litery, cyfry i myślniki; do 64 znaków; bez myślnika na początku, na końcu i podwójnego; **identyczne z nazwą katalogu** |
| `description` | do 1024 znaków; mówi, *co* skill robi i *kiedy* go użyć; słowa, którymi użytkownik opisze zadanie |
| opcjonalne w Claude Code | `when_to_use` (dodatkowe frazy wyzwalające; razem z `description` obcinane do 1536 znaków), `disable-model-invocation: true` (tylko ręczne `/nazwa`, np. dla skilli ze skutkami ubocznymi), `paths` (glob, skill aktywny tylko przy pasujących plikach), `allowed-tools` |

Sprawdzony wzór opisu: **„Robi X. Używać, gdy A, B albo C.”** Kilka sformułowań tej samej sytuacji daje agentowi kilka okazji do dopasowania. Zdanie „Nie dotyczy …” odgranicza skill od sąsiednich.

### Co jest w treści

Dobry skill przekazuje agentowi **decyzję, której agent sam nie podejmie**: próg liczbowy, kontrakt danych, nazwę pola, format daty, regułę z doświadczenia zespołu. Nie opisuje, jak napisać parser czy endpoint, bo to agent umie.

Sprawdzony układ:

1. **Wstęp** (1–2 zdania): jaką decyzję rozstrzyga skill.
2. **Kontrakt**: wejście i wyjście z nazwami pól, typami, formatami, kodami błędów. Najczęściej pomijana sekcja i najczęstszy powód, dla którego skille dwóch osób do siebie nie pasują.
3. **Kroki** w trybie rozkazującym.
4. **Czego nie robić**: pułapki i skróty, które kuszą agenta.
5. **Sprawdzenie**: polecenie albo scenariusz, który potwierdza, że reguły są spełnione.

Szablon do skopiowania:

```markdown
---
name: nazwa-skilla
description: Robi X. Używać, gdy <sytuacja 1>, <sytuacja 2> albo <sytuacja 3>. Nie dotyczy <czego>.
---

# nazwa-skilla

Jedno–dwa zdania: jaką decyzję rozstrzyga ten skill, której agent nie podejmie sam.

## Kontrakt

Wejście: co przychodzi (typ, format, skąd).
Wyjście: co powstaje (nazwy pól, typy, format dat, jednostki, kody błędów).

## Kroki

1. Krok w trybie rozkazującym, konkretny: „daty w formacie YYYY-MM-DD”, nie „odpowiedni format daty”.

## Czego nie robić

- Pułapka, w którą wpadnie ktoś, kto tego nie przeczytał, i dlaczego.

## Sprawdzenie

Polecenie albo scenariusz, który pokazuje, że reguły są spełnione (np. `npm test`).
```

### Przykłady: źle i dobrze

| Źle | Dobrze | Dlaczego |
|---|---|---|
| `description: Obsługa dat` | `description: Format i strefa czasowa dat w API i w plikach CSV. Używać przy zapisie, odczycie i porównywaniu dat oraz przy filtrach po dacie.` | agent nie wie z pierwszej wersji, przy jakim zadaniu sięgnąć po skill |
| `description: Ten skill używa zod do walidacji` | `description: Reguły walidacji danych wejściowych … Używać przy dodawaniu formularza, endpointu albo importu …` | opisuje implementację, a nie sytuację użytkownika |
| „Daty formatuj odpowiednio.” | „Daty jako `YYYY-MM-DD`, czas w UTC, pole `created_at`.” | „odpowiednio” każdy rozumie inaczej |
| „Pisz czysty, dobrze udokumentowany kod.” | — (usunąć) | agent i tak to robi; zdanie zajmuje kontekst |
| „Błędne dane obsłuż.” | „Błąd walidacji: HTTP 422, ciało `{"error": "<pole>: <powód>"}`. Pusta lista to nie błąd: 200 i `[]`.” | konkretny kontrakt da się sprawdzić testem |
| 400 linii w `SKILL.md` | 60 linii + `references/reguly.md` z tabelą | całe `SKILL.md` trafia do kontekstu przy każdym użyciu |

### Typowe błędy

| Błąd | Skutek | Poprawka |
|---|---|---|
| `name` inny niż nazwa katalogu | część narzędzi nie wczyta skilla | ujednolicić |
| nieprawidłowy YAML (np. dwukropek w opisie bez cudzysłowu) | skill bez metadanych, agent go nie wybiera | opis w cudzysłowie albo `description: >` w kilku liniach |
| dwa skille z nachodzącymi opisami | agent wybiera losowo albo oba naraz z regułami sprzecznymi | rozdzielić zakresy, dopisać „Nie dotyczy …”, albo scalić |
| sprzeczne reguły w skillach różnych osób | kod raz w jednym, raz w drugim stylu | rozstrzygnąć przy składaniu pluginu; wspólną regułę przenieść do `CLAUDE.md` |
| zasady potrzebne zawsze zapisane w skillu | agent ich nie widzi, gdy skill się nie załaduje | przenieść do `CLAUDE.md` |
| sam opis problemu bez kroków | agent improwizuje | dopisać kroki i kontrakt |

### Jak sprawdzić skill bez agenta

1. Zasłonić wszystko poza `description`. Czy wiadomo, kiedy go użyć?
2. Czy osoba spoza zespołu, wykonując kroki, zrobi to tak samo? Jeśli gdzieś trzeba zgadywać, brakuje konkretu.
3. Czy jest tam coś, co agent wie i bez skilla? Do usunięcia.

### Jak sprawdzić skill z agentem

- `/skills` w sesji Claude Code: czy skill jest widoczny. `/nazwa-skilla` wywołuje go wprost.
- Test wyboru: polecenie sformułowane tak, jak sformułuje je użytkownik, bez nazwy skilla. Jeśli agent nie wczyta skilla, poprawić `description`.

### Szkic skilla z pomocą modelu

Model czatowy dobrze robi pierwszą wersję, jeśli dostanie format i konkret. Przykładowy prompt:

```
Napisz plik SKILL.md w formacie Agent Skills.
Frontmatter YAML: name (małe litery i myślniki) i description (2–3 zdania:
co robi i kiedy użyć, kilka sformułowań sytuacji, zdanie "Nie dotyczy ...").
Treść: nagłówek, 1–2 zdania wstępu, sekcje Kontrakt, Kroki, Czego nie robić,
Sprawdzenie. 40–100 linii, tryb rozkazujący, konkretne nazwy pól, formaty
i liczby, bez ogólników i bez rad, które programista zna.

Projekt: [opis use case'u i stosu]
Mój skill: [nazwa] — [3–5 zdań, jakie decyzje ma rozstrzygać]
```

Wynik trzeba przeczytać i przyciąć: modele dopisują sekcje „Przegląd” i „Dobre praktyki” oraz tryb przypuszczający. Zostaje tylko instrukcja.

## Źródła

- [Agent Skills: specyfikacja](https://agentskills.io/specification)
- [Claude Code: skills](https://code.claude.com/docs/en/skills)
- [Claude Code: CLAUDE.md](https://code.claude.com/docs/en/memory) · [pluginy](https://code.claude.com/docs/en/plugins/create)
- [GitHub Copilot: adding agent skills](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-skills)
- [Codex: skills](https://developers.openai.com/codex/skills)
- [Cursor: skills](https://cursor.com/docs/skills)
- [Antigravity: agent skills](https://antigravity.google/docs/skills/)
