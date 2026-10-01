// Kod i wyniki na prezentacji zajęć 1.
//
// NB = komórki z 01-llm-embeddingi/notebook.ipynb oznaczone tagami `web:*`,
// wyciągane przez scripts/sync-notebooks.mjs. Nie należy ich edytować tutaj:
// po zmianie notebooka trzeba go uruchomić i zrobić commit; strona zaktualizuje się przy buildzie.
//
// REFERENCE = prawdziwe wyniki z modeli OpenAI (gpt-5-nano, text-embedding-3-small),
// pokazywane obok wyników z notebooka dla porównania. Zostają ręcznie, z podpisem modelu.

import generated from "@/content/generated/01-llm-embeddingi.json";

type CellData = { code: string; output: string };

// Brakująca komórka (np. serwer dev uruchomiony przed synchronizacją) nie może
// wywrócić strony; build i tak ją wyłapie w scripts/sync-notebooks.mjs.
const EMPTY: CellData = { code: "# brak komórki: uruchom `npm run sync`", output: "" };
export const NB = new Proxy(generated as Record<string, CellData>, {
  get: (target, key: string) => target[key] ?? EMPTY,
}) as Record<string, CellData>;

/** "czat: proxy (claude-haiku-4-5, ...) | embeddingi: ollama (embeddinggemma)" -> modele do podpisów. */
function parseSetup(line: string) {
  const m = line.match(/czat: (\S+) \(([^,]+),.*\| embeddingi: (\S+) \(([^)]+)\)/);
  return m ? { chat: m[2], embed: m[4], provider: m[1] } : { chat: "LLM", embed: "embeddings", provider: "?" };
}
export const MODELS = parseSetup(NB.setup.output);

export const REFERENCE = {
  usageModel: "gpt-5-nano (OpenAI)",
  usageOut: `
Prompt tokens: 30
Completion tokens: 847
Total tokens: 877
Reasoning tokens: 576
`,
  contextModel: "text-embedding-3-small (OpenAI)",
  contextOut: `
kontekst                            cat-dog  cat-kitten
[X]                                  0.6026      0.5697
The [X] is sleeping peacefully       0.7670      0.8822
I love my [X] very much              0.7762      0.9080
Training a [X] requires patience     0.7804      0.9055
`,
};

// Uproszczona wersja anthropic na slajd (pełna jest w notebooku i w 00-dostep-do-llm).
export const anthropicCall = `
import anthropic

client = anthropic.Anthropic()  # ANTHROPIC_API_KEY

message = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    system="You are a cool teacher who explains science using hip-hop slang.",
    messages=[{"role": "user", "content": "Why is the sky blue?"}],
)
print(message.content[0].text)
`;
