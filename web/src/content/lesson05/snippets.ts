// Kod i wyniki na prezentacji zajęć 5.
//
// NB = komórki z 05-mcp-multi-agent/notebook.ipynb oznaczone tagami `web:*`,
// wyciągane przez scripts/sync-notebooks.mjs. Nie należy ich edytować tutaj:
// po zmianie notebooka trzeba go uruchomić i zrobić commit; strona zaktualizuje się przy buildzie.
// Wizualizacje odtwarzają zapisane wyniki komórek (parsery poniżej), a nie wymyślone przebiegi.

import generated from "@/content/generated/05-mcp-multi-agent.json";

type CellData = { code: string; output: string };

const EMPTY: CellData = { code: "# brak komórki: uruchom `npm run sync`", output: "" };
export const NB = new Proxy(generated as Record<string, CellData>, {
  get: (target, key: string) => target[key] ?? EMPTY,
}) as Record<string, CellData>;

/** "czat: openai (gpt-5-nano, klasyczny: gpt-4.1-mini) | …": agenci w notebooku używają modelu klasycznego. */
function parseSetup(line: string) {
  const m = line.match(/czat: (\S+) \(([^,]+), klasyczny: ([^)]+)\)/);
  return m ? { provider: m[1], chat: m[2], agent: m[3] } : { provider: "?", chat: "LLM", agent: "LLM" };
}
export const MODELS = parseSetup(NB.setup.output);

// ---------- serwer (web:server) ----------

const server = NB.server.code.replace(/^%%writefile .*\n/, "");

/** Wycina z pliku serwera fragment od `start` do najbliższych dwóch pustych linii. */
function cut(start: string) {
  const i = server.indexOf(start);
  if (i < 0) return "";
  const j = server.indexOf("\n\n\n", i);
  return server.slice(i, j < 0 ? undefined : j).trim();
}

/** Na slajd: utworzenie serwera, narzędzie do odczytu, zasób, prompt, uruchomienie. */
export const serverExcerpt = [
  "from mcp.server.fastmcp import FastMCP",
  "from mcp.types import ToolAnnotations",
  "",
  server.split("\n").find((l) => l.startsWith("mcp = FastMCP")) ?? "",
  server.split("\n").find((l) => l.startsWith("READ_ONLY = ")) ?? "",
  "",
  cut("@mcp.tool(annotations=READ_ONLY)\ndef list_tickets"),
  "",
  cut('@mcp.resource("nordwind://schema"'),
  "",
  cut("@mcp.prompt()"),
  "",
  cut("if __name__"),
].join("\n");

/** run_sql: ochrona po stronie bazy. */
export const runSql = cut("@mcp.tool(annotations=READ_ONLY)\ndef run_sql");

// ---------- JSON-RPC (web:jsonrpc) ----------

export type RpcMessage = { dir: "out" | "in"; method: string; id?: number; body: string; note?: string };

/** "→ {json}" (żądanie klienta, pełne) / "← {json …}" (odpowiedź serwera, przycięta) / "  narzędzia: [...]" */
export function parseRpc(out: string): RpcMessage[] {
  const msgs: RpcMessage[] = [];
  const byId: Record<number, string> = {};
  for (const line of out.split("\n")) {
    if (line.startsWith("→ ")) {
      const body = line.slice(2);
      try {
        const j = JSON.parse(body);
        if (j.id) byId[j.id] = j.method;
        msgs.push({ dir: "out", method: j.method, id: j.id, body });
      } catch {
        msgs.push({ dir: "out", method: "?", body });
      }
    } else if (line.startsWith("← ")) {
      const body = line.slice(2);
      const id = Number(body.match(/"id": (\d+)/)?.[1]);
      msgs.push({ dir: "in", method: byId[id] ?? "?", id, body });
    } else if (line.trim().startsWith("narzędzia:") && msgs.length) {
      msgs[msgs.length - 1].note = line.trim();
    }
  }
  return msgs;
}
export const RPC = parseRpc(NB.jsonrpc.output);

// ---------- supervisor (web:supervisor) ----------

export type TraceEvent = { kind: "task" | "tool" | "result" | "answer"; agent: string; text: string };

