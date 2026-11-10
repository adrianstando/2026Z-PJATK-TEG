import { cn } from "@/lib/cn";

/**
 * Molekuła: rezerwuje wysokość najdłuższego wariantu treści przy bieżącej szerokości ekranu,
 * więc zmiana kroku, zakładki albo zaznaczenia nie przesuwa strony. Warianty renderują się
 * niewidocznie w tej samej komórce siatki co widoczna treść; nie ma wpisanych na sztywno wysokości.
 *
 * mode:
 * - "fill" (domyślnie): widoczna treść wypełnia zarezerwowaną wysokość (warianty różnią się niewiele),
 * - "hug": widoczna treść ma swoją wysokość, pod nią zostaje wolne miejsce (np. karta krótsza od sąsiedniego widoku),
 * - "overlay": widoczna treść nie powiększa rezerwy; dłuższa (np. zaznaczony węzeł) przewija się w środku.
 * as="span": do etykiet w tekście (np. `label` w StepControls), bez blokowych elementów w <p>.
 */
export function StableHeight({
  variants,
  children,
  mode = "fill",
  as = "div",
  className,
}: {
  variants: React.ReactNode[];
  children: React.ReactNode;
  mode?: "fill" | "hug" | "overlay";
  as?: "div" | "span";
  className?: string;
}) {
  const Tag = as;
  return (
    <Tag className={cn(as === "span" ? "inline-grid align-top" : "grid", mode === "overlay" && "relative", "[&>*]:col-start-1 [&>*]:row-start-1", className)}>
      {variants.map((v, i) => (
        <Tag key={i} aria-hidden inert className="invisible block">
          {v}
        </Tag>
      ))}
      <Tag
        className={cn(
          "block min-w-0",
          mode === "hug" && "self-start",
          mode === "fill" && "grid",
          mode === "overlay" && "absolute inset-0 overflow-y-auto [scrollbar-gutter:stable]",
        )}
      >
        {children}
      </Tag>
    </Tag>
  );
}
