"use client";

import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { Slider } from "radix-ui";
import type { Stepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";
import { StableHeight } from "./StableHeight";

const btn =
  "inline-flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] px-3 py-1.5 text-xs text-fg-muted transition-colors hover:text-fg disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-brand-400";

/**
 * Molekuła: sterowanie animacją krok po kroku (wspólna dla wszystkich lekcji).
 * `label`: opis bieżącego kroku; `slider`: suwak zamiast kropek (długie procesy).
 * `labels`: opisy wszystkich kroków; opis ma wtedy wysokość najdłuższego z nich (StableHeight), więc kroki nie przesuwają strony.
 * Przyciski mają własne zdarzenia; strzałki klawiatury nadal przełączają slajdy.
 */
export function StepControls({
  stepper,
  label,
  labels,
  slider,
  className,
}: {
  stepper: Stepper;
  label?: React.ReactNode;
  labels?: React.ReactNode[];
  slider?: boolean;
  className?: string;
}) {
  const { step, total, playing, prev, next, go, toggle, reset } = stepper;
  const atEnd = step >= total - 1;
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-2", className)}>
      <div className="flex items-center gap-1.5">
        <button type="button" className={btn} onClick={prev} disabled={step === 0} aria-label="Poprzedni krok">
          <ChevronLeft className="size-3.5" />
        </button>
        <button type="button" className={btn} onClick={atEnd ? reset : toggle} aria-label={atEnd ? "Od nowa" : playing ? "Pauza" : "Odtwarzaj"}>
          {atEnd ? <RotateCcw className="size-3.5" /> : playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
        </button>
        <button type="button" className={btn} onClick={next} disabled={atEnd} aria-label="Następny krok">
          <ChevronRight className="size-3.5" />
        </button>
      </div>
      {slider ? (
        <Slider.Root className="relative flex h-5 min-w-28 flex-1 touch-none items-center select-none" min={0} max={total - 1} step={1} value={[step]} onValueChange={([x]) => go(x)}>
          <Slider.Track className="relative h-1.5 grow rounded-full bg-[var(--panel-hi)]">
            <Slider.Range className="absolute h-full rounded-full bg-brand-500" />
          </Slider.Track>
          <Slider.Thumb aria-label="Krok" className="block size-4 rounded-full border-2 border-focus bg-ink-950 outline-none focus-visible:ring-4 focus-visible:ring-focus/30" />
        </Slider.Root>
      ) : (
        <div className="flex items-center gap-1" role="group" aria-label="Kroki">
          {Array.from({ length: total }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Krok ${i + 1}`}
              aria-current={i === step ? "step" : undefined}
              className={cn("size-2 rounded-full transition-colors", i === step ? "bg-focus" : i < step ? "bg-brand-400" : "bg-[var(--line-strong)]")}
            />
          ))}
        </div>
      )}
      {labels ? (
        <div className="flex min-w-[min(100%,14rem)] flex-1 gap-[1ch] font-mono text-xs text-fg-muted" aria-live="polite">
          <span className="shrink-0 text-focus tabular-nums">
            {step + 1}/{total}
          </span>
          <StableHeight variants={labels.map((l, i) => <span key={i}>{l}</span>)} mode="hug" className="flex-1">
            <span>{label}</span>
          </StableHeight>
        </div>
      ) : (
        <p className="min-w-[min(100%,14rem)] flex-1 font-mono text-xs text-fg-muted" aria-live="polite">
        <span className="text-focus tabular-nums">
          {step + 1}/{total}
        </span>
        {label != null && <> {label}</>}
        </p>
      )}
    </div>
  );
}
