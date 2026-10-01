"""OpenAI Codex SDK (`pip install openai-codex`).

Logowanie: `codex login` (subskrypcja ChatGPT) — SDK używa istniejącej autoryzacji.
Jeden AsyncCodex (proces app-server) na cały serwer; sesja to wątek (thread).
Wątek startuje w pustym katalogu tymczasowym, sandbox read-only, approval deny_all,
więc agent nie ma czego czytać ani czego uruchamiać.
"""

from __future__ import annotations

import asyncio
import shutil
import tempfile

from openai_codex import ApprovalMode, AsyncCodex, Sandbox

from .base import AgentSession, Provider, ProviderError, Usage


class CodexSession(AgentSession):
    def __init__(self, provider: "CodexProvider", model: str, system: str):
        self.provider, self.model, self.system = provider, model, system
        self.thread = None
        self.workdir = tempfile.mkdtemp(prefix="teg-codex-")

    async def ask(self, prompt):
        if self.thread is None:
            codex = await self.provider.client()
            self.thread = await codex.thread_start(
                model=self.model,
                base_instructions=self.system,
                cwd=self.workdir,
                sandbox=Sandbox.read_only,
                approval_mode=ApprovalMode.deny_all,
                ephemeral=True,  # nie zapisuj wątku w historii Codexa
            )
        try:
            result = await self.thread.run(prompt)
        except RuntimeError as e:
            if "401" in str(e):
                raise ProviderError(401, "Codex niezalogowany. Uruchom `codex login` (konto ChatGPT).") from e
            raise
        last = result.usage.last if result.usage else None
        return result.final_response or "", Usage(last.input_tokens, last.output_tokens) if last else Usage()

    async def close(self):
        self.thread = None
        shutil.rmtree(self.workdir, ignore_errors=True)


class CodexProvider(Provider):
    name = "codex"
    default_model = "gpt-5.5"

    def __init__(self):
        self._client: AsyncCodex | None = None
        self._lock = asyncio.Lock()

    async def client(self) -> AsyncCodex:
        async with self._lock:
            if self._client is None:
                self._client = AsyncCodex()  # inicjalizuje się leniwie
        return self._client

    async def list_models(self):
        return [m.id for m in (await (await self.client()).models()).data]

    def open_session(self, model, system):
        return CodexSession(self, model, system)

    async def shutdown(self):
        if self._client is not None:
            await self._client.close()
