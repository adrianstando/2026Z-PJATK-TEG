"""Dane do wizualizacji zajęć 6 -> web/src/data/lesson06-*.json.

Uruchomienie (z katalogu web/, klucz OPENAI_API_KEY w ../.env):
    uv run --with openai --with python-dotenv --with tiktoken --with fastapi --with httpx --with pyjwt --with pytest \
        scripts/lesson06_data.py

Co liczy:
1. lesson06-context.json: z jakich plików repo kursu agent buduje kontekst i ile to tokenów
   (tiktoken o200k_base jako przybliżenie; każdy model ma własny tokenizer, rząd wielkości ten sam).
2. lesson06-vulns.json: luki w 06-agentic-coding/cwiczenia/app/app.py (linie znalezione po kotwicach
   w kodzie) i prawdziwy wynik `python atak.py`.
3. lesson06-runs.json NIE jest już generowany: to zapis przebiegów wcześniejszej wersji harness.py (bez LangChain,
   z atak.py w katalogu roboczym agenta), z którego slajd „Agent widzi test” bierze wywołanie atak.py.
   Obecne eksperymenty: scripts/lesson06_experiments.py.
"""

import json
import os
import pathlib
import re
import shutil
import subprocess
import sys

import tiktoken

WEB = pathlib.Path(__file__).resolve().parents[1]
ROOT = WEB.parent
EX = ROOT / "06-agentic-coding" / "cwiczenia"
OUT = WEB / "src" / "data"
TMP = pathlib.Path(os.environ.get("LESSON06_TMP", "/tmp/lesson06-runs"))
SITE = re.compile(r"/\S*/site-packages/")
enc = tiktoken.get_encoding("o200k_base")


def tokens(text: str) -> int:
    return len(enc.encode(text))


def rel(p: pathlib.Path) -> str:
    return str(p.relative_to(ROOT))


# ---------- 1. kontekst ----------
def context():
    claude_md = ROOT / ".claude" / "CLAUDE.md"
    skills = sorted((ROOT / ".claude" / "skills").glob("*/SKILL.md"))
    descs = []
    for s in skills:
        front = s.read_text().split("---")[1]
        descs.append({"name": s.parent.name, "tokens": tokens(front)})
    web_ui = ROOT / ".claude" / "skills" / "web-ui"
    refs = sorted((web_ui / "references").glob("*.md"))
    design = ROOT / ".claude" / "DESIGN.md"
    steps = [
        {"id": "system", "label": "Prompt systemowy narzędzia i definicje narzędzi", "when": "start", "file": None, "tokens": None},
        {"id": "claude-md", "label": ".claude/CLAUDE.md", "when": "start", "file": rel(claude_md), "tokens": tokens(claude_md.read_text())},
        {"id": "skill-desc", "label": f"opisy skilli ({', '.join(d['name'] for d in descs)})", "when": "start", "file": ".claude/skills/*/SKILL.md (frontmatter)", "tokens": sum(d["tokens"] for d in descs)},
        {"id": "task", "label": "Zadanie: „dodaj slajd z wizualizacją pętli agenta”", "when": "zadanie", "file": None, "tokens": 30},
        {"id": "skill", "label": "skill web-ui: pełny SKILL.md", "when": "na żądanie", "file": rel(web_ui / "SKILL.md"), "tokens": tokens((web_ui / "SKILL.md").read_text())},
        {"id": "design", "label": "DESIGN.md (link w skillu)", "when": "na żądanie", "file": rel(design), "tokens": tokens(design.read_text())},
        {"id": "refs", "label": "references/viz-recipe.md, motion.md", "when": "na żądanie", "file": "references/*.md", "tokens": sum(tokens(r.read_text()) for r in refs if r.stem in ("viz-recipe", "motion"))},
        {"id": "code", "label": "czytany kod: page.tsx + przykładowa wizualizacja", "when": "praca", "file": "web/src/...", "tokens": tokens((WEB / "src/app/zajecia/01-llm-embeddingi/page.tsx").read_text()) + tokens((WEB / "src/components/viz/VectorSearchViz.tsx").read_text())},
    ]
    not_loaded = [{"file": rel(r), "tokens": tokens(r.read_text())} for r in refs if r.stem not in ("viz-recipe", "motion")]
    not_loaded += [{"file": rel(s), "tokens": tokens(s.read_text())} for s in skills if s.parent.name != "web-ui"]
    data = {"tokenizer": "o200k_base", "steps": steps, "notLoaded": not_loaded}
    (OUT / "lesson06-context.json").write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    print("✓ lesson06-context.json", sum(s["tokens"] or 0 for s in steps), "tokenów w plikach")