/** "→ hr: zadanie" / "  · hr → find_employee({...})" / "← hr: wynik (wiele linii)" / "= odpowiedź: … " / "[9 wywołań …]" */
export function parseTrace(out: string): { events: TraceEvent[]; stats: string } {
  const events: TraceEvent[] = [];
  let stats = "";
  for (const line of out.split("\n")) {
    let m;
    if ((m = line.match(/^→ (\w+): (.*)$/))) events.push({ kind: "task", agent: m[1], text: m[2] });
    else if ((m = line.match(/^\s+· (\w+) → (.*)$/))) events.push({ kind: "tool", agent: m[1], text: m[2] });
    else if ((m = line.match(/^← (\w+): (.*)$/))) events.push({ kind: "result", agent: m[1], text: m[2] });
    else if ((m = line.match(/^= odpowiedź: (.*)$/))) events.push({ kind: "answer", agent: "supervisor", text: m[1] });
    else if ((m = line.match(/^\[(.*)\]$/))) stats = m[1];
    else if (events.length && line.trim()) events[events.length - 1].text += "\n" + line;
  }
  return { events, stats };
}
export const TRACE = parseTrace(NB.supervisor.output);

// ---------- porównanie (web:compare) ----------

export type Measure = { calls: number; in: number; out: number; s: number; ok: boolean };
export const COMPARE: Record<string, Measure[]> = (() => {
  const line = NB.compare.output.split("\n").find((l) => l.startsWith("pomiary: "));
  try {
    return line ? JSON.parse(line.slice("pomiary: ".length)) : {};
  } catch {
    return {};
  }
})();
export const COMPARE_TITLE = NB.compare.output.split("\n")[0] ?? "";

// ---------- konfiguracja hostów (opis, nie wynik komórki) ----------

export const claudeDesktopConfig = `{
  "mcpServers": {
    "nordwind": {
      "command": "python",
      "args": ["/home/student/teg/05-mcp-multi-agent/nordwind_mcp.py"]
    }
  }
}`;

export const claudeCodeConfig = `{
  "mcpServers": {
    "nordwind": {
      "command": "python",
      "args": ["05-mcp-multi-agent/nordwind_mcp.py"]
    },
    "nordwind-http": {
      "type": "http",
      "url": "http://127.0.0.1:8000/mcp"
    }
  }
}`;

export const vscodeConfig = `{
  "servers": {
    "nordwind": {
      "type": "stdio",
      "command": "python",
      "args": ["\${workspaceFolder}/05-mcp-multi-agent/nordwind_mcp.py"]
    },
    "nordwind-http": {
      "type": "http",
      "url": "http://127.0.0.1:8000/mcp"
    }
  }
}`;

/** Polecenia, które dopisują serwer do konfiguracji (zamiast ręcznej edycji pliku). */
export const hostCommands = `# Claude Code: serwer stdio i serwer HTTP w .mcp.json projektu
claude mcp add --scope project nordwind \\
  -- python 05-mcp-multi-agent/nordwind_mcp.py
claude mcp add --scope project --transport http \\
  nordwind-http http://127.0.0.1:8000/mcp
claude mcp list

# VS Code: dopisuje serwer do ustawień użytkownika
code --add-mcp '{"name": "nordwind", "command": "python",
  "args": ["05-mcp-multi-agent/nordwind_mcp.py"]}'

# MCP Inspector: serwer bez modelu, w przeglądarce
npx @modelcontextprotocol/inspector \\
  python 05-mcp-multi-agent/nordwind_mcp.py`;

/**
 * JSON z wcięciami jak JSON.stringify(v, null, 2), ale napis z wieloma liniami (np. content[].text,
 * czyli JSON zapisany jako tekst) jest rozwinięty w linie zamiast jednego wiersza z \n.
 */
export function prettyJson(v: unknown, ind = 0): string {
  const pad = (n: number) => " ".repeat(n);
  if (typeof v === "string" && v.includes("\n")) return '"' + v.split("\n").join("\n" + pad(ind + 2)) + '"';
  if (Array.isArray(v)) return v.length ? "[\n" + v.map((x) => pad(ind + 2) + prettyJson(x, ind + 2)).join(",\n") + "\n" + pad(ind) + "]" : "[]";
  if (v && typeof v === "object") {
    const e = Object.entries(v as Record<string, unknown>);
    return e.length ? "{\n" + e.map(([k, x]) => `${pad(ind + 2)}${JSON.stringify(k)}: ${prettyJson(x, ind + 2)}`).join(",\n") + "\n" + pad(ind) + "}" : "{}";
  }
  return JSON.stringify(v);
}

