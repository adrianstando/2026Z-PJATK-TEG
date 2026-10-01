"""Pula żywych sesji agentów z wygasaniem po bezczynności.

API OpenAI jest bezstanowe — klient za każdym razem wysyła całą historię.
Agent ma stan, a jego uruchomienie trwa kilka sekund. Pula łączy jedno z drugim:

  * po odpowiedzi sesja zostaje otwarta w tle pod odciskiem całej rozmowy
    (model + system + wiadomości + właśnie udzielona odpowiedź),
  * zapytanie, którego historia (bez ostatniej wiadomości) pasuje do odcisku,
    trafia do tej sesji i agent dostaje TYLKO nową wiadomość,
  * w przeciwnym razie (nowa rozmowa, edytowana historia) — nowa sesja
    i cała historia jako transkrypt,
  * sesja bezczynna dłużej niż `idle_seconds` jest zamykana; następne zapytanie
    z tą historią po prostu odtworzy ją od zera.
"""

from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass, field

from .messages import Turn, fingerprint, transcript
from .providers.base import AgentSession, Provider, ProviderError, Usage


@dataclass
class LiveSession:
    session: AgentSession
    label: str  # "provider/model" — do logów i /v1/sessions
    last_used: float = field(default_factory=time.monotonic)
    busy: bool = False


class SessionPool:
    def __init__(self, idle_seconds: float, max_sessions: int):
        self.idle_seconds = idle_seconds
        self.max_sessions = max_sessions
        self.live: dict[str, LiveSession] = {}

    async def chat(self, provider: Provider, model: str, system: str, turns: list[Turn]) -> tuple[str, Usage, bool]:
        """-> (odpowiedź, zużycie, czy trafiliśmy w ciepłą sesję)."""
        label = f"{provider.name}/{model}"
        # Zdejmujemy sesję z puli na czas zapytania: dwa równoległe zapytania
        # z tą samą historią nie mogą pisać do jednej rozmowy.
        live = self.live.pop(fingerprint(label, system, turns[:-1]), None)
        warm = live is not None
        if live is None:
            await self._make_room()
            live = LiveSession(provider.open_session(model, system), label)
            prompt = transcript(turns)
        else:
            prompt = turns[-1][1]

        live.busy = True
        try:
            text, usage = await live.session.ask(prompt)
        except ProviderError:
            await self._close(live)  # sesja w nieznanym stanie — nie wraca do puli
            raise
        except Exception as e:
            await self._close(live)
            # Nieprzewidziany błąd SDK -> 502 z treścią, zamiast gołego 500.
            raise ProviderError(502, f"{label}: {type(e).__name__}: {e}") from e
        except BaseException:  # anulowanie zapytania (klient się rozłączył)
            await self._close(live)
            raise
        live.busy, live.last_used = False, time.monotonic()
        self.live[fingerprint(label, system, turns + [("assistant", text)])] = live
        return text, usage, warm

    async def _make_room(self) -> None:
        while len(self.live) >= self.max_sessions:
            oldest = min(self.live, key=lambda k: self.live[k].last_used)
            await self._close(self.live.pop(oldest))

    @staticmethod
    async def _close(live: LiveSession) -> None:
        try:
            await live.session.close()
        except Exception as e:  # zamykanie nie może wywrócić serwera
            print(f"[teg-proxy] błąd przy zamykaniu {live.label}: {e}", flush=True)

    async def reaper(self) -> None:
        """Regularnie (co minutę albo częściej przy krótkim TTL) zamyka sesje bezczynne dłużej niż idle_seconds."""
        while True:
            await asyncio.sleep(min(60.0, self.idle_seconds / 2))
            now = time.monotonic()
            for key in [k for k, v in self.live.items() if not v.busy and now - v.last_used > self.idle_seconds]:
                live = self.live.pop(key)
                print(f"[teg-proxy] zamykam bezczynną sesję {live.label} ({(now - live.last_used) / 60:.0f} min)", flush=True)
                await self._close(live)

    def snapshot(self) -> list[dict]:
        now = time.monotonic()
        return [{"model": v.label, "idle_s": round(now - v.last_used), "key": k[:12]} for k, v in self.live.items()]

    async def close_all(self) -> None:
        for live in list(self.live.values()):
            await self._close(live)
        self.live.clear()
