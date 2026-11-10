"""Eksperymenty do slajdów zajęć 6 -> web/src/data/lesson06-ladder-<harness>.json, lesson06-loop-<harness>.json.

Uruchomienie (z katalogu web/, OPENAI_API_KEY w ../.env, zalogowany Claude Code dla --harness claude):
    python scripts/lesson06_experiments.py ladder --harness langchain
    python scripts/lesson06_experiments.py ladder --harness claude
    python scripts/lesson06_experiments.py loop --harness langchain

ladder: to samo polecenie (06-agentic-coding/cwiczenia/drabina/zadanie.txt: aplikacja „Zadania” od zera),
        po jednym przebiegu na poziom konfiguracji; każdy poziom dokłada jedną rzecz do poprzedniego:
        0 nic, 1 prompt systemowy, 2 AGENTS.md (+ CLAUDE.md z @AGENTS.md), 3 skill secure-api, 4 skill api-tests.
        Po przebiegu: atak.py (z app/, agent go nie widzi) i pytest w katalogu przebiegu.
loop:   większy projekt (06-agentic-coding/cwiczenia/biblioteka/), bez i z konfiguracją;
        liczba wywołań narzędzi, tokeny, ukryte testy akceptacyjne.
Harness „langchain” = 06-agentic-coding/cwiczenia/harness.py (gpt-5.4-mini), „claude” = Claude Agent SDK
(domyślny harness Claude Code, subskrypcja zalogowanego CLI, bez klucza API).
"""

import argparse
import asyncio
import json
import os
import pathlib
import re
import shutil
import subprocess
import sys
import time

WEB = pathlib.Path(__file__).resolve().parents[1]
ROOT = WEB.parent
EX = ROOT / "06-agentic-coding" / "cwiczenia"
OUT = WEB / "src" / "data"
TMP = pathlib.Path(os.environ.get("LESSON06_TMP", "/tmp/lesson06-exp"))
SITE = re.compile(r"/\S*/site-packages/")

sys.path.insert(0, str(EX))
from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / ".env")

LEVELS = [
    {"id": 0, "label": "bez konfiguracji", "add": "goły harness: jedno zdanie promptu systemowego"},
    {"id": 1, "label": "+ prompt systemowy", "add": "„doświadczony inżynier, kod produkcyjny, bezpieczny, uruchom testy”"},
    {"id": 2, "label": "+ AGENTS.md", "add": "jak testować, kiedy skończone, sekrety z env, 4xx zamiast 500"},
    {"id": 3, "label": "+ skill secure-api", "add": "reguły bezpieczeństwa endpointów z powodami"},
    {"id": 4, "label": "+ skill api-tests", "add": "jakie testy pisać: 401, cudzy zasób, race condition"},
]
CLAUDE_TOOLS = ["Read", "Write", "Edit", "Glob", "Grep", "Bash(python *)", "Bash(python3 *)", "Bash(pytest *)", "Bash(ls *)", "Skill"]


def short_args(name: str, args: dict) -> str:
    for k in ("path", "file_path", "command", "name", "skill", "pattern"):
        if k in args:
            v = str(args[k]).replace(str(TMP), "").lstrip("/")
            return re.sub(r"^[^/]+/", "", v) if k in ("path", "file_path") and "/" in v and v.startswith(("ladder", "loop")) else v[:80]
    return ""


# ---------- harnessy ----------
def run_langchain(workdir: pathlib.Path, task: str, system: str | None) -> dict:
    import harness

    harness.ROOT = workdir
    log_path = workdir.parent / (workdir.name + ".jsonl")
    sys_prompt = system or "Jesteś agentem kodującym. Pracujesz w repozytorium przez narzędzia."
    with open(log_path, "w") as log:
        final = harness.agent(task, "openai:gpt-5.4-mini", sys_prompt, log)
    events = [json.loads(line) for line in log_path.read_text().splitlines()]
    steps, ctx = [], []
    for e in events:
        if e["type"] == "usage":
            ctx.append(e["prompt_tokens"] or 0)
        if e["type"] == "tool":
            steps.append({"tool": e["name"], "arg": short_args(e["name"], e["args"]), "context": ctx[-1] if ctx else 0, "result": SITE.sub("…/", str(e["result"]))[:300]})
    usage = [e for e in events if e["type"] == "usage"]
    return {
        "harness": "harness.py (LangChain)",
        "model": "gpt-5.4-mini",
        "steps": steps,
        "calls": len(usage),
        "inputTokens": sum(u["prompt_tokens"] or 0 for u in usage),
        "outputTokens": sum(u["completion_tokens"] or 0 for u in usage),
        "final": final[:600] if final else "",
    }


