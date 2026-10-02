"""OpenAI API — płatne (pay as you go). Klucz: https://platform.openai.com/api-keys
.env:  OPENAI_API_KEY=sk-...
"""
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-5-nano",
    messages=[{"role": "user", "content": "Czym jest embedding? Jedno zdanie."}],
)
print(response.choices[0].message.content)
print(response.usage)  # zwróć uwagę na reasoning_tokens
