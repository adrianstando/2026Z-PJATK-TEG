"use client";

import { motion } from "motion/react";
import { Terminal as TerminalIcon } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";

/**
 * Molekuła: wynik uruchomienia komórki. Linie "dopisują się" po wjechaniu
 * w kadr — jak w prawdziwym terminalu, tylko szybciej.
 * Treść to PRAWDZIWY output z notebooka, nie wymyślony.
 */
export function Terminal({
  output,
  title = "output",
  className,
  wrap = true,
}: {
  output: string;
  title?: string;
  className?: string;
  /** false dla tabel: przewijanie w poziomie zamiast łamania kolumn na wąskim ekranie */
  wrap?: boolean;
}) {
  const lines = output.trim().split("\n");
  return (
    <Panel className={cn("overflow-hidden bg-ink-950/60", className)}>
      <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-2.5">
        <TerminalIcon className="size-3.5 text-hit" />
        <span className="font-mono text-xs text-fg-subtle">{title}</span>
      </div>
      <motion.pre
        className="max-h-[30rem] overflow-auto px-5 py-4 font-mono text-[0.82rem] leading-relaxed text-fg-muted"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px" }}
        variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.3 } } }}
      >
        {lines.map((l, i) => (
          <motion.span
            key={i}
            className={wrap ? "block whitespace-pre-wrap" : "block whitespace-pre"}
            variants={{ hidden: { opacity: 0, x: -6 }, show: { opacity: 1, x: 0 } }}
          >
            {l || " "}
          </motion.span>
        ))}
      </motion.pre>
    </Panel>
  );
}
