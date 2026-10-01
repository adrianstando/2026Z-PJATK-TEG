"""Claude Agent SDK — Claude Code jako biblioteka. Działa na subskrypcji Claude (Pro/Max)
albo z ANTHROPIC_API_KEY.

Wymaga zainstalowanego i zalogowanego Claude Code:
    npm install -g @anthropic-ai/claude-code
    claude            # potem /login
    pip install claude-agent-sdk

To jest AGENT, nie samo API: ma narzędzia (czytanie plików, bash, wyszukiwanie w sieci).
Tutaj dajemy mu tylko odczyt plików w bieżącym katalogu.
"""
import asyncio

from claude_agent_sdk import AssistantMessage, ClaudeAgentOptions, ResultMessage, TextBlock, query


async def main():
    options = ClaudeAgentOptions(
        model="claude-haiku-4-5",
        allowed_tools=["Read", "Glob"],  # agent może tylko czytać
        max_turns=5,
    )
    async for msg in query(prompt="Jakie pliki .py są w tym katalogu i co robi każdy z nich? Krótko.", options=options):
        if isinstance(msg, AssistantMessage):
            for block in msg.content:
                if isinstance(block, TextBlock):
                    print(block.text)
        elif isinstance(msg, ResultMessage):
            print(f"\n[tury: {msg.num_turns}, czas: {msg.duration_ms} ms]")


asyncio.run(main())
