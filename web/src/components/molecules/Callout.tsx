import { Lightbulb, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

/** Molekuła: jedna myśl do zapamiętania ("insight") albo pułapka ("warning"). */
export function Callout({ kind = "insight", children, className }: { kind?: "insight" | "warning"; children: React.ReactNode; className?: string }) {
  const Icon = kind === "insight" ? Lightbulb : TriangleAlert;
  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border-l-2 px-5 py-4 text-[0.95rem] leading-relaxed",
        kind === "insight" ? "border-focus bg-focus/[0.06] text-fg" : "border-miss bg-miss/[0.06] text-fg",
        className,
      )}
    >
      <Icon className={cn("mt-0.5 size-4.5 shrink-0", kind === "insight" ? "text-focus" : "text-miss")} />
      <div>{children}</div>
    </div>
  );
}
