import { cn } from "@/lib/cn";

/** Atom: mały nadtytuł nad nagłówkiem sekcji ("01 · Tokeny"). */
export function Eyebrow({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn("font-mono text-xs uppercase tracking-[0.22em] text-brand-400", className)}>{children}</p>;
}
