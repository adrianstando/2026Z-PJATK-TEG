"""Anthropic API (Claude) — płatne. Klucz: https://platform.claude.com -> API keys
.env:  ANTHROPIC_API_KEY=sk-ant-...

Różnice względem OpenAI: `system` to osobny parametr, `max_tokens` jest wymagany,
tekst jest w `content[0].text`. Nowe modele Claude nie przyjmują `temperature`.
"""
import anthropic
from dotenv import load_dotenv

load_dotenv()
client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-opus-5-5",  # tańsze: "claude-sonnet-5-5", "claude-haiku-4-5"
    max_tokens=1024,
    system="Odpowiadaj krótko, po polsku.",
    messages=[{"role": "user", "content": "Czym jest embedding?"}],
)
if message.stop_reason == "refusal":
    print("Model odmówił odpowiedzi.")
else:
    print(message.content[0].text)
print(message.usage)
