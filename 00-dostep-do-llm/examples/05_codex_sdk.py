"""OpenAI Codex SDK — działa na subskrypcji ChatGPT (Plus/Pro) albo z kluczem API.

    npm install -g @openai/codex
    codex login
    pip install openai-codex
"""
from openai_codex import Codex, Sandbox

with Codex() as codex:
    thread = codex.thread_start(sandbox=Sandbox.read_only)  # agent tylko czyta pliki
    result = thread.run("Jakie pliki .py są w tym katalogu? Jedno zdanie o każdym.")
    print(result.final_response)
    print(result.usage)
