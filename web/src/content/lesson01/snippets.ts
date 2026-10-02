// Kod i wyniki na prezentacji zajęć 1.
//
// NB = komórki z 01-llm-embeddingi/notebook.ipynb oznaczone tagami `web:*`,
// wyciągane przez scripts/sync-notebooks.mjs. Nie należy ich edytować tutaj:
// po zmianie notebooka trzeba go uruchomić i zrobić commit; strona zaktualizuje się przy buildzie.
//

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

const PROVIDER_NAMES: Record<string, string> = { openai: "OpenAI", azure: "Azure", ollama: "Ollama", deepseek: "DeepSeek", proxy: "proxy" };
/** Nazwa dostawcy do podpisów, np. "OpenAI". */
export const PROVIDERS = {
  chat: PROVIDER_NAMES[MODELS.provider] ?? MODELS.provider,
  embed: PROVIDER_NAMES[NB.setup.output.match(/embeddingi: (\S+)/)?.[1] ?? ""] ?? "",
};

/** Liczby z komórki web:usage (pierwsze wywołanie) do paska rozumowania. */
function parseUsage(out: string) {
  const num = (label: string) => Number(out.match(new RegExp(`${label} tokens:\\s+(\\d+)`))?.[1] ?? 0);
  return { prompt: num("prompt"), completion: num("completion"), reasoning: num("reasoning") };
}
export const USAGE = parseUsage(NB.usage.output);

/** Komórka web:context drukuje blok na model: "<model>\n<tabela>", bloki oddzielone pustą linią. */
export const CONTEXT = NB.context.output
  .split(/\n\s*\n/)
  .map((block) => {
    const [model, ...rest] = block.trim().split("\n");
    return { model, output: rest.join("\n") };
  })
  .filter((b) => b.output);

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