// ---------- dane do animacji przepływów ----------

const lines = (out: string) => out.split("\n");
const lineAfter = (out: string, prefix: string) => lines(out).find((l) => l.startsWith(prefix))?.slice(prefix.length).trim() ?? "";

/** web:client: wynik każdego wywołania (tools/call, resources/read, prompts/get). */
export const CLIENT = {
  tool: lineAfter(NB.client.output, "tools/call:"),
  resources: lineAfter(NB.client.output, "resources:"),
  read: lineAfter(NB.client.output, "resources/read:"),
  prompt: lineAfter(NB.client.output, "prompts/get:"),
};

/** web:http: lista narzędzi przez HTTP i pierwsza linia wyniku. */
export const HTTP = {
  tools: lineAfter(NB.http.output, "przez HTTP:"),
  result: lines(NB.http.output)[1]?.slice(0, 160) ?? "",
};

/** Opis zgłoszenia #102 z kodu serwera (sklejone literały w jedną linię). */
export const TICKET_102 = (() => {
  const flat = server.replace(/"\s*\n\s*"/g, "");
  return flat.match(/"(Drukarka na 2\.[^"]*)"/)?.[1] ?? "";
})();

export type ToolCall = { name: string; args: string };
/** "  narzędzie: name({...})" → wywołania; reszta po ostatnim wywołaniu do pustej linii z "nowe zgłoszenia" → odpowiedź. */
export function parseRun(out: string) {
  const calls: ToolCall[] = [];
  const answer: string[] = [];
  let created = "";
  for (const l of lines(out)) {
    const m = l.match(/^\s+narzędzie: (\w+)\((.*)\)$/);
    if (m) calls.push({ name: m[1], args: m[2] });
    else if (l.startsWith("nowe zgłoszenia w bazie po rozmowie:")) created = l.split(":").slice(1).join(":").trim();
    else if (l.startsWith("narzędzia agenta:")) continue;
    else if (calls.length && l.trim()) answer.push(l);
  }
  return { calls, answer: answer.join("\n"), created };
}
export const INJECTION = parseRun(NB.injection.output);
export const LEAST = { tools: lineAfter(NB["least-privilege"].output, "narzędzia agenta:"), ...parseRun(NB["least-privilege"].output) };
export const HITL = {
  pending: lineAfter(NB.hitl.output, "do zatwierdzenia:"),
  answer: lines(NB.hitl.output).slice(1).join("\n").trim(),
};

/** web:parallel: plan, czasy zakończenia wykonawców, synteza. */
export const PARALLEL = (() => {
  const plan: { worker: string; task: string }[] = [];
  const done: { worker: string; s: number; task: string }[] = [];
  let synthesis = "";
  const ls = lines(NB.parallel.output);
  ls.forEach((l, i) => {
    let m;
    if ((m = l.match(/^plan → (\w+): (.*)$/))) plan.push({ worker: m[1], task: m[2] });
    else if ((m = l.match(/^worker gotowy po ([\d.]+) s: \[(\w+)\] (.*)$/))) done.push({ worker: m[2], s: Number(m[1]), task: m[3] });
    else if (l.startsWith("synteza:")) synthesis = [l.slice(8).trim(), ...ls.slice(i + 1)].join("\n").trim();
  });
  return { plan, done, synthesis };
})();

/** web:critic: przebieg pętli writer–critic. Linie: "  · writer → narzędzie(…)", "writer (n): raport…", "critic: ok=… | uwagi", "[… rund, …]". */
export const CRITIC = (() => {
  const steps: { who: "writer" | "critic"; calls: string[]; text: string; ok?: boolean }[] = [];
  let calls: string[] = [];
  let stats = "";
  for (const l of lines(NB.critic.output)) {
    let m;
    if ((m = l.match(/^\s+· (writer|critic) → (.*)$/))) calls.push(m[2]);
    else if ((m = l.match(/^writer \(\d+\): (.*)$/))) {
      steps.push({ who: "writer", calls, text: m[1] });
      calls = [];
    } else if ((m = l.match(/^critic: ok=(True|False) \| (.*)$/))) {
      steps.push({ who: "critic", calls, text: m[2], ok: m[1] === "True" });
      calls = [];
    } else if ((m = l.match(/^\[(.*)\]$/))) stats = m[1];
    else if (steps.length && l.trim()) steps[steps.length - 1].text += "\n" + l;
  }
  return { steps, stats };
})();
