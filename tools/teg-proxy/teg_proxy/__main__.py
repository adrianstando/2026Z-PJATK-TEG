"""Uruchomienie: `python -m teg_proxy` albo `teg-proxy` (po `pip install -e .`)."""

import argparse
import os


def main() -> None:
    ap = argparse.ArgumentParser(description="Lokalny serwer OpenAI-compatible na subskrypcji Claude / Copilot / Codex.")
    ap.add_argument("--port", type=int, default=8787)
    ap.add_argument("--providers", help="np. claude,copilot,codex (nadpisuje TEG_PROXY_PROVIDERS)")
    args = ap.parse_args()
    if args.providers:
        os.environ["TEG_PROXY_PROVIDERS"] = args.providers

    import uvicorn

    from . import config
    from .server import app, providers

    print(f"teg-proxy: http://127.0.0.1:{args.port}/v1 | dostawcy: {', '.join(providers)} "
          f"| sesje wygasają po {config.IDLE_SECONDS / 60:g} min bezczynności", flush=True)
    # Tylko localhost: subskrypcja jest osobista, nie wystawiaj proxy innym.
    uvicorn.run(app, host="127.0.0.1", port=args.port, log_level="warning")


if __name__ == "__main__":
    main()
