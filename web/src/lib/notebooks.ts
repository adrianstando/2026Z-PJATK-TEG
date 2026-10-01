import fs from "node:fs";
import path from "node:path";
import { LESSONS } from "@/content/course";

// Czytanie .ipynb z repo w czasie builda (strona jest statyczna).

export type Output =
  | { kind: "text"; text: string }
  | { kind: "image"; mime: string; data: string }
  | { kind: "error"; text: string };

export type Cell =
  | { type: "markdown"; source: string }
  | { type: "code"; source: string; n: number; outputs: Output[]; tags: string[] };

export type Section = { id: string; cells: Cell[] };

export type NotebookEntry = { slug: string; folder: string; file: string; lessonN: number; lessonSlug: string; kind: "lekcja" | "zadanie" };

const ROOT = path.join(process.cwd(), "..");
const join = (x: unknown) => (Array.isArray(x) ? x.join("") : typeof x === "string" ? x : "");
const stripAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");

/** Wszystkie notebooki, które mają swoją stronę: notebook.ipynb i zadanie.ipynb z folderów zajęć. */
export function listNotebooks(): NotebookEntry[] {
  return LESSONS.flatMap((l) =>
    (["notebook.ipynb", "zadanie.ipynb"] as const)
      .filter((f) => fs.existsSync(path.join(ROOT, l.folder, f)))
      .map((f) => ({
        slug: f === "notebook.ipynb" ? l.slug : `${l.slug}-zadanie`,
        folder: l.folder,
        file: f,
        lessonN: l.n,
        lessonSlug: l.slug,
        kind: f === "notebook.ipynb" ? ("lekcja" as const) : ("zadanie" as const),
      })),
  );
}

export function readNotebook(entry: NotebookEntry): { title: string; sections: Section[] } {
  const nb = JSON.parse(fs.readFileSync(path.join(ROOT, entry.folder, entry.file), "utf8"));
  let n = 0;
  const cells: Cell[] = nb.cells.map((c: Record<string, unknown>): Cell => {
    if (c.cell_type === "markdown") return { type: "markdown", source: join(c.source) };
    n += 1;
    const outputs: Output[] = ((c.outputs as Record<string, unknown>[]) ?? []).flatMap((o): Output[] => {
      const data = (o.data ?? {}) as Record<string, unknown>;
      if (o.output_type === "stream") return [{ kind: "text", text: stripAnsi(join(o.text)) }];
      if (o.output_type === "error") return [{ kind: "error", text: `${o.ename}: ${o.evalue}` }];
      for (const mime of ["image/png", "image/jpeg"]) if (data[mime]) return [{ kind: "image", mime, data: join(data[mime]).replace(/\n/g, "") }];
      const text = join(data["text/plain"]);
      // "[]" i "<Figure size ...>" to śmieci z matplotliba, nie wynik
      if (text && !/^(\[\]|<Figure size .*>)$/.test(text.trim())) return [{ kind: "text", text }];
      return [];
    });
    // kolejne strumienie stdout sklejamy w jeden blok
    const merged = outputs.reduce<Output[]>((acc, o) => {
      const last = acc[acc.length - 1];
      if (o.kind === "text" && last?.kind === "text") last.text += o.text;
      else acc.push({ ...o });
      return acc;
    }, []);
    const tags = (((c.metadata as Record<string, unknown>)?.tags as string[]) ?? []);
    return { type: "code", source: join(c.source), n, outputs: merged, tags };
  });

  const title = (cells.find((c) => c.type === "markdown")?.source.match(/^#\s+(.+)$/m)?.[1] ?? entry.file).trim();
  // Nowa sekcja przy każdym nagłówku # albo ## w markdownie.
  const sections: Section[] = [];
  for (const cell of cells) {
    const heading = cell.type === "markdown" ? cell.source.match(/^#{1,2}\s+(.+)$/m) : null;
    if (heading || !sections.length) sections.push({ id: `s${sections.length}`, cells: [] });
    sections[sections.length - 1].cells.push(cell);
  }
  return { title, sections };
}
