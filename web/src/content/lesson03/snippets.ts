// Kod i wyniki na prezentacji zajęć 3.
//
// NB = komórki z 03-agenci/notebook.ipynb oznaczone tagami `web:*`,
// wyciągane przez scripts/sync-notebooks.mjs. Nie należy ich edytować tutaj:
// po zmianie notebooka trzeba go uruchomić i zrobić commit; strona zaktualizuje się przy buildzie.
// Wizualizacje odtwarzają zapisane wyniki komórek (parsery poniżej), a nie wymyślone przebiegi.

import generated from "@/content/generated/03-agenci.json";

type CellData = { code: string; output: string };

const EMPTY: CellData = { code: "# brak komórki: uruchom `npm run sync`", output: "" };
export const NB = new Proxy(generated as Record<string, CellData>, {
  get: (target, key: string) => target[key] ?? EMPTY,
}) as Record<string, CellData>;

/** "czat: openai (gpt-5-nano, agent: gpt-5.4-nano) | …": model czatu i model pętli agenta. */
function parseSetup(line: string) {
  const m = line.match(/czat: (\S+) \(([^,]+), agent: ([^)]+)\)/);
  return m ? { provider: m[1], chat: m[2], agent: m[3] } : { provider: "?", chat: "LLM", agent: "LLM" };
}
export const MODELS = parseSetup(NB.setup.output);

// ---------- pętla ReAct (web:react) ----------

export type LoopEvent = { kind: "think" | "act" | "observe" | "answer"; text: string; step: number; tokens: number };

/**
 * "[1] wysłano 2 wiadomości, 333 tokenów" / "    myśl: …" / "    akcja: …" / "    obserwacja: …" / "    odpowiedź: …(do końca)".
 * Każdy krok zaczyna się od thinking w LLM, także gdy model nie wypisał myśli, i także ostatni krok przed odpowiedzią.
 */
export function parseReact(out: string): LoopEvent[] {
  const events: LoopEvent[] = [];
  const KINDS: Record<string, LoopEvent["kind"]> = { myśl: "think", akcja: "act", obserwacja: "observe", odpowiedź: "answer" };
  let step = 0;
  let tokens = 0;
  const lines = out.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const head = lines[i].match(/^\[(\d+)\] wysłano \d+ wiadomości, (\d+) tokenów/);
    if (head) {
      step = Number(head[1]);
      tokens = Number(head[2]);
      events.push({ kind: "think", text: "", step, tokens });
      continue;
    }
    const m = lines[i].match(/^\s+(myśl|akcja|obserwacja|odpowiedź): (.*)$/);
    if (!m) continue;
    const kind = KINDS[m[1]];
    if (kind === "think") {
      events[events.length - 1].text = m[2];
      continue;
    }
    if (kind === "answer" && !events[events.length - 1].text) events[events.length - 1].text = "Model ma już potrzebne dane: bez tool_calls, odpowiada tekstem.";
    else if (kind === "act" && !events[events.length - 1].text) events[events.length - 1].text = "Model wybiera kolejne narzędzie (bez komentarza w treści).";
    const text = kind === "answer" ? [m[2], ...lines.slice(i + 1)].join("\n").trim() : m[2];
    events.push({ kind, text, step, tokens });
    if (kind === "answer") break;
  }
  return events;
}
export const REACT = parseReact(NB.react.output);
export const PARALLEL = parseReact(NB.parallel.output);

/** Pętla ze slajdu: funkcja react() bez wydruków (bloki `if verbose:` i parametr verbose usunięte). */
export const reactLoop = (() => {
  const code = NB.react.code;
  const start = code.indexOf("def react");
  const end = code.lastIndexOf("return messages, log");
  if (start < 0 || end < 0) return code;
  const out: string[] = [];
  let skipIndent = -1;
  for (const line of code.slice(start, end + "return messages, log".length).split("\n")) {
    const indent = line.length - line.trimStart().length;
    if (skipIndent >= 0 && (indent > skipIndent || !line.trim())) continue;
    skipIndent = -1;
    if (line.trim().startsWith("if verbose")) {
      skipIndent = indent;
      continue;
    }
    out.push(line.replace(", verbose=True", ""));
  }
  return out.join("\n");
})();

// ---------- kontekst (web:context) ----------

export type ContextRow = { call: number; system: number; user: number; calls: number; results: number; rest: number; total: number };

export const CONTEXT: ContextRow[] = NB.context.output
  .split("\n")
  .map((l) => l.trim().split(/\s+/).map(Number))
  .filter((r) => r.length === 7 && r.every((x) => Number.isFinite(x)))
  .map(([call, system, user, calls, results, rest, total]) => ({ call, system, user, calls, results, rest, total }));

// ---------- LangGraph (web:graph-stream) ----------

export type GraphStep = { node: "model" | "tools"; text: string; toolCall: boolean };

