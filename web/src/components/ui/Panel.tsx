import { cn } from "@/lib/cn";

/** Atom: panel — podstawa kart, okien kodu i wizualizacji. Bez backdrop-filter: tło jest statyczne, a filtr na kilkudziesięciu panelach obciążał telefony. */
export function Panel({ className, children, ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--panel)]", className)} {...rest}>
      {children}
    </div>
  );
}
