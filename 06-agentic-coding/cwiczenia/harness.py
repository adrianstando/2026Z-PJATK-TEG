"""Własny harness wokół modelu w LangChain: pętla + 5 narzędzi + ładowanie AGENTS.md i skilli. Ok. 120 linii.

Agent = model + harness. Ten plik to harness: to samo, co robią Claude Code, Codex czy Copilot, tylko w małej skali:
- na starcie czyta AGENTS.md z katalogu roboczego (jeśli jest),
- zna tylko nazwy i opisy skilli z .claude/skills/ i .agents/skills/ (ten sam format SKILL.md), a pełną treść ładuje na żądanie,
- czyta i zapisuje pliki, uruchamia testy, poprawia kod, aż uzna zadanie za skończone.

Uruchomienie (klucz OPENAI_API_KEY w .env albo w środowisku):
    python harness.py --workdir app "Dodaj endpoint GET /me/submissions. Uruchom testy."
    python harness.py --workdir app --log przebieg.jsonl --system prompt.md "..."
    python harness.py --model ollama:qwen3 --workdir app "..."      # inny dostawca: tylko inny napis

Uwaga: agent zapisuje pliki i uruchamia polecenia w --workdir. Pracować na kopii.
"""

import argparse
import json
import pathlib
import re
import subprocess
import sys

from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain.messages import HumanMessage, SystemMessage, ToolMessage
from langchain.tools import tool

load_dotenv()
ROOT = pathlib.Path(".").resolve()
SKIP = {"__pycache__", ".git", ".pytest_cache", "node_modules", ".venv"}


def skills() -> dict[str, tuple[str, pathlib.Path]]:
    """nazwa -> (opis z frontmattera, ścieżka). Do kontekstu trafia tylko opis."""
    out = {}
    for f in sorted([*ROOT.glob(".claude/skills/*/SKILL.md"), *ROOT.glob(".agents/skills/*/SKILL.md")]):
        front = f.read_text().split("---")[1]
        desc = re.search(r"description:\s*(.+(?:\n  .+)*)", front).group(1)
        out[f.parent.name] = (" ".join(desc.split()), f)
    return out


def safe(path: str) -> pathlib.Path:
    p = (ROOT / path).resolve()
    if ROOT not in [p, *p.parents]:  # uprawnienia pilnuje harness, nie model
        raise ValueError("ścieżka poza projektem")
    return p


@tool
def list_files() -> str:
    """Lista plików w projekcie."""
    files = (p for p in sorted(ROOT.rglob("*")) if p.is_file() and not SKIP & set(p.parts) and not p.name.endswith(".db"))
    return "\n".join(str(p.relative_to(ROOT)) for p in files)


@tool
def read_file(path: str) -> str:
    """Zwraca treść pliku."""
    return safe(path).read_text()


@tool
def write_file(path: str, content: str) -> str:
    """Zapisuje cały plik (nadpisuje)."""
    p = safe(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content)
    return f"zapisano {len(content.splitlines())} linii"


@tool
def run(command: str) -> str:
    """Uruchamia polecenie: tylko `python ...` albo `pytest ...`. Zwraca kod wyjścia i wyjście."""
    m = re.match(r"^(python3?|pytest)\b", command)
    if not m:
        return "BŁĄD: dozwolone tylko python i pytest"
    command = sys.executable + (" -m pytest" if m.group(1) == "pytest" else "") + command[m.end():]
    p = subprocess.run(command, shell=True, cwd=ROOT, capture_output=True, text=True, timeout=180)
    return f"exit {p.returncode}\n{(p.stdout + p.stderr)[-3000:]}"


@tool
def load_skill(name: str) -> str:
    """Ładuje pełną instrukcję skilla o podanej nazwie."""
    sk = skills().get(name)
    return sk[1].read_text() if sk else "BŁĄD: nie ma takiego skilla"


TOOLS = {t.name: t for t in [list_files, read_file, write_file, run, load_skill]}


def agent(task: str, model_name: str, system: str, log=None, max_steps: int = 40) -> str:
    def emit(**event):
        if log:
            log.write(json.dumps(event, ensure_ascii=False) + "\n")
            log.flush()

    agents_md = ROOT / "AGENTS.md"
    if agents_md.exists():
        system += "\n\n# AGENTS.md\n" + agents_md.read_text()
        emit(type="context", source="AGENTS.md", chars=len(agents_md.read_text()))
    if sk := skills():
        system += "\n\n# Dostępne skille (pełna treść: load_skill)\n" + "\n".join(f"- {n}: {d}" for n, (d, _) in sk.items())
        emit(type="context", source="skill-descriptions", names=list(sk))

    model = init_chat_model(model_name, timeout=180, max_retries=3).bind_tools(list(TOOLS.values()))
    messages = [SystemMessage(system), HumanMessage(task)]
    emit(type="task", text=task, model=model_name)
    for _ in range(max_steps):
        msg = model.invoke(messages)
        messages.append(msg)
        u = msg.usage_metadata or {}
        emit(type="usage", prompt_tokens=u.get("input_tokens"), completion_tokens=u.get("output_tokens"))
        if msg.text:
            emit(type="message", text=msg.text)
        if not msg.tool_calls:
            return msg.text
        for call in msg.tool_calls:
            try:
                result = TOOLS[call["name"]].invoke(call["args"])
            except Exception as e:  # błąd narzędzia wraca do modelu jako obserwacja
                result = f"BŁĄD: {e}"
            short = ", ".join(f"{k}={str(v)[:40]!r}" for k, v in call["args"].items())
            print(f"→ {call['name']}({short})  {result.splitlines()[0][:70] if result else ''}")
            emit(type="tool", name=call["name"], args=call["args"], result=result)
            messages.append(ToolMessage(result, tool_call_id=call["id"]))
    return "Przekroczono limit kroków."


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("task")
    ap.add_argument("--workdir", default=".")
    ap.add_argument("--model", default="openai:gpt-5.4-mini")
    ap.add_argument("--system", help="plik z promptem systemowym (domyślnie jedno zdanie)")
    ap.add_argument("--log")
    a = ap.parse_args()
    ROOT = pathlib.Path(a.workdir).resolve()
    system = pathlib.Path(a.system).read_text() if a.system else "Jesteś agentem kodującym. Pracujesz w repozytorium przez narzędzia."
    log = open(a.log, "w") if a.log else None
    print(agent(a.task, a.model, system, log))