async def _claude(workdir: pathlib.Path, task: str, append: str | None, with_skills: bool) -> dict:
    from claude_agent_sdk import AssistantMessage, ClaudeAgentOptions, ResultMessage, SystemMessage, ToolUseBlock, query

    sp = {"type": "preset", "preset": "claude_code"}
    if append:
        sp["append"] = append
    opts = ClaudeAgentOptions(
        cwd=str(workdir),
        model="sonnet",
        system_prompt=sp,
        setting_sources=["project"],
        skills="all" if with_skills else [],
        allowed_tools=CLAUDE_TOOLS,
        permission_mode="dontAsk",
        max_turns=60,
    )
    steps, model, result, ctx = [], None, None, 0
    async for m in query(prompt=task, options=opts):
        if isinstance(m, SystemMessage) and m.subtype == "init":
            model = m.data.get("model")
        if isinstance(m, AssistantMessage):
            u = getattr(m, "usage", None) or {}
            if u:
                ctx = (u.get("input_tokens") or 0) + (u.get("cache_read_input_tokens") or 0) + (u.get("cache_creation_input_tokens") or 0)
            for b in m.content:
                if isinstance(b, ToolUseBlock):
                    steps.append({"tool": b.name, "arg": short_args(b.name, b.input), "context": ctx})
        if isinstance(m, ResultMessage):
            result = m
    u = result.usage or {}
    return {
        "harness": "Claude Code (Agent SDK)",
        "model": model,
        "steps": steps,
        "calls": result.num_turns,
        "inputTokens": (u.get("input_tokens") or 0) + (u.get("cache_read_input_tokens") or 0) + (u.get("cache_creation_input_tokens") or 0),
        "outputTokens": u.get("output_tokens") or 0,
        "costUsd": result.total_cost_usd,
        "final": (result.result or "")[:600],
    }


def run_claude(workdir, task, append, with_skills):
    return asyncio.run(_claude(workdir, task, append, with_skills))


# ---------- ocena ----------
def eval_python(wd: pathlib.Path) -> str:
    """Osobne środowisko z zależnościami z requirements.txt aplikacji (agent mógł wybrać inne biblioteki niż nasze)."""
    venv = TMP / "venvs" / wd.name
    shutil.rmtree(venv, ignore_errors=True)
    subprocess.run(["uv", "venv", "-q", "--python", sys.executable, str(venv)], check=True)
    py = str(venv / "bin" / "python")
    base = ["fastapi", "httpx", "pyjwt", "pytest", "uvicorn"]
    req = wd / "requirements.txt"
    extra = ["-r", str(req)] if req.exists() else []
    if not req.exists():  # agent nie zapisał zależności: zgadujemy z importów
        known = {"jose": "python-jose[cryptography]", "passlib": "passlib[bcrypt]", "bcrypt": "bcrypt", "sqlalchemy": "sqlalchemy", "argon2": "argon2-cffi", "dotenv": "python-dotenv", "multipart": "python-multipart"}
        src = "\n".join(f.read_text() for f in wd.glob("*.py"))
        extra = [pkg for mod, pkg in known.items() if re.search(rf"^\s*(from|import) {mod}\b", src, re.M)]
    r = subprocess.run(["uv", "pip", "install", "-q", "--python", py, *base, *extra], capture_output=True, text=True)
    if r.returncode != 0:  # przypięte wersje mogą się nie zainstalować: wtedy bez przypięć
        names = [re.split(r"[<>=\[ ;]", line.strip())[0] for line in req.read_text().splitlines() if line.strip() and not line.startswith("#")]
        subprocess.run(["uv", "pip", "install", "-q", "--python", py, *base, *names], check=True)
    if any("passlib" in f.read_text() for f in wd.glob("*.py")):  # passlib nie działa z bcrypt >= 4.1
        subprocess.run(["uv", "pip", "install", "-q", "--python", py, "bcrypt<4.1"], check=True)
    return py


def pytest_summary(cwd: pathlib.Path, args=("-q",), py: str = sys.executable) -> dict:
    p = subprocess.run([py, "-m", "pytest", *args, "-p", "no:cacheprovider"], cwd=cwd, capture_output=True, text=True, timeout=300)
    tail = (p.stdout + p.stderr).strip().splitlines()[-1:] or [""]
    passed = int(m.group(1)) if (m := re.search(r"(\d+) passed", tail[0])) else 0
    failed = int(m.group(1)) if (m := re.search(r"(\d+) (?:failed|error)", tail[0])) else 0
    return {"exit": p.returncode, "passed": passed, "failed": failed, "summary": SITE.sub("…/", tail[0])}


def attack(workdir: pathlib.Path, py: str = sys.executable) -> list[dict]:
    for db in workdir.glob("*.db"):
        db.unlink()
    p = subprocess.run([py, str(EX / "app" / "atak.py"), str(workdir)], capture_output=True, text=True, timeout=300, env={**os.environ, "SECRET_KEY": "atak-" + "k" * 40, "JWT_SECRET": "atak-" + "k" * 40})
    rows = []
    for line in p.stdout.splitlines():
        if m := re.match(r"\[(LUKA|ok  )\] ([\w-]+): (.*)", line):
            rows.append({"id": m.group(2), "luka": m.group(1) == "LUKA", "detail": m.group(3)[:200]})
    if not rows:
        rows.append({"id": "atak-nie-ruszyl", "luka": True, "detail": SITE.sub("…/", (p.stdout + p.stderr)[-300:])})
    return rows


