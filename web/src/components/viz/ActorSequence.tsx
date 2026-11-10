"use client";

import { useState } from "react";
import { ToggleGroup } from "radix-ui";
import { motion } from "motion/react";
import { Panel } from "@/components/ui/Panel";
import { StableHeight } from "@/components/molecules/StableHeight";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";

export type Actor = { id: string; label: string; sub?: string };
export type SeqStep = { from: string; to: string; label: string; detail?: string; tone?: "hit" | "miss" | "focus" };

const TONE = { hit: "var(--color-hit)", miss: "var(--color-miss)", focus: "var(--color-focus)" };

function Detail({ s }: { s?: SeqStep }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-ink-950/50 px-4 py-3">
      <p className="font-mono text-xs uppercase tracking-wider" style={{ color: s?.tone ? TONE[s.tone] : "var(--color-brand-300)" }}>
        {s ? s.label : "start"}
      </p>
      <p className="mt-1 whitespace-pre-line break-words font-mono text-[0.72rem] leading-relaxed text-fg-muted sm:text-[0.8rem]">{s ? s.detail ?? " " : "Play: kolejne komunikaty krok po kroku."}</p>
    </div>
  );
}

/**
 * Organizm (szkielet wizualizacji przepływów): uczestnicy jako kolumny, kolejne kroki jako strzałki
 * między nimi, odsłaniane krok po kroku. Pod diagramem szczegół bieżącego kroku (dane z notebooka);
 * ma wysokość najdłuższego szczegółu (StableHeight), więc kroki nie przesuwają strony. Start przyciskiem Play.
 */
export function ActorSequence({ actors, steps, caption, ms = 1900 }: { actors: Actor[]; steps: SeqStep[]; caption: string; ms?: number }) {
  // krok 0 = nic jeszcze nie wysłano
  const st = useStepper(steps.length + 1, { interval: ms });
  const shown = st.step - 1;
  const col = (id: string) => Math.max(0, actors.findIndex((a) => a.id === id));
  const x = (i: number) => ((i + 0.5) / actors.length) * 100;
  const cur = shown >= 0 ? steps[shown] : undefined;

  return (
    <div ref={st.ref} className="flex h-full flex-col">
      <Panel className="flex flex-1 flex-col p-4 md:p-6">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${actors.length}, minmax(0, 1fr))` }}>
          {actors.map((a) => {
            const on = cur && (cur.from === a.id || cur.to === a.id);
            return (
              <div key={a.id} className={cn("rounded-xl border px-1.5 py-2 text-center transition-colors", on ? "border-focus bg-focus/[0.08]" : "border-[var(--line-strong)] bg-[var(--panel)]")}>
                <p className={cn("font-mono text-[0.72rem] leading-tight sm:text-sm", on ? "text-focus" : "text-fg")}>{a.label}</p>
                {a.sub && <p className="mt-0.5 hidden text-[0.7rem] leading-tight text-fg-subtle sm:block">{a.sub}</p>}
              </div>
            );
          })}
        </div>
        <ol className="relative mt-3">
          {actors.map((a, i) => (
            <span key={a.id} aria-hidden className="absolute inset-y-0 w-px bg-[var(--line)]" style={{ left: `${x(i)}%` }} />
          ))}
          {steps.map((s, i) => {
            const a = x(col(s.from));
            const b = x(col(s.to));
            const self = s.from === s.to;
            const left = Math.min(a, b);
            const width = Math.abs(b - a);
            const visible = i <= shown;
            const active = i === shown;
            const color = active ? TONE.focus : s.tone ? TONE[s.tone] : "var(--color-brand-400)";
            return (
              <li key={i} className="relative h-12 sm:h-11" style={{ opacity: visible ? 1 : 0.12, transition: "opacity 300ms" }}>
                <p
                  className={cn("absolute top-0.5 whitespace-nowrap font-mono text-[0.66rem] sm:text-xs", active ? "text-focus" : "text-fg-muted")}
                  style={{ left: `${Math.min(80, Math.max(20, self ? a : left + width / 2))}%`, transform: "translateX(-50%)" }}
                >
                  {s.label}
                </p>
                {self ? (
                  <span className="absolute top-6 size-3 -translate-x-1/2 rounded-full" style={{ left: `${a}%`, background: color }} />
                ) : (
                  <motion.span
                    className="absolute top-7 h-0.5 rounded"
                    style={{ left: `${left}%`, width: `${width}%`, background: color, originX: b >= a ? 0 : 1 }}
                    initial={false}
                    animate={{ scaleX: visible ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span
                      className="absolute -top-[5px] size-0 border-y-[6px] border-y-transparent"
                      style={b >= a ? { right: -2, borderLeft: `9px solid ${color}` } : { left: -2, borderRight: `9px solid ${color}` }}
                    />
                  </motion.span>
                )}
              </li>
            );
          })}
        </ol>
        <StableHeight variants={[undefined, ...steps].map((s, i) => <Detail key={i} s={s} />)} mode="hug" className="mt-4">
          <Detail s={cur} />
        </StableHeight>
        <div className="mt-auto pt-4">
          <StepControls stepper={st} label={cur ? cur.label : "start"} labels={["start", ...steps.map((s) => s.label)]} />
        </div>
      </Panel>
      <p className="mt-2 font-mono text-[0.7rem] text-fg-subtle">{caption}</p>
    </div>
  );
}

export type SeqMode = { id: string; label: string; actors: Actor[]; steps: SeqStep[]; caption: string };

/**
 * Organizm: kilka wariantów tego samego przepływu. Wszystkie warianty są w jednej komórce siatki
 * (nieaktywne niewidoczne) i mają wysokość najdłuższego, więc przełączanie nie zmienia ani slajdu,
 * ani karty; przyciski kroków zostają na dole karty.
 * Bez `value` ma własny przełącznik (Radix ToggleGroup); z `value` wariant wybiera rodzic.
 */
export function ModeSequence({ modes, initial, label, value }: { modes: SeqMode[]; initial?: string; label: string; value?: string }) {
  const [own, setOwn] = useState(initial ?? modes[0].id);
  const id = value ?? own;
  return (
    <div>
      {value === undefined && (
        <ToggleGroup.Root
          type="single"
          value={id}
          onValueChange={(v) => v && setOwn(v)}
          className="mb-4 inline-flex flex-wrap gap-1.5 rounded-xl border border-[var(--line)] p-1"
          aria-label={label}
        >
          {modes.map((x) => (
            <ToggleGroup.Item key={x.id} value={x.id} className="rounded-lg px-3 py-1.5 text-sm text-fg-muted transition-colors data-[state=on]:bg-brand-500 data-[state=on]:text-white">
              {x.label}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup.Root>
      )}
      <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
        {modes.map((m) => (
          <div key={m.id} className={cn(m.id !== id && "invisible")} inert={m.id !== id} aria-hidden={m.id !== id}>
            <ActorSequence actors={m.actors} steps={m.steps} caption={m.caption} />
          </div>
        ))}
      </div>
    </div>
  );
}