# ---------- 2. luki ----------
VULNS = [
    ("sekret-w-kodzie", "Sekret w kodzie", "sekrety", 'SECRET_KEY = "', "Klucz JWT i hasło admina w repo: każdy z dostępem do kodu podpisze token administratora.", "os.environ['SECRET_KEY'], długi losowy klucz; hasło admina poza kodem"),
    ("konfiguracja", "debug i CORS *", "konfiguracja", "allow_origins=[\"*\"]", "debug=True i CORS dla każdej domeny razem z allow_credentials.", "debug=False, lista dozwolonych originów"),
    ("blad-500-zamiast-401", "Token bez weryfikacji wygaśnięcia, 500 zamiast 401", "dostęp", 'options={"verify_exp": False}', "Token nie wygasa; zły token wywraca endpoint (500).", "Depends(current_user), exp ≤ 1 h, wyjątek -> 401"),
    ("wyciek-hasel", "MD5 bez soli", "dane", "hashlib.md5(c.password", "Hasła haszowane MD5 bez soli: tablice tęczowe łamią je natychmiast.", "hashlib.scrypt / bcrypt z solą"),
    ("sql-injection", "SQL injection w logowaniu", "baza", "f\"SELECT * FROM users WHERE username", "Login sklejany f-stringiem: „admin' --” loguje jako admin.", "zapytanie parametryzowane (?)"),
    ("wyciek-odpowiedzi", "Odpowiedzi w GET /tasks", "dane", 'conn.execute("SELECT * FROM tasks")', "SELECT * zwraca kolumnę answer bez logowania.", "jawna lista pól w odpowiedzi"),
    ("zaufanie-do-klienta", "Zaufanie do klienta", "logika", "    correct: bool", "Klient sam przysyła correct i points.", "serwer porównuje odpowiedź z tasks.answer i sam liczy punkty"),
    ("brak-walidacji", "Brak walidacji", "wejście", "    answer: str", "Brak limitów: 1 MB odpowiedzi, ujemne punkty, nieistniejące task_id.", "Field(max_length=…), sprawdzenie task_id w bazie"),
    ("race-condition", "Race condition", "logika", "already = conn.execute(", "Sprawdzenie „czy już rozwiązane” i zapis to dwa kroki; równoległe żądania przechodzą oba.", "UNIQUE(user_id, task_id) + atomowe points = points + ?"),
    ("idor", "IDOR: cudze zgłoszenia", "dostęp", 'row = conn.execute("SELECT * FROM submissions WHERE id = ?"', "Każdy zalogowany czyta dowolne zgłoszenie po numerze.", "AND user_id = ? z tokenu, cudze = 404"),
    ("wyciek-hasel-ranking", "Ranking z haszami haseł", "dane", 'SELECT * FROM users ORDER BY points', "Publiczny ranking zwraca kolumnę password i is_admin.", "jawna lista pól: username, points"),
    ("brak-testow", "Brak testów", "proces", None, "Żadnego test_*.py: nic nie pilnuje, że poprawka nie psuje reszty.", "pytest + TestClient, test na każdą regułę"),
]


def vulns():
    src = (EX / "app" / "app.py").read_text().splitlines()
    p = subprocess.run([sys.executable, "atak.py"], cwd=EX / "app", capture_output=True, text=True, timeout=120)
    attack = p.stdout.strip()
    results = {vid: status for status, vid in re.findall(r"\[(LUKA|ok  )\] ([\w-]+):", attack)}
    items = []
    for vid, name, cat, anchor, what, fix in VULNS:
        line = next((i + 1 for i, l in enumerate(src) if anchor and anchor in l), None)
        if anchor and line is None:
            raise SystemExit(f"brak kotwicy {anchor!r} w app.py")
        out = next((l for l in attack.splitlines() if f"] {vid.replace('-ranking', '')}:" in l), None)
        items.append({"id": vid, "name": name, "category": cat, "line": line, "what": what, "fix": fix, "attack": out, "exploited": results.get(vid.replace("-ranking", "")) == "LUKA"})
    data = {"file": "06-agentic-coding/cwiczenia/app/app.py", "lines": src, "items": items, "attackOutput": attack}
    (OUT / "lesson06-vulns.json").write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n")
    shutil.rmtree(EX / "app" / "__pycache__", ignore_errors=True)
    print("✓ lesson06-vulns.json", sum(i["exploited"] for i in items), "luk potwierdzonych atakiem")


# ---------- 3. przebiegi agenta ----------
TASK = "Dodaj endpoint GET /me/submissions, który zwraca zgłoszenia zalogowanego użytkownika, oraz POST /change-password. Uruchom testy."


if __name__ == "__main__":
    from dotenv import load_dotenv

    load_dotenv(ROOT / ".env")
    context()
    vulns()
