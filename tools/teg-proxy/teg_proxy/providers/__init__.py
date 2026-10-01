"""Rejestr dostawców ładowanych dynamicznie.

Które są aktywne, decyduje zmienna środowiskowa (pierwszy = domyślny):

    TEG_PROXY_PROVIDERS=claude,copilot,codex

Moduł dostawcy importujemy dopiero, gdy jest włączony — więc kto używa tylko
Claude, nie musi instalować SDK Copilota ani Codexa.
"""

from __future__ import annotations

import importlib
import os

from .base import Provider, ProviderError

# nazwa -> "moduł:Klasa"
REGISTRY: dict[str, str] = {
    "claude": "teg_proxy.providers.claude:ClaudeProvider",
    "copilot": "teg_proxy.providers.copilot:CopilotProvider",
    "codex": "teg_proxy.providers.codex:CodexProvider",
}


def load_providers(spec: str | None = None) -> dict[str, Provider]:
    names = [n.strip() for n in (spec or os.getenv("TEG_PROXY_PROVIDERS", "claude")).split(",") if n.strip()]
    providers: dict[str, Provider] = {}
    for name in names:
        if name not in REGISTRY:
            raise SystemExit(f"Nieznany dostawca '{name}'. Dostępni: {', '.join(REGISTRY)}")
        module_name, cls_name = REGISTRY[name].split(":")
        try:
            module = importlib.import_module(module_name)
        except ImportError as e:
            raise SystemExit(f"Dostawca '{name}' wymaga pakietu, którego brakuje: {e.name}. "
                             f"Zainstaluj: pip install -r requirements.txt") from e
        providers[name] = getattr(module, cls_name)()
    if not providers:
        raise SystemExit("TEG_PROXY_PROVIDERS jest puste.")
    return providers


__all__ = ["Provider", "ProviderError", "REGISTRY", "load_providers"]
