import { Fragment } from "react";
import { cn } from "@/lib/cn";

/**
 * Molekuła: wielowierszowy JSON (albo kod) w wąskiej karcie. Zawinięta linia zachowuje wcięcie
 * i ma dodatkowe wysunięcie, więc nie wraca do lewej krawędzi. `mark`: fragment do wyróżnienia.
 */
export function JsonBlock({ text, mark, markClass, className }: { text: string; mark?: string; markClass?: string; className?: string }) {
  return (
    <code className={cn("block font-mono text-[0.7rem] leading-snug text-fg-muted", className)}>
      {text.split("\n").map((line, i) => {
        const trimmed = line.trimStart();
        const indent = line.length - trimmed.length;
        const parts = mark ? trimmed.split(mark) : [trimmed];
        return (
          <span key={i} className="block [overflow-wrap:anywhere]" style={{ paddingLeft: `${indent + 2}ch`, textIndent: "-2ch" }}>
            {parts.map((p, k) => (
              <Fragment key={k}>
                {k > 0 && <span className={markClass}>{mark}</span>}
                {p}
              </Fragment>
            ))}
            {!trimmed && " "}
          </span>
        );
      })}
    </code>
  );
}
