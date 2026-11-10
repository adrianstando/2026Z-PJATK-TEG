// Kod i wyniki na prezentacji zajęć 4.
//
// NB = komórki z 04-graphrag/notebook.ipynb oznaczone tagami `web:*`,
// wyciągane przez scripts/sync-notebooks.mjs. Nie należy ich edytować tutaj.

import generated from "@/content/generated/04-graphrag.json";

type CellData = { code: string; output: string };

const EMPTY: CellData = { code: "# brak komórki: uruchom `npm run sync`", output: "" };
export const NB = new Proxy(generated as Record<string, CellData>, {
  get: (target, key: string) => target[key] ?? EMPTY,
}) as Record<string, CellData>;

function parseSetup(line: string) {
  const m = line.match(/czat: (\S+) \(([^,]+), agent: ([^)]+)\).*\| embeddingi: (\S+) \(([^)]+)\)/);
  return m ? { provider: m[1], chat: m[2], agent: m[3], embed: m[5] } : { provider: "?", chat: "LLM", agent: "LLM", embed: "embeddings" };
}
export const MODELS = parseSetup(NB.setup.output);

/** Fragment kodu między dwoma znacznikami (do skrócenia komórki na slajd). */
export const between = (code: string, from: string, to?: string) => {
  const a = code.indexOf(from);
  if (a < 0) return code;
  const b = to ? code.indexOf(to, a + from.length) : -1;
  return code.slice(a, b < 0 ? undefined : b).trim();
};

/** Przykłady składni z komórki web:cypher-syntax: "=== tytuł" / zapytanie / "--> wynik". */
export const SYNTAX = NB["cypher-syntax"].output
  .split("=== ")
  .filter((b) => b.trim())
  .map((b) => {
    const [title, ...rest] = b.trim().split("\n");
    const at = rest.findIndex((l) => l.startsWith("--> "));
    return { title, query: rest.slice(0, at).join("\n"), result: rest.slice(at).join("\n").replace(/^--> /, "").trim() };
  });

/** Pełne CREATE małego grafu (web:cypher-create), po jednym węźle albo relacji w linii. */
export const CREATE_CODE =
  "CREATE\n  " +
  between(NB["cypher-create"].code, "CREATE", '"""')
    .replace(/^CREATE\s*/, "")
    .split(/,\s*(?=\()/)
    .map((x) => x.trim())
    .join(",\n  ");
