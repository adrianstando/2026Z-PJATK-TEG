"use client";

import { useState } from "react";
import { FileText, Folder, FolderOpen } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { StableHeight } from "@/components/molecules/StableHeight";
import { cn } from "@/lib/cn";
import type { TreeNode, When } from "@/content/lesson06/tree";

type Node = TreeNode & { preview: string };

const WHEN: Record<When, { tone: "brand" | "hit" | "focus" | "miss" | "neutral"; label: string }> = {
  start: { tone: "brand", label: "start sesji" },
  "na żądanie": { tone: "hit", label: "na żądanie" },
  harness: { tone: "focus", label: "harness, nie model" },
  subagent: { tone: "neutral", label: "osobny kontekst" },
  instalacja: { tone: "miss", label: "instalacja pluginu" },
  praca: { tone: "neutral", label: "gdy agent sięgnie" },
  zablokowany: { tone: "miss", label: "zablokowany (deny)" },
};

const DOT = { brand: "bg-brand-400", hit: "bg-hit", focus: "bg-focus", miss: "bg-miss", neutral: "bg-fg-subtle" } as const;

function layout(nodes: Node[]) {
  const dirs = nodes.filter((n) => n.dir).map((n) => n.path);
  const depth = new Map<string, number>();
  return nodes.map((n) => {
    const parent = dirs.filter((d) => d !== n.path && n.path.startsWith(d + "/")).sort((a, b) => b.length - a.length)[0];
    const d = parent ? (depth.get(parent) ?? 0) + 1 : 0;
    if (n.dir) depth.set(n.path, d);
    return { ...n, depth: d, label: parent ? n.path.slice(parent.length + 1) : n.path };
  });
}

type Row = ReturnType<typeof layout>[number];

function Tree({ rows, sel, onSel, title }: { rows: Row[]; sel: string; onSel: (p: string) => void; title: string }) {
  return (
    <Panel className="p-3">
      <p className="px-2 pb-2 font-mono text-xs text-fg-subtle">{title}</p>
      <ul className="font-mono text-[0.8rem]" role="listbox" aria-label={title}>
        {rows.map((r) => (
          <li key={r.path} style={{ paddingLeft: `${r.depth * 0.9}rem` }}>
            {r.dir ? (
              <span className="flex items-center gap-2 px-2 py-0.5 text-fg-subtle">
                {r.depth === 0 ? <FolderOpen className="size-3.5 shrink-0" /> : <Folder className="size-3.5 shrink-0" />}
                <span className="truncate">{r.label}/</span>
              </span>
            ) : (
              <button
                type="button"
                role="option"
                aria-selected={sel === r.path}
                onClick={() => onSel(r.path)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-0.5 text-left transition-colors",
                  sel === r.path ? "bg-brand-500/15 text-fg" : "text-fg-muted hover:bg-[var(--panel-hi)]",
                )}
              >
                <FileText className="size-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{r.label}</span>
                {r.when && <i className={cn("size-2 shrink-0 rounded-full", DOT[WHEN[r.when].tone])} />}
              </button>
            )}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/**
 * Organizm: dwa drzewa obok siebie, katalog domowy (~/.claude) i projekt, oba z pełną strukturą folderów.
 * Kliknięcie pliku pokazuje jego treść i moment wczytania. Na szerokim ekranie podgląd ma wysokość drzew
 * (dłuższa treść przewija się w środku), na węższym stoi pod nimi z rezerwą na najdłuższy opis.
 */
export function ClaudeTreeViz({ nodes }: { nodes: Node[] }) {
  const rows = layout(nodes);
  const home = rows.filter((r) => r.path === "~" || r.path.startsWith("~/.claude"));
  const project = rows.filter((r) => r.path.startsWith("~/projekty")).map((r) => ({ ...r, depth: r.depth - 1 }));
  const [sel, setSel] = useState(rows.find((r) => r.path.endsWith("zadania/.claude/CLAUDE.md"))!.path);
  const cur = rows.find((r) => r.path === sel)!;
  const files = rows.filter((r) => !r.dir);
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)]">
      <Tree rows={home} sel={sel} onSel={setSel} title="katalog domowy: wszystkie projekty" />
      <Tree rows={project} sel={sel} onSel={setSel} title="projekt: w git, wspólny dla zespołu" />
      <Panel className="flex min-h-0 flex-col overflow-hidden md:col-span-2 xl:col-span-1">
        <div className="border-b border-[var(--line)] px-4 py-3">
          <StableHeight
            mode="hug"
            variants={files.map((f) => (
              <div key={f.path} className="space-y-2">
                <p className="font-mono text-sm break-all">{f.path}</p>
                <Badge tone="neutral">x</Badge>
                <p className="text-sm text-fg-muted">{f.desc}</p>
              </div>
            ))}
          >
            <div className="space-y-2">
              <p className="font-mono text-sm break-all">{cur.path}</p>
              {cur.when && <Badge tone={WHEN[cur.when].tone}>{WHEN[cur.when].label}</Badge>}
              <p className="text-sm text-fg-muted">{cur.desc}</p>
            </div>
          </StableHeight>
        </div>
        <div className="relative h-[18lh] min-h-0 xl:h-auto xl:flex-1">
          <pre className="absolute inset-0 m-0 overflow-auto p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap text-fg-muted [scrollbar-gutter:stable]">{cur.preview}</pre>
        </div>
      </Panel>
    </div>
  );
}
