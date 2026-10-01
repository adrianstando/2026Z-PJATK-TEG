import { codeToHtml } from "shiki";
import { FileCode2 } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";

/**
 * Molekuła: kod z podświetleniem składni. Komponent serwerowy — shiki działa
 * w czasie builda, więc w przeglądarce nie ma ani grama JS do kolorowania.
 * `highlight` — numery linii (od 1), które prowadzący chce wskazać.
 */
export async function CodeBlock({
  code,
  lang = "python",
  title,
  highlight = [],
  className,
}: {
  code: string;
  lang?: string;
  title?: string;
  highlight?: number[];
  className?: string;
}) {
  const html = await codeToHtml(code.trim(), {
    lang,
    theme: "tokyo-night",
    transformers: [
      {
        line(node, line) {
          if (highlight.includes(line)) this.addClassToHast(node, "hl");
        },
      },
    ],
  });
  return (
    <Panel className={cn("code-block overflow-hidden", className)}>
      <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <i className="size-2.5 rounded-full bg-miss/70" />
          <i className="size-2.5 rounded-full bg-focus/70" />
          <i className="size-2.5 rounded-full bg-hit/70" />
        </span>
        <FileCode2 className="ml-2 size-3.5 text-fg-subtle" />
        <span className="font-mono text-xs text-fg-subtle">{title ?? lang}</span>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </Panel>
  );
}
