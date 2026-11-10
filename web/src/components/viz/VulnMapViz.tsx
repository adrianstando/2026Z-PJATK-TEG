"use client";

import { useState } from "react";
import { ToggleGroup } from "radix-ui";
import data from "@/data/lesson06-vulns.json";
import { VULN_TEXT } from "@/content/lesson06/vulns";
import { Panel } from "@/components/ui/Panel";
import { StableHeight } from "@/components/molecules/StableHeight";
import { cn } from "@/lib/cn";

// Kolejność: od najgroźniejszych i najłatwiejszych do wykorzystania.
const ORDER = ["sql-injection", "sekret-w-kodzie", "wyciek-hasel", "idor", "zaufanie-do-klienta", "race-condition", "wyciek-odpowiedzi", "wyciek-hasel-ranking", "brak-walidacji", "blad-500-zamiast-401", "konfiguracja", "brak-testow"];
const ITEMS = ORDER.map((id) => data.items.find((x) => x.id === id)!).filter(Boolean);
const N = data.lines.length;

type Item = (typeof ITEMS)[number];

function Detail({ v }: { v: Item }) {
  const t = VULN_TEXT[v.id];
  const line = v.line ?? N;
  const from = Math.max(1, line - 2);
  const excerpt = v.line ? data.lines.slice(from - 1, Math.min(N, line + 2)) : ["# w katalogu app/ nie ma żadnego pliku test_*.py"];
  return (
    <Panel className="space-y-4 p-5">
      <p className="text-lg font-medium">{t.title}</p>
      <p className="text-sm text-fg-muted">{t.concept}</p>
      <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-ink-950/60">
        <p className="border-b border-[var(--line)] px-3 py-1.5 font-mono text-xs text-fg-subtle">błędny kod · app.py{v.line ? `:${v.line}` : ""}</p>
        <pre className="overflow-x-auto py-2 font-mono text-xs leading-relaxed">
          {excerpt.map((l, i) => (
            <span key={i} className={cn("block px-3 whitespace-pre", v.line && from + i === line ? "bg-miss/15 text-fg" : "text-fg-muted")}>
              <span className="mr-3 inline-block w-7 text-right tabular-nums opacity-60">{v.line ? from + i : ""}</span>
              {l || " "}
            </span>
          ))}
        </pre>
      </div>
      {v.attack && <pre className="rounded-lg border border-miss/40 bg-miss/[0.06] px-3 py-2 font-mono text-xs whitespace-pre-wrap text-miss">{v.attack}</pre>}
      <p className="text-sm text-fg">{t.why}</p>
      <p className="text-sm text-hit">Poprawka: {v.fix}</p>
    </Panel>
  );
}

/**
 * Organizm: luki w app.py napisanym jednym promptem. Lista po lewej, po prawej objaśnienie pojęcia,
 * błędny fragment kodu, prawdziwy wynik ataku z atak.py i poprawka. Prawa karta ma rezerwę najdłuższej luki
 * (StableHeight hug), więc wybór innej luki nie przesuwa strony. Dane: scripts/lesson06_data.py.
 */
export function VulnMapViz() {
  const [sel, setSel] = useState(ITEMS[0].id);
  const cur = ITEMS.find((x) => x.id === sel)!;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
      <ToggleGroup.Root
        type="single"
        value={sel}
        onValueChange={(v) => v && setSel(v)}
        orientation="vertical"
        aria-label="Luka"
        className="grid gap-1.5 self-start sm:grid-cols-2 lg:grid-cols-1"
      >
        {ITEMS.map((x, i) => (
          <ToggleGroup.Item
            key={x.id}
            value={x.id}
            className="flex items-start gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-left text-sm text-fg-muted transition-colors hover:text-fg data-[state=on]:border-brand-400 data-[state=on]:bg-brand-500/15 data-[state=on]:text-fg"
          >
            <span className="font-mono text-xs text-brand-300 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
            {VULN_TEXT[x.id].title}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <StableHeight mode="hug" variants={ITEMS.map((x) => <Detail key={x.id} v={x} />)}>
        <Detail v={cur} />
      </StableHeight>
    </div>
  );
}
