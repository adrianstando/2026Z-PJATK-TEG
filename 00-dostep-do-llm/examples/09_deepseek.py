"""DeepSeek — bardzo tanie API zgodne z OpenAI. Klucz: https://platform.deepseek.com
.env:  DEEPSEEK_API_KEY=sk-...

Modele: deepseek-chat (bez rozumowania), deepseek-reasoner (z rozumowaniem). Brak embeddingów.
Dane przetwarzane są na serwerach w Chinach.
"""
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(base_url="https://api.deepseek.com", api_key=os.environ["DEEPSEEK_API_KEY"])

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[{"role": "user", "content": "Czym jest embedding? Jedno zdanie."}],
)
print(response.choices[0].message.content)
print(response.usage)
