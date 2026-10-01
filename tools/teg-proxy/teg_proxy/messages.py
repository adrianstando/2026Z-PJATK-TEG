"""Tłumaczenie formatu OpenAI (bezstanowa lista wiadomości) na format agenta (sesja + kolejne prompty)."""

from __future__ import annotations

import hashlib
import json
from typing import Any

from .providers.base import ProviderError

DEFAULT_SYSTEM = "You are a helpful assistant."
Turn = tuple[str, str]  # (rola, tekst)


def text_of(content: Any) -> str:
    """content bywa stringiem albo listą części [{type: "text", text: ...}]."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(p.get("text", "") for p in content if isinstance(p, dict) and p.get("type") == "text")
    return ""


def normalize(messages: list[dict]) -> tuple[str, list[Turn]]:
    """-> (system prompt, tury user/assistant). Ostatnia tura musi być od użytkownika."""
    system = "\n\n".join(text_of(m["content"]) for m in messages if m.get("role") in ("system", "developer"))
    turns = [(m["role"], text_of(m["content"])) for m in messages if m.get("role") in ("user", "assistant")]
    if not turns or turns[-1][0] != "user":
        raise ProviderError(400, "Ostatnia wiadomość musi mieć rolę 'user'.")
    return system or DEFAULT_SYSTEM, turns


def fingerprint(model: str, system: str, turns: list[Turn]) -> str:
    """Odcisk rozmowy. Ta sama historia -> ten sam odcisk -> ta sama żywa sesja."""
    raw = json.dumps([model, system, turns], ensure_ascii=False)
    return hashlib.sha256(raw.encode()).hexdigest()


def transcript(turns: list[Turn]) -> str:
    """Pierwsza wiadomość NOWEJ sesji: dotychczasowa rozmowa wklejona jako kontekst + ostatnie pytanie."""
    if len(turns) == 1:
        return turns[0][1]
    history = "\n\n".join(f"{role.upper()}: {text}" for role, text in turns[:-1])
    return (
        "Below is our conversation so far. Continue it by answering the last user message.\n\n"
        f"<history>\n{history}\n</history>\n\n{turns[-1][1]}"
    )
