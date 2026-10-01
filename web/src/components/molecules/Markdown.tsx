import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "@/components/molecules/CodeBlock";
import { REPO_BLOB } from "@/lib/paths";

/**
 * Molekuła: markdown z repo (README) w stylu design systemu. Dzięki temu strona
 * i GitHub pokazują TEN SAM plik — jedno źródło prawdy, zero kopiowania.
 * `baseDir` — folder pliku w repo, żeby względne linki prowadziły na GitHuba.
 * `slides` — nagłówki h2 dostają `data-slide` (nawigacja strzałkami ← →).
 */
export function Markdown({ source, baseDir, slides = false }: { source: string; baseDir: string; slides?: boolean }) {
  const resolve = (href = "") => {
    if (/^(https?:|mailto:|#)/.test(href)) return href;
    const parts = `${baseDir}/${href}`.split("/");
    const out: string[] = [];
    for (const p of parts) p === ".." ? out.pop() : p && p !== "." && out.push(p);
    return `${REPO_BLOB}/${out.join("/")}`;
  };

  const components: Components = {
    h1: () => null, // tytuł strony renderuje hero
    h2: ({ children, id }) => (
      <h2 id={id} data-slide={slides ? "" : undefined} className="mt-20 scroll-mt-24 border-t border-[var(--line)] pt-10 text-3xl font-semibold tracking-tight md:text-4xl">
        {children}
      </h2>
    ),
    h3: ({ children }) => <h3 className="mt-10 text-xl font-semibold">{children}</h3>,
    p: ({ children }) => <p className="mt-4 leading-relaxed text-fg-muted">{children}</p>,
    a: ({ href, children }) => (
      <a href={resolve(href)} className="text-brand-300 underline decoration-brand-500/40 underline-offset-4 hover:decoration-brand-300">
        {children}
      </a>
    ),
    ul: ({ children }) => <ul className="mt-4 list-disc space-y-1.5 pl-6 text-fg-muted marker:text-brand-400">{children}</ul>,
    ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-fg-muted marker:font-mono marker:text-brand-400">{children}</ol>,
    strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
    blockquote: ({ children }) => (
      <blockquote className="mt-6 rounded-xl border-l-2 border-focus bg-focus/[0.06] px-5 py-1 [&_p]:text-fg">{children}</blockquote>
    ),
    hr: () => <hr className="my-12 border-[var(--line)]" />,
    table: ({ children }) => (
      <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)]">
        <table className="w-full text-left text-sm">{children}</table>
      </div>
    ),
    th: ({ children }) => <th className="border-b border-[var(--line)] px-4 py-3 font-medium text-fg">{children}</th>,
    td: ({ children }) => <td className="border-b border-[var(--line)] px-4 py-3 align-top text-fg-muted">{children}</td>,
    img: ({ src, alt }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={typeof src === "string" ? src : undefined} alt={alt ?? ""} className="inline h-5 align-middle" />
    ),
    code: ({ children, className }) => {
      const lang = /language-(\w+)/.exec(className ?? "")?.[1];
      const text = String(children);
      if (lang || text.includes("\n")) return <CodeBlock code={text} lang={lang ?? "text"} title={lang ?? "terminal"} className="mt-4" />;
      return <code className="rounded-md bg-[var(--panel-hi)] px-1.5 py-0.5 font-mono text-[0.85em] text-brand-300">{children}</code>;
    },
    pre: ({ children }) => <>{children}</>,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {source}
    </ReactMarkdown>
  );
}