# ---------- eksperymenty ----------
def evaluate(run: dict, wd: pathlib.Path):
    py = eval_python(wd)
    app = wd / "app.py"
    run["app"] = app.read_text() if app.exists() else ""
    run["files"] = sorted(str(f.relative_to(wd)) for f in wd.rglob("*") if f.is_file() and not {".git", "__pycache__", ".pytest_cache", ".claude", ".venv"} & set(f.relative_to(wd).parts) and not f.name.endswith(".db"))
    run["tests"] = pytest_summary(wd, py=py)
    run["attack"] = attack(wd, py)
    run["luki"] = sum(r["luka"] for r in run["attack"])


def reeval(harness: str):
    out_path = OUT / f"lesson06-ladder-{harness}.json"
    data = json.loads(out_path.read_text())
    for lvl, run in data["runs"][harness].items():
        evaluate(run, TMP / "ladder" / f"{harness}-{lvl}")
        print(f"{harness} {lvl}: luki={run['luki']} {[a['id'] for a in run['attack'] if a['luka']]} testy={run['tests']['summary']}", flush=True)
    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=1))


def ladder(harness: str, levels: list[int]):
    task = (EX / "drabina" / "zadanie.txt").read_text().strip()
    system = (EX / "drabina" / "1-prompt" / "system.md").read_text()
    out_path = OUT / f"lesson06-ladder-{harness}.json"
    data = json.loads(out_path.read_text()) if out_path.exists() else {"task": task, "levels": LEVELS, "runs": {}}
    data["task"], data["levels"] = task, LEVELS
    for lvl in levels:
        wd = TMP / "ladder" / f"{harness}-{lvl}"
        shutil.rmtree(wd, ignore_errors=True)
        wd.mkdir(parents=True)
        for src in ["2-agents-md", "3-secure-api", "4-api-tests"][: max(0, lvl - 1)]:
            shutil.copytree(EX / "drabina" / src, wd, dirs_exist_ok=True)
        subprocess.run(["git", "init", "-q"], cwd=wd)
        print(f"== {harness} poziom {lvl}", flush=True)
        t0 = time.time()
        if harness == "langchain":
            run = run_langchain(wd, task, system if lvl >= 1 else None)
        else:
            run = run_claude(wd, task, system if lvl >= 1 else None, with_skills=lvl >= 3)
        run["seconds"] = round(time.time() - t0)
        evaluate(run, wd)
        print(f"   luki={run['luki']} testy={run['tests']['summary']} kroki={len(run['steps'])} tokeny={run['inputTokens']}", flush=True)
        data["runs"].setdefault(harness, {})[str(lvl)] = run
        out_path.write_text(json.dumps(data, ensure_ascii=False, indent=1))


def loop(harness: str, variants: list[str]):
    base = EX / "biblioteka"
    task = (base / "zadanie.txt").read_text().strip()
    out_path = OUT / f"lesson06-loop-{harness}.json"
    data = json.loads(out_path.read_text()) if out_path.exists() else {"task": task, "runs": {}}
    data["task"] = task
    for variant in variants:
        wd = TMP / "loop" / f"{harness}-{variant}"
        shutil.rmtree(wd, ignore_errors=True)
        shutil.copytree(base / "projekt", wd, ignore=shutil.ignore_patterns("__pycache__", "*.db", ".pytest_cache"))
        if variant == "z":
            shutil.copytree(base / "konfiguracja", wd, dirs_exist_ok=True)
        subprocess.run(["git", "init", "-q"], cwd=wd)
        print(f"== loop {harness} {variant}", flush=True)
        t0 = time.time()
        run = run_langchain(wd, task, None) if harness == "langchain" else run_claude(wd, task, None, with_skills=variant == "z")
        run["seconds"] = round(time.time() - t0)
        acc = wd / "tests" / "test_extend_akceptacja.py"
        shutil.copy(base / "akceptacja" / "test_extend.py", acc)
        run["acceptance"] = pytest_summary(wd, ("tests/test_extend_akceptacja.py", "-q"))
        acc.unlink()
        run["tests"] = pytest_summary(wd, ("tests", "-q"))
        print(f"   kroki={len(run['steps'])} tokeny={run['inputTokens']} akceptacja={run['acceptance']['summary']}", flush=True)
        data["runs"].setdefault(harness, {})[variant] = run
        out_path.write_text(json.dumps(data, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("what", choices=["ladder", "loop", "reeval"])
    ap.add_argument("--harness", choices=["langchain", "claude"], default="langchain")
    ap.add_argument("--levels", default="0,1,2,3,4")
    ap.add_argument("--variants", default="bez,z")
    a = ap.parse_args()
    if a.what == "reeval":
        reeval(a.harness)
    elif a.what == "ladder":
        ladder(a.harness, [int(x) for x in a.levels.split(",")])
    else:
        loop(a.harness, a.variants.split(","))
