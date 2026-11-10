"""Minimalny harness wokół modelu w LangChain: pętla + 3 narzędzia (read_file, write_file, run_tests).

Model tylko proponuje wywołania narzędzi. Wszystko inne (wykonanie narzędzi, granice katalogu,
historia rozmowy, warunek końca) robi ten kod. Pełniejsza wersja ze skillami: harness.py.

    python harness_minimal.py app "Dopisz test logowania i uruchom testy."
"""

import pathlib
import subprocess
import sys

from dotenv import load_dotenv
from langchain.chat_models import init_chat_model
from langchain.messages import HumanMessage, SystemMessage, ToolMessage
from langchain.tools import tool

load_dotenv()
ROOT = pathlib.Path(sys.argv[1]).resolve()


def safe(path: str) -> pathlib.Path:
    p = (ROOT / path).resolve()
    if ROOT not in [p, *p.parents]:  # uprawnienia: to harness, nie model, pilnuje granic
        raise ValueError("ścieżka poza projektem")
    return p


@tool
def read_file(path: str) -> str:
    """Zwraca treść pliku."""
    return safe(path).read_text()


@tool
def write_file(path: str, content: str) -> str:
    """Zapisuje cały plik."""
    safe(path).write_text(content)
    return "zapisano"


@tool
def run_tests() -> str:
    """Uruchamia pytest -q, zwraca wynik."""
    p = subprocess.run([sys.executable, "-m", "pytest", "-q"], cwd=ROOT, capture_output=True, text=True, timeout=120)
    return (p.stdout + p.stderr)[-2000:]


TOOLS = {t.name: t for t in [read_file, write_file, run_tests]}
model = init_chat_model("openai:gpt-5.4-mini").bind_tools(list(TOOLS.values()))  # inny model = inny napis

messages = [
    SystemMessage("Agent kodujący. Pliki: " + ", ".join(p.name for p in ROOT.glob("*.py")) + ". Skończ, gdy testy przechodzą."),
    HumanMessage(sys.argv[2]),
]
for _ in range(20):  # pętla: model -> narzędzie -> obserwacja -> model
    msg = model.invoke(messages)
    messages.append(msg)
    if not msg.tool_calls:
        print(msg.content)
        break
    for call in msg.tool_calls:
        try:
            result = TOOLS[call["name"]].invoke(call["args"])
        except Exception as e:  # błąd narzędzia wraca do modelu jako obserwacja
            result = f"BŁĄD: {e}"
        print("→", call["name"], result.splitlines()[0][:80] if result else "")
        messages.append(ToolMessage(result, tool_call_id=call["id"]))
