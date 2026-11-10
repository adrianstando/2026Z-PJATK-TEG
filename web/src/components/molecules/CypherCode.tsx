import { Fragment } from "react";
import { cn } from "@/lib/cn";

const KW = /\b(MATCH|OPTIONAL|WHERE|RETURN|WITH|ORDER BY|ORDER|BY|DESC|ASC|LIMIT|CREATE|MERGE|SET|DETACH|DELETE|UNWIND|AS|AND|OR|NOT|IN|DISTINCT|FOREACH|IS|NULL|CALL|YIELD)\b/g;
const TOKEN = /('[^']*'|\$\w+|:\w+|\b\d+(?:\.\d+)?\b|\b(?:MATCH|OPTIONAL|WHERE|RETURN|WITH|ORDER|BY|DESC|ASC|LIMIT|CREATE|MERGE|SET|DETACH|DELETE|UNWIND|AS|AND|OR|NOT|IN|DISTINCT|FOREACH|IS|NULL|CALL|YIELD)\b|\b(?:count|avg|sum|collect|coalesce|size|type|nodes|labels|round|date)(?=\())/g;

function tokens(text: string) {
  const out: { t: string; cls?: string }[] = [];
  let at = 0;
  for (const m of text.matchAll(TOKEN)) {
    if (m.index! > at) out.push({ t: text.slice(at, m.index) });
    const t = m[0];
    const cls = t.startsWith("'")
      ? "text-hit"
      : t.startsWith("$")
        ? "text-cat-4"
        : t.startsWith(":")
          ? "text-cat-2"
          : /^\d/.test(t)
            ? "text-cat-3"
            : KW.test(t)
              ? "text-brand-300 font-semibold"
              : "text-cat-1";
    KW.lastIndex = 0;
    out.push({ t, cls });
    at = m.index! + t.length;
  }
  if (at < text.length) out.push({ t: text.slice(at) });
  return out;
}

/**
 * Molekuła: zapytanie Cypher z kolorowaniem składni, renderowane w przeglądarce (CodeBlock działa tylko na serwerze).
 * `mark`: fragment (lub kilka) podświetlony w bieżącym kroku animacji; `lines`: podświetlone całe linie.
 * Reszta tekstu przygasa, gdy coś jest podświetlone.
 */
export function CypherCode({ code, mark, lines = [], wrap = false, className }: { code: string; mark?: string | string[]; lines?: number[]; wrap?: boolean; className?: string }) {
  const marks = (Array.isArray(mark) ? mark : mark ? [mark] : []).filter(Boolean);
  const dim = marks.length > 0 || lines.length > 0;
  // podział tekstu na fragmenty podświetlone i zwykłe (pierwsze wystąpienie każdego fragmentu)
  const ranges = marks
    .map((m) => [code.indexOf(m), code.indexOf(m) + m.length] as const)
    .filter(([a]) => a >= 0)
    .sort((x, y) => x[0] - y[0]);
  const lineStarts: number[] = [0];
  for (let i = 0; i < code.length; i++) if (code[i] === "\n") lineStarts.push(i + 1);
  const lineOf = (pos: number) => lineStarts.filter((s) => s <= pos).length - 1;
  const parts: { s: string; on: boolean; line: number }[] = [];
  let at = 0;
  for (const [a, b] of ranges) {
    if (a < at) continue;
    if (a > at) parts.push({ s: code.slice(at, a), on: false, line: lineOf(at) });
    parts.push({ s: code.slice(a, b), on: true, line: lineOf(a) });
    at = b;
  }
  if (at < code.length) parts.push({ s: code.slice(at), on: false, line: lineOf(at) });
  // fragmenty dzielone dalej na linie, żeby `lines` działało także w środku fragmentu
  const pieces = parts.flatMap((p) =>
    p.s.split("\n").map((s, i, arr) => ({ s, on: p.on || lines.includes(p.line + i), nl: i < arr.length - 1 })),
  );
  return (
    <pre className={cn(wrap ? "whitespace-pre-wrap break-words" : "overflow-x-auto", "rounded-lg bg-ink-950/60 p-3 font-mono text-[0.78rem] leading-relaxed sm:text-[0.85rem]", className)}>
      <code>
        {pieces.map((p, i) => (
          <Fragment key={i}>
            <span className={cn("rounded transition-[opacity,background-color] duration-300", p.on && "bg-focus/20 outline outline-1 outline-focus/50", dim && !p.on && "opacity-45")}>
              {tokens(p.s).map((t, k) => (
                <span key={k} className={t.cls ?? "text-fg"}>
                  {t.t}
                </span>
              ))}
            </span>
            {p.nl && "\n"}
          </Fragment>
        ))}
      </code>
    </pre>
  );
}
