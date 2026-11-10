"use client";

import { useCallback, useEffect, useState } from "react";
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Kbd } from "@/components/ui/Kbd";
import { cn } from "@/lib/cn";
import { StableHeight } from "@/components/molecules/StableHeight";

export type Phase = { from: number; to: number; title: string; output: string };

const pad = (n: number) => String(n).padStart(2, "0");
const mmss = (s: number) => `${pad(Math.floor(s / 60))}:${pad(Math.floor(s % 60))}`;

/**
 * Organizm: oś czasu 90 min skillathonu z licznikiem, do wyświetlenia na projektorze
 * w trakcie zajęć. Pasek pokazuje, która faza trwa i ile z niej zostało.
 * Klawisze: S start/pauza, N następna faza, P poprzednia, R reset
 * (strzałki i PageUp/PageDown zostają dla PresenterKeys).
 */
export function SkillathonTimer({ phases }: { phases: Phase[] }) {
  const total = phases[phases.length - 1].to * 60;
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      setElapsed((e) => {
        const next = Math.min(total, e + dt);
        if (next >= total) setRunning(false);
        return next;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [running, total]);

  const idx = Math.max(0, phases.findIndex((p) => elapsed < p.to * 60));
  const current = elapsed >= total ? phases.length - 1 : idx;
  const phase = phases[current];
  const left = Math.max(0, phase.to * 60 - elapsed);
  const phaseLen = (phase.to - phase.from) * 60;
  const phaseDone = 1 - left / phaseLen;

  const jump = useCallback(
    (d: number) => {
      const target = Math.max(0, Math.min(phases.length - 1, current + d));
      setElapsed(phases[target].from * 60);
    },
    [current, phases],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]")) return;
      const k = e.key.toLowerCase();
      if (k === "s") setRunning((r) => !r);
      else if (k === "n") jump(1);
      else if (k === "p") jump(-1);
      else if (k === "r") {
        setRunning(false);
        setElapsed(0);
      } else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  const warn = left <= 120 && running;

  return (
    <Panel className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <StableHeight className="min-w-0 flex-1 basis-80" variants={phases.map((p, i) => <PhaseHead key={p.from} phase={p} i={i} n={phases.length} />)}>
          <PhaseHead phase={phase} i={current} n={phases.length} />
        </StableHeight>
        <div className="text-right">
          <p className={cn("font-mono text-6xl font-semibold tabular-nums transition-colors sm:text-7xl", warn ? "text-focus" : "text-fg")} aria-live="off">
            {mmss(left)}
          </p>
          <p className="mt-1 font-mono text-xs text-fg-subtle tabular-nums">
            do końca fazy · minęło {mmss(elapsed)} z {mmss(total)}
          </p>
        </div>
      </div>

      {/* Pasek 90 min: segment na fazę, szerokość proporcjonalna do czasu. */}
      <div className="relative mt-8">
        <div className="flex h-12 gap-1">
          {phases.map((p, i) => {
            const w = ((p.to - p.from) / phases[phases.length - 1].to) * 100;
            const fill = i < current ? 1 : i === current ? phaseDone : 0;
            return (
              <button
                key={p.from}
                type="button"
                onClick={() => setElapsed(p.from * 60)}
                aria-label={`Przejdź do fazy ${i + 1}: ${p.title}`}
                className={cn(
                  "relative overflow-hidden rounded-md border text-left transition-colors",
                  i === current ? "border-brand-400" : "border-[var(--line)] hover:border-[var(--line-strong)]",
                )}
                style={{ flex: `${w} 1 0%` }}
              >
                <span
                  className={cn("absolute inset-y-0 left-0 transition-[width] duration-300 ease-linear", i === current ? "bg-brand-500/45" : "bg-brand-500/20")}
                  style={{ width: `${fill * 100}%` }}
                />
                <span className="relative hidden px-2 font-mono text-xs text-fg-muted md:inline">{p.from}</span>
              </button>
            );
          })}
        </div>
      </div>

      <ol className="mt-6 grid gap-2 lg:grid-cols-5">
        {phases.map((p, i) => (
          <li
            key={p.from}
            className={cn(
              "rounded-xl border px-4 py-3 transition-colors",
              i === current ? "border-brand-400 bg-[var(--panel-hi)]" : "border-[var(--line)]",
              i < current && "opacity-55",
            )}
          >
            <span className="font-mono text-xs tabular-nums text-brand-300">
              {pad(p.from)}–{pad(p.to)}
            </span>
            <span className="ml-3 text-sm">{p.title}</span>
          </li>
        ))}
      </ol>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--line)] pt-5">
        <div className="flex flex-wrap gap-2">
          <CtrlButton onClick={() => setRunning((r) => !r)} label={running ? "Pauza" : "Start"} primary>
            {running ? <Pause className="size-4" /> : <Play className="size-4" />}
          </CtrlButton>
          <CtrlButton onClick={() => jump(-1)} label="Poprzednia faza">
            <SkipBack className="size-4" />
          </CtrlButton>
          <CtrlButton onClick={() => jump(1)} label="Następna faza">
            <SkipForward className="size-4" />
          </CtrlButton>
          <CtrlButton
            onClick={() => {
              setRunning(false);
              setElapsed(0);
            }}
            label="Reset"
          >
            <RotateCcw className="size-4" />
          </CtrlButton>
        </div>
        <p className="hidden items-center gap-2 text-xs text-fg-subtle sm:flex">
          <Kbd>S</Kbd> start/pauza <Kbd>N</Kbd> następna <Kbd>P</Kbd> poprzednia <Kbd>R</Kbd> reset <Kbd>F</Kbd> pełny ekran
        </p>
      </div>
    </Panel>
  );
}

function PhaseHead({ phase, i, n }: { phase: Phase; i: number; n: number }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.22em] text-brand-400">
        Faza {i + 1} z {n} · {phase.from}–{phase.to} min
      </p>
      <p className="mt-2 text-2xl font-semibold leading-tight sm:text-4xl">{phase.title}</p>
      <p className="mt-2 text-fg-muted">{phase.output}</p>
    </div>
  );
}

function CtrlButton({ onClick, label, primary, children }: { onClick: () => void; label: string; primary?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-400",
        primary ? "bg-primary text-on-primary hover:brightness-110" : "border border-[var(--line-strong)] text-fg hover:bg-[var(--panel-hi)]",
      )}
    >
      {children}
      {primary && label}
    </button>
  );
}
