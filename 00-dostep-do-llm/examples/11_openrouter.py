"""OpenRouter — jeden klucz do modeli wielu dostawców. Klucz: https://openrouter.ai/keys
.env:  OPENROUTER_API_KEY=sk-or-...

Lista modeli: https://openrouter.ai/models (modele z sufiksem ":free" są darmowe, z limitami).
"""
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=os.environ["OPENROUTER_API_KEY"])

response = client.chat.completions.create(
    model="openai/gpt-4.1-mini",
    messages=[{"role": "user", "content": "Czym jest embedding? Jedno zdanie."}],
)
print(response.choices[0].message.content)
