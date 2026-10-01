"""Endpointy zgodne z API OpenAI: /v1/models i /v1/chat/completions (+ podgląd /v1/sessions)."""

from __future__ import annotations

import asyncio
import json
import time
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.responses import JSONResponse, StreamingResponse

from . import config
from .messages import normalize
from .pool import SessionPool
from .providers import REGISTRY, Provider, ProviderError, load_providers

providers: dict[str, Provider] = load_providers(config.PROVIDERS)
default_provider = next(iter(providers.values()))
pool = SessionPool(config.IDLE_SECONDS, config.MAX_SESSIONS)


def resolve(model: str | None) -> tuple[Provider, str]:
    """"copilot/gpt-5-mini" -> (Copilot, "gpt-5-mini"); "copilot" -> domyślny model Copilota;
    nazwa bez prefiksu (np. "claude-haiku-4-5") -> domyślny dostawca."""
    if not model:
        return default_provider, default_provider.default_model
    prefix, _, rest = model.partition("/")
    if prefix in providers:
        provider = providers[prefix]
        return provider, rest or provider.default_model
    if prefix in REGISTRY:
        raise ProviderError(400, f"Dostawca '{prefix}' jest wyłączony. Dodaj go do TEG_PROXY_PROVIDERS.")
    return default_provider, model


@asynccontextmanager
async def lifespan(_: FastAPI):
    reaper = asyncio.create_task(pool.reaper())
    yield
    reaper.cancel()
    await pool.close_all()
    for p in providers.values():
        await p.shutdown()


app = FastAPI(title="teg-proxy", lifespan=lifespan)


@app.exception_handler(ProviderError)
async def provider_error(_: Request, e: ProviderError):
    # Kształt błędu jak w API OpenAI, żeby klient openai pokazał czytelny komunikat.
    return JSONResponse({"error": {"message": e.message, "type": "teg_proxy_error"}}, status_code=e.status)


def check_key(authorization: str | None) -> None:
    if config.API_KEY and authorization != f"Bearer {config.API_KEY}":
        raise HTTPException(401, "Zły klucz (TEG_PROXY_API_KEY).")


@app.get("/v1/models")
async def models(authorization: str | None = Header(None)):
    check_key(authorization)
    ids: list[str] = []
    for name, p in providers.items():
        try:
            ids += [f"{name}/{m}" for m in await p.list_models()]
        except Exception as e:  # niezalogowany dostawca nie psuje listy pozostałych
            print(f"[teg-proxy] {name}: nie udało się pobrać modeli ({e})", flush=True)
    return {"object": "list", "data": [{"id": i, "object": "model", "owned_by": "teg-proxy"} for i in ids]}


@app.get("/v1/sessions")
async def sessions():
    """Podgląd puli — na zajęciach widać, kiedy sesja jest "ciepła"."""
    return pool.snapshot()


@app.post("/v1/chat/completions")
async def chat(body: dict, authorization: str | None = Header(None)):
    check_key(authorization)
    provider, model = resolve(body.get("model"))
    system, turns = normalize(body.get("messages", []))

    t0 = time.time()
    text, usage, warm = await pool.chat(provider, model, system, turns)
    label = f"{provider.name}/{model}"
    print(f"[teg-proxy] {label:<28} {'ciepła' if warm else 'nowa  '} sesja {time.time() - t0:5.1f}s  w tle: {len(pool.live)}", flush=True)

    rid, created = f"chatcmpl-{uuid.uuid4().hex[:24]}", int(t0)
    if body.get("stream"):
        # Agent oddaje odpowiedź w całości, więc "strumień" ma jeden kawałek —
        # wystarcza klientom, które zawsze używają stream=True (np. część LangChaina).
        def sse():
            for delta, finish in (({"role": "assistant", "content": text}, None), ({}, "stop")):
                chunk = {"id": rid, "object": "chat.completion.chunk", "created": created, "model": label,
                         "choices": [{"index": 0, "delta": delta, "finish_reason": finish}]}
                yield f"data: {json.dumps(chunk, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"

        return StreamingResponse(sse(), media_type="text/event-stream")

    return {
        "id": rid, "object": "chat.completion", "created": created, "model": label,
        "choices": [{"index": 0, "message": {"role": "assistant", "content": text}, "finish_reason": "stop"}],
        "usage": usage.as_openai(),
    }
