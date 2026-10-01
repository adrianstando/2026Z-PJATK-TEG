import { Slot } from "radix-ui";
import { cn } from "@/lib/cn";

type Variant = "primary" | "ghost";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary shadow-glow hover:brightness-110",
  ghost: "border border-[var(--line-strong)] text-fg hover:bg-[var(--panel-hi)]",
};

/** Atom: przycisk. `asChild` pozwala opakować <Link> albo <a> (Radix Slot). */
export function Button({
  variant = "primary",
  asChild,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
