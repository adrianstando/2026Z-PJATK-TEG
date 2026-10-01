"""Ollama — modele lokalnie, za darmo, bez internetu.

    https://ollama.com/download
    ollama pull gemma3:1b
    ollama pull embeddinggemma

Ollama udostępnia API zgodne z OpenAI, więc używamy tego samego klienta.
"""
from openai import OpenAI

client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")  # klucz wymagany, ale ignorowany

response = client.chat.completions.create(
    model="gemma3:1b",
    messages=[{"role": "user", "content": "Czym jest embedding? Jedno zdanie."}],
)
print(response.choices[0].message.content)

emb = client.embeddings.create(model="embeddinggemma", input=["kot", "pies"])
print("wymiar embeddingu:", len(emb.data[0].embedding))
