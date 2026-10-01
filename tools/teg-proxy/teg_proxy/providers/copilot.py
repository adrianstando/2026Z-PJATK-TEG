"""GitHub Copilot SDK (`pip install github-copilot-sdk`, Python 3.11+).

Logowanie: `copilot login` (Copilot CLI) albo zmienna GITHUB_TOKEN z tokenem
konta, które ma Copilota (studenci: darmowy w GitHub Student Developer Pack).
Jeden proces Copilot CLI na cały serwer; sesje to lekkie obiekty w jego środku.
"""

from __future__ import annotations

import asyncio
import os

from copilot import CopilotClient
from copilot.session import PermissionHandler

from .base import AgentSession, Provider, ProviderError, Usage

AUTH_HINT = "Copilot niezalogowany. Uruchom `copilot login` albo ustaw GITHUB_TOKEN (konto z aktywnym Copilotem)."


class CopilotSession(AgentSession):
    def __init__(self, provider: "CopilotProvider", model: str, system: str):
        self.provider, self.model, self.system = provider, model, system
        self.session = None

    async def ask(self, prompt):
        try:
            if self.session is None:
                client = await self.provider.client()
                self.session = await client.create_session(
                    on_permission_request=PermissionHandler.approve_all,  # i tak nie ma narzędzi
                    model=self.model,
                    available_tools=[],  # zero wbudowanych narzędzi: czysty czat
                    skip_custom_instructions=True,
                    system_message={"mode": "replace", "content": self.system},
                )
            event = await self.session.send_and_wait(prompt, timeout=300)
        except Exception as e:
            if "token" in str(e).lower() or "auth" in str(e).lower():
                raise ProviderError(401, AUTH_HINT) from e
            raise
        text = getattr(getattr(event, "data", None), "content", "") or ""
        return text, Usage()  # Copilot nie raportuje zużycia tokenów

    async def close(self):
        if self.session is not None:
            await self.session.disconnect()


class CopilotProvider(Provider):
    name = "copilot"
    default_model = "gpt-5-mini"

    def __init__(self):
        self._client: CopilotClient | None = None
        self._lock = asyncio.Lock()

    async def client(self) -> CopilotClient:
        async with self._lock:
            if self._client is None:
                self._client = CopilotClient(github_token=os.getenv("GITHUB_TOKEN") or None)
                await self._client.start()
        return self._client

    async def list_models(self):
        return [m.id for m in await (await self.client()).list_models()]

    def open_session(self, model, system):
        return CopilotSession(self, model, system)

    async def shutdown(self):
        if self._client is not None:
            await self._client.stop()
