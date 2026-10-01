"""Konfiguracja ze zmiennych środowiskowych (wszystkie opcjonalne)."""

import os

PROVIDERS = os.getenv("TEG_PROXY_PROVIDERS", "claude")          # np. "claude,copilot,codex"; pierwszy = domyślny
IDLE_SECONDS = float(os.getenv("TEG_PROXY_IDLE_MINUTES", "60")) * 60  # po tylu min bezczynności sesja jest zamykana
MAX_SESSIONS = int(os.getenv("TEG_PROXY_MAX_SESSIONS", "8"))     # ile rozmów naraz trzymać w tle
API_KEY = os.getenv("TEG_PROXY_API_KEY")                         # jeśli ustawiony: wymagaj "Authorization: Bearer <klucz>"
