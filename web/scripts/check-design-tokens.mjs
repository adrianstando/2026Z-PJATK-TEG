// Sprawdza, czy kolory z .claude/DESIGN.md (nagłówek YAML) są takie same jak w globals.css.
// DESIGN.md jest źródłem prawdy; globals.css to jego implementacja dla Tailwinda.
// Uruchamiane przed `next dev` i `next build`. Rozjazd przerywa build.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const design = fs.readFileSync(path.resolve(here, "../../.claude/DESIGN.md"), "utf8");
const css = fs.readFileSync(path.resolve(here, "../src/app/globals.css"), "utf8");

// Blok `colors:` z nagłówka YAML: wiersze "  nazwa: "wartość""
const front = design.split(/^---$/m)[1] ?? "";
const block = front.split(/^colors:\s*$/m)[1]?.split(/^\S/m)[0] ?? "";
const colors = [...block.matchAll(/^ {2}([\w-]+):\s*"?([^"\n]+)"?\s*$/gm)].map(([, name, value]) => [name, value.trim()]);

const norm = (v) => v.toLowerCase().replace(/\s+/g, " ").trim();
const problems = [];
for (const [name, value] of colors) {
  const m = css.match(new RegExp(`--(?:color-)?${name}:\\s*([^;]+);`));
  if (!m) problems.push(`brak --color-${name} (albo --${name}) w globals.css`);
  else if (norm(m[1]) !== norm(value)) problems.push(`${name}: DESIGN.md ${value} ≠ globals.css ${m[1].trim()}`);
}

if (problems.length) {
  console.error("✗ DESIGN.md i globals.css się rozjechały:\n  " + problems.join("\n  "));
  process.exit(1);
}
console.log(`✓ tokeny: ${colors.length} kolorów zgodnych z DESIGN.md`);
