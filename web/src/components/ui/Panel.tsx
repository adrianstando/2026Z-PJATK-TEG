import { cn } from "@/lib/cn";

/** Atom: szklany panel — podstawa kart, okien kodu i wizualizacji. */
export function Panel({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)] backdrop-blur-sm", className)} {...rest}>
      {children}
    </div>
  );
}
