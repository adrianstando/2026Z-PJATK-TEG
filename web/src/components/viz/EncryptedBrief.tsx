"use client";

import { useState } from "react";
import { KeyRound, LoaderCircle, Lock } from "lucide-react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";

/** Szyfrogram z prywatnego repo: PBKDF2-SHA256 → AES-256-GCM, pola w base64. */
export type Encrypted = { v: number; iter: number; salt: string; iv: string; ct: string };

const bytes = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
// Hasło to słowa rozdzielone myślnikami; spacje i wielkie litery też przechodzą.
const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, "-").normalize("NFC");

// Markdown po odszyfrowaniu, renderowany w przeglądarce. Wspólny Markdown używa serwerowego
// CodeBlock (shiki), więc tu bloki kodu są zwykłym <pre> w tym samym stylu panelu.
const MD: Components = {
  h1: () => null,
  h2: ({ children }) => <h2 className="mt-12 border-t border-[var(--line)] pt-8 text-2xl font-semibold tracking-tight first:mt-2 first:border-t-0 first:pt-0 md:text-3xl">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-8 text-xl font-semibold">{children}</h3>,
  p: ({ children }) => <p className="mt-4 leading-relaxed text-fg-muted">{children}</p>,
  a: ({ href, children }) => (
    <a href={href} className="text-brand-300 underline decoration-brand-500/40 underline-offset-4 hover:decoration-brand-300">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-1.5 pl-6 text-fg-muted marker:text-brand-400">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-2 pl-6 text-fg-muted marker:font-mono marker:text-brand-400">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-fg">{children}</strong>,
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)]">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border-b border-[var(--line)] px-4 py-3 font-medium text-fg">{children}</th>,
  td: ({ children }) => <td className="border-b border-[var(--line)] px-4 py-3 align-top text-fg-muted">{children}</td>,
  pre: ({ children }) => (
    <pre className="mt-4 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel-hi)] p-4 font-mono text-sm leading-relaxed text-fg [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-fg">
      {children}
    </pre>
  ),
  code: ({ children }) => <code className="rounded-md bg-[var(--panel-hi)] px-1.5 py-0.5 font-mono text-[0.85em] text-brand-300">{children}</code>,
};

async function decrypt(p: Encrypted, password: string): Promise<string> {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: bytes(p.salt), iterations: p.iter },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(p.iv) }, key, bytes(p.ct));
  return new TextDecoder().decode(plain);
}

/**
 * Organizm: treść zaszyfrowana w repo, odszyfrowywana w przeglądarce hasłem podanym przez prowadzącego.
 * Jawny tekst jest tylko w prywatnym repo; tu leży szyfrogram. Hasło nie jest nigdzie zapisywane:
 * po odświeżeniu strony treść znów jest ukryta.
 */
export function EncryptedBrief({ payload, id, hint }: { payload: Encrypted; id: string; hint?: string }) {
  const [text, setText] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "wrong">("idle");

  const unlock = async (password: string) => {
    setState("busy");
    try {
      setText(await decrypt(payload, normalize(password)));
      setState("idle");
    } catch {
      setState("wrong");
    }
  };

  if (text) {
    return (
      <Panel className="p-5 sm:p-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>
          {text}
        </ReactMarkdown>
      </Panel>
    );
  }

  return (
    <Panel className="p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <Lock className="size-5 text-brand-300" />
        <p className="text-lg font-medium">Treść zaszyfrowana</p>
      </div>
      {hint && <p className="mt-2 text-fg-muted">{hint}</p>}
      <form
        className="mt-6 flex flex-wrap gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (value.trim()) void unlock(value);
        }}
      >
        <label className="sr-only" htmlFor={`${id}-pw`}>
          Hasło
        </label>
        <input
          id={`${id}-pw`}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (state === "wrong") setState("idle");
          }}
          type="password"
          placeholder="••••••••"
          autoComplete="off"
          spellCheck={false}
          className={cn(
            "min-w-0 flex-1 basis-64 rounded-full border bg-[var(--panel)] px-4 py-2 font-mono text-sm text-fg outline-none placeholder:text-fg-subtle focus-visible:border-brand-400",
            state === "wrong" ? "border-miss" : "border-[var(--line-strong)]",
          )}
        />
        <button
          type="submit"
          disabled={state === "busy"}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-on-primary transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400 disabled:opacity-70"
        >
          {state === "busy" ? <LoaderCircle className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
          Odszyfruj
        </button>
      </form>
      <p className={cn("mt-3 text-sm", state === "wrong" ? "text-miss" : "invisible")} aria-live="polite">
        Nieprawidłowe hasło.
      </p>
    </Panel>
  );
}