export const GRAPH_STEPS: GraphStep[] = NB["graph-stream"].output
  .split("\n")
  .map((l) => l.match(/^\s*(model|tools) -> (.*)$/))
  .filter((m): m is RegExpMatchArray => !!m)
  .map((m) => ({ node: m[1] as "model" | "tools", text: m[2], toolCall: m[1] === "model" && /^\w+\(\{/.test(m[2]) }));

// ---------- RAG vs agentic RAG (web:agentic-rag) ----------

export type RagSearch = { query: string; docs: string[] };
export type RagCase = { question: string; rag: RagSearch | null; ragAnswer: string; agent: RagSearch[]; agentAnswer: string };

// model czasem pogrubia odpowiedź w markdownie, a slajd pokazuje zwykły tekst
export const plain = (t: string) => t.replace(/\*\*/g, "");
const unquote = (q: string) => q.replace(/^['"]|['"]$/g, "");

export const RAG_CASES: RagCase[] = NB["agentic-rag"].output
  .split("PYTANIE: ")
  .slice(1)
  .map((block) => {
    const lines = block.split("\n");
    const start = lines.findIndex((l) => /^\s+agentic RAG:/.test(l));
    const parse = (part: string[]) => ({
      searches: part
        .map((l) => l.match(/^\s+(?:retrieve|search_policy)\((.*)\) -> (.*)$/))
        .filter((m): m is RegExpMatchArray => !!m)
        .map((m) => ({ query: unquote(m[1]), docs: m[2].split(", ") })),
      answer: part.map((l) => l.match(/^\s+odpowiedź: (.*)$/)?.[1]).find(Boolean) ?? "",
    });
    const rag = parse(lines.slice(1, start));
    const agent = parse(lines.slice(start));
    return { question: lines[0].trim(), rag: rag.searches[0] ?? null, ragAnswer: plain(rag.answer), agent: agent.searches, agentAnswer: plain(agent.answer) };
  });

// ---------- kod na slajdy ----------

/** To samo zapytanie w API Anthropic: narzędzie opisuje `input_schema`, prośba przychodzi jako blok `tool_use`. */
export const anthropicTools = `
import anthropic

client = anthropic.Anthropic()
resp = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    tools=[{
        "name": "search_policy",
        "description": "Wyszukuje w zasadach firmy Nordwind.",
        "input_schema": {"type": "object",
                         "properties": {"query": {"type": "string"}},
                         "required": ["query"]},
    }],
    messages=[{"role": "user", "content": "Ile wynosi dieta w delegacji do Niemiec?"}],
)
print(resp.stop_reason)                 # "tool_use"
block = next(b for b in resp.content if b.type == "tool_use")
print(block.name, block.input)          # input to już dict, nie tekst
`;

// ---------- anatomia tool call (web:tools, web:tool-call) ----------

/** Definicja search_policy z komórki web:tools jako sformatowany JSON. */
export const SEARCH_SPEC = (() => {
  const c = NB.tools.code;
  const a = c.indexOf('{"type": "function", "function": {\n        "name": "search_policy"');
  const b = c.indexOf('"required": ["query"]}}},', a);
  if (a < 0 || b < 0) return "";
  return JSON.stringify(JSON.parse(c.slice(a, b + '"required": ["query"]}}}'.length)), null, 2);
})();

const field = (out: string, name: string) => out.match(new RegExp(`^${name}:\\s+(.*)$`, "m"))?.[1]?.trim() ?? "";
export const TOOL_CALL = {
  finish: field(NB["tool-call"].output, "finish_reason"),
  id: field(NB["tool-call"].output, "id"),
  name: field(NB["tool-call"].output, "name"),
  args: field(NB["tool-call"].output, "arguments").replace(/ str$/, ""),
  toolMsg: field(NB["tool-call"].output, "tool_msg"),
};

// ---------- pamięć (web:memory, web:store) ----------

export type MemoryTurn = { thread: string; question: string; answer: string };
const MEMORY_Q = /print\("\[(\w+)\]\s*",\s*ask\("([^"]+)"/g;
const memoryQuestions = [...NB.memory.code.matchAll(MEMORY_Q)].map((m) => ({ thread: m[1], question: m[2] }));
const memoryAnswers = NB.memory.output.split("\n").filter((l) => /^\[\w+\]/.test(l)).map((l) => l.replace(/^\[\w+\]\s*/, ""));
export const MEMORY: MemoryTurn[] = memoryQuestions.map((q, i) => ({ ...q, answer: memoryAnswers[i] ?? "" }));

const STORE_Q = /print\("\[(\w+)\]",\s*ask\("([^"]+)",\s*"(\w+)",\s*"(\w+)"\)\)/g;
const storeQuestions = [...NB.store.code.matchAll(STORE_Q)].map((m) => ({ thread: m[1], user: m[4], question: m[2] }));
const storeAnswers = NB.store.output.split("\n").filter((l) => /^\[\w+\]/.test(l)).map((l) => l.replace(/^\[\w+\]\s*/, ""));
export const STORE_TURNS = storeQuestions.map((q, i) => ({ ...q, answer: storeAnswers[i] ?? "" }));
export const STORE_FACTS = [...(NB.store.output.match(/^store: (.*)$/m)?.[1] ?? "").matchAll(/'fact': '([^']*)'/g)].map((m) => m[1]);
