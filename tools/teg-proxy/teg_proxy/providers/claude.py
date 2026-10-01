"""Claude Agent SDK (`pip install claude-agent-sdk`).

Używa zalogowanego Claude Code (`claude` → /login), czyli subskrypcji Pro/Max.
Jedna sesja = jeden ClaudeSDKClient = jeden proces Claude Code w tle.
"""

from __future__ import annotations

from claude_agent_sdk import AssistantMessage, ClaudeAgentOptions, ClaudeSDKClient, ResultMessage, TextBlock
from claude_agent_sdk import CLINotFoundError

from .base import AgentSession, Provider, ProviderError, Usage


class ClaudeSession(AgentSession):
    def __init__(self, model: str, system: str):
        self.client = ClaudeSDKClient(ClaudeAgentOptions(
            model=model,
            system_prompt=system,
            tools=[],            # zero wbudowanych narzędzi: czysty czat
            setting_sources=[],  # nie wczytuj CLAUDE.md, skilli ani ustawień z dysku
            # Bez tego Claude Code dołącza konektory MCP z konta claude.ai (Canva,
            # Notion, ...) jako narzędzia: ~108 tys. tokenów kontekstu na każde "Hi"
            # zamiast ~400. Zmierzone, nie zgadnięte.
            strict_mcp_config=True,
            mcp_servers={},
        ))
        self.connected = False

    async def ask(self, prompt):
        if not self.connected:
            try:
                await self.client.connect()
            except CLINotFoundError as e:
                raise ProviderError(501, "Nie znaleziono Claude Code. Zainstaluj: npm i -g @anthropic-ai/claude-code, potem `claude` i /login") from e
            self.connected = True
        await self.client.query(prompt)
        parts: list[str] = []
        usage: dict = {}
        async for msg in self.client.receive_response():
            if isinstance(msg, AssistantMessage):
                parts += [b.text for b in msg.content if isinstance(b, TextBlock)]
            elif isinstance(msg, ResultMessage):
                if msg.is_error:
                    raise ProviderError(502, f"Claude: {msg.result or msg.errors}")
                usage = msg.usage or {}
        prompt_tokens = sum(usage.get(k, 0) for k in ("input_tokens", "cache_read_input_tokens", "cache_creation_input_tokens"))
        return "".join(parts), Usage(prompt_tokens, usage.get("output_tokens", 0))

    async def close(self):
        if self.connected:
            await self.client.disconnect()


class ClaudeProvider(Provider):
    name = "claude"
    default_model = "claude-haiku-4-5"  # najtańszy i najszybszy — w sam raz na zajęcia

    async def list_models(self):
        return ["claude-haiku-4-5", "claude-sonnet-5-5", "claude-opus-5-5"]

    def open_session(self, model, system):
        return ClaudeSession(model, system)
