import { cn } from "@/lib/cn";

/**
 * Organizm: jedna "plansza" prezentacji = sekcja na co najmniej cały ekran.
 * `data-slide` czyta PresenterKeys. Treść zawsze w kontenerze max-w-7xl.
 */
export function Slide({ id, className, children }: { id: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} data-slide className={cn("relative flex min-h-svh flex-col justify-center px-6 py-28", className)}>
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </section>
  );
}
