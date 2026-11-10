# Zadanie 6: skill security-review

Skill, który po skończonej pracy nad funkcją przegląda kod pod kątem luk bezpieczeństwa, i sprawdzenie, czy coś zmienia w pracy agenta kodującego.

Oddanie mailem z tematem `[TEG] lab-06`, przed zajęciami 7. Bez kluczy API i bez plików `.env`.

## 1. Skill

Napisz skill `security-review` w formacie Agent Skills (folder z `SKILL.md`, opcjonalnie `references/`, `scripts/`, `assets/`). Ten sam format czytają Claude Code, Codex, GitHub Copilot, Cursor i Antigravity; różni się tylko folder, do którego go wkładasz.

Skill ma:

- uruchamiać się po skończonej pracy nad funkcją albo przed oddaniem zmian (zadbaj o `description`),
- sprawdzać luki z zajęć (SQL injection, sekret w kodzie, hasła bez soli, IDOR, zaufanie do klienta, race condition, brak walidacji, wyciek pól w odpowiedziach, błędy 500 zamiast 4xx, brak testów) i co najmniej dwie inne, które znajdziesz sam (np. w [OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)),
- mówić agentowi, co zrobić z każdą znalezioną luką: poprawić, dopisać test, zgłosić w odpowiedzi.

Nie przepisuj skilla `secure-api` z zajęć; możesz się nim inspirować.

## 2. Dwa przebiegi agenta

Dowolny agent kodujący: Claude Code, Codex, GitHub Copilot (agent mode), Cursor, Antigravity, OpenCode albo `harness.py` z zajęć z modelem z Ollamy (`--model ollama:<model>`). Oba przebiegi tym samym narzędziem i modelem, każdy w nowym, pustym folderze i nowej sesji, z tym samym poleceniem:

```text
Napisz w jednym pliku app.py API sklepu internetowego w FastAPI z bazą SQLite (plik shop.db).
Klienci rejestrują się i logują (JWT). Każdy może przeglądać i wyszukiwać produkty.
Zalogowany klient składa zamówienie (lista produktów i ilości; stan magazynu się zmniejsza)
i widzi szczegóły swojego zamówienia pod GET /orders/{id}. Administrator dodaje produkty
i zmienia ich ceny oraz stan magazynu. Na start: konto admin z hasłem admin123 i pięć produktów.
Dopisz requirements.txt.
```

1. **Bez skilla:** folder `bez-skilla/`, agent bez żadnej konfiguracji.
2. **Ze skillem:** folder `ze-skillem/` ze skillem w folderze skilli Twojego narzędzia (np. `.claude/skills/security-review/`). Jeśli agent sam nie sięgnie po skill, możesz go wywołać po zakończeniu (np. `/security-review`); napisz o tym w README.

## 3. README.md

Krótko, w punktach:

- narzędzie i model,
- czy agent użył skilla sam, czy trzeba go było wywołać,
- różnice między przebiegami: jakie luki są w `bez-skilla/`, a jakich nie ma w `ze-skillem/`; czy powstały testy; liczba tokenów, koszt albo czas, jeśli narzędzie je pokazuje,
- czy różnica była w ogóle widoczna; jeśli nie, dlaczego tak myślisz.

Brak różnicy też jest wynikiem: silny model może sam uniknąć części luk. Liczy się rzetelny opis.

## Zawartość zipa

```text
nazwisko-lab06.zip
├── security-review/
│   ├── SKILL.md
│   └── …            (opcjonalnie references/, scripts/, assets/)
├── bez-skilla/      (pliki aplikacji z pierwszego przebiegu, bez bazy .db i bez .venv)
├── ze-skillem/      (pliki aplikacji z drugiego przebiegu, bez folderu skilla)
└── README.md
```
