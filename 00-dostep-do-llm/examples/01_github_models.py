"""GitHub Models — darmowy dostęp z kontem GitHub (limity dzienne).

Token: https://github.com/settings/personal-access-tokens -> Fine-grained token -> Permissions: Models (read).
.env:  GITHUB_TOKEN=github_pat_...
"""
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(base_url="https://models.github.ai/inference", api_key=os.environ["GITHUB_TOKEN"])

response = client.chat.completions.create(
    model="openai/gpt-4.1-mini",  # pełna lista: https://github.com/marketplace?type=models
    messages=[
        {"role": "system", "content": "Odpowiadaj krótko, po polsku."},
        {"role": "user", "content": "Czym jest embedding?"},
    ],
)
print(response.choices[0].message.content)

emb = client.embeddings.create(model="openai/text-embedding-3-small", input=["kot", "pies"])
print("wymiar embeddingu:", len(emb.data[0].embedding))
