"""Kontrakt dostawcy. Nowy dostawca = nowy plik w providers/ + wpis w REGISTRY (providers/__init__.py)."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class Usage:
    prompt_tokens: int = 0
    completion_tokens: int = 0

    def as_openai(self) -> dict:
        return {
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_tokens": self.prompt_tokens + self.completion_tokens,
        }


class ProviderError(Exception):
    """Błąd, który ma dotrzeć do klienta jako czytelny komunikat HTTP (a nie 500 ze stack trace)."""

    def __init__(self, status: int, message: str):
        super().__init__(message)
        self.status = status
        self.message = message


class AgentSession(ABC):
    """Jedna rozmowa z agentem, trzymana w tle między zapytaniami HTTP.

    Kontrakt: pierwsze ask() otwiera sesję (leniwie), kolejne dopisują do tej samej
    rozmowy, close() zwalnia zasoby. Sesja NIE dostaje narzędzi — to czysty czat.
    """

    @abstractmethod
    async def ask(self, prompt: str) -> tuple[str, Usage]:
        """Wysyła wiadomość i czeka na pełną odpowiedź."""

    @abstractmethod
    async def close(self) -> None: ...


class Provider(ABC):
    """Dostawca = agent na subskrypcji użytkownika (Claude Code, Copilot, Codex...)."""

    #: nazwa w TEG_PROXY_PROVIDERS i prefiks modelu: "<name>/<model>"
    name: str
    #: model, gdy klient poda samo "<name>" albo nic
    default_model: str

    @abstractmethod
    async def list_models(self) -> list[str]:
        """Identyfikatory modeli BEZ prefiksu dostawcy."""

    @abstractmethod
    def open_session(self, model: str, system: str) -> AgentSession:
        """Tworzy (jeszcze nieotwartą) sesję. Ciężką pracę robi pierwsze ask()."""

    async def shutdown(self) -> None:
        """Sprząta zasoby współdzielone (np. jeden proces CLI na cały serwer)."""
