"""teg-proxy — subskrypcja Claude / Copilot / Codex jako API zgodne z OpenAI.

W osobnym terminalu:
    cd tools/teg-proxy && pip install -r requirements.txt
    python -m teg_proxy --providers copilot,claude,codex

Potem każdy kod pod `openai.OpenAI` działa bez klucza API (tylko czat, bez embeddingów).
"""
from openai import OpenAI

client = OpenAI(base_url="http://localhost:8787/v1", api_key="teg")

print([m.id for m in client.models.list().data])

for model in ["copilot/gpt-5-mini", "claude-haiku-4-5", "codex/gpt-5.5"]:
    try:
        r = client.chat.completions.create(model=model, messages=[{"role": "user", "content": "Powiedz: działa!"}])
        print(f"{model}: {r.choices[0].message.content}")
    except Exception as e:
        print(f"{model}: {e}")
