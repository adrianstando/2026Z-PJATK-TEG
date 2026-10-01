import { cn } from "@/lib/cn";

type Tone = "neutral" | "brand" | "hit" | "miss" | "focus";

const tones: Record<Tone, string> = {
  neutral: "border-[var(--line-strong)] text-fg-muted",
  brand: "border-brand-500/40 bg-brand-500/10 text-brand-300",
  hit: "border-hit/40 bg-hit/10 text-hit",
  miss: "border-miss/40 bg-miss/10 text-miss",
  focus: "border-focus/40 bg-focus/10 text-focus",
};

/** Atom: krótka etykieta (status zajęć, typ aktywności, liczba punktów). */
export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}
