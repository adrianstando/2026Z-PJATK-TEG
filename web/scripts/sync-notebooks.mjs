// Wyciąga z notebooków komórki oznaczone tagiem `web:<klucz>` (kod + zapisany wynik)
// do src/content/generated/<folder>.json. Prezentacja importuje te pliki, więc
// zmiana w notebooku (po ponownym uruchomieniu i commicie) sama trafia na stronę.
//
// Uruchamiane automatycznie przed `next dev` i `next build` (predev/prebuild).
// Brakujący tag, którego oczekuje strona, przerywa build — lepiej głośny błąd
// niż prezentacja po cichu pokazująca stare dane.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outDir = path.resolve(root, "web/src/content/generated");

// folder z notebookiem -> tagi, których potrzebuje strona
const NOTEBOOKS = {
  "01-llm-embeddingi": ["setup", "first-call", "usage", "tokens", "temperature", "limit", "chat", "agent", "embedding", "similarity", "context", "search"],
};

const join = (x) => (Array.isArray(x) ? x.join("") : x ?? "");

function cellOutput(cell) {
  return (cell.outputs ?? [])
    .map((o) => {
      if (o.output_type === "stream") return join(o.text);
      if (o.output_type === "execute_result") return join(o.data?.["text/plain"]);
      if (o.output_type === "error") return `${o.ename}: ${o.evalue}`;
      return "";
    })
    .join("")
    .replace(/\x1b\[[0-9;]*m/g, "") // kolory ANSI z tracebacków
    .trimEnd();
}

fs.mkdirSync(outDir, { recursive: true });
let failed = false;

for (const [folder, expected] of Object.entries(NOTEBOOKS)) {
  const file = path.join(root, folder, "notebook.ipynb");
  const nb = JSON.parse(fs.readFileSync(file, "utf8"));
  const cells = {};
  for (const cell of nb.cells) {
    for (const tag of cell.metadata?.tags ?? []) {
      if (!tag.startsWith("web:")) continue;
      cells[tag.slice(4)] = { code: join(cell.source).trim(), output: cellOutput(cell) };
    }
  }
  const missing = expected.filter((t) => !(t in cells));
  if (missing.length) {
    console.error(`✗ ${folder}/notebook.ipynb: brak komórek z tagami ${missing.map((t) => "web:" + t).join(", ")}`);
    failed = true;
  }
  const empty = expected.filter((t) => cells[t] && !cells[t].output);
  if (empty.length) console.warn(`! ${folder}: komórki bez wyniku (notebook nieuruchomiony?): ${empty.join(", ")}`);
  fs.writeFileSync(path.join(outDir, `${folder}.json`), JSON.stringify(cells, null, 1) + "\n");
  console.log(`✓ ${folder}: ${Object.keys(cells).length} komórek -> src/content/generated/${folder}.json`);
}

if (failed) process.exit(1);
