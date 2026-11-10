"use client";

import { useState } from "react";
import { ToggleGroup } from "radix-ui";
import { Panel } from "@/components/ui/Panel";
import { COMPARE, COMPARE_TITLE, MODELS, type Measure } from "@/content/lesson05/snippets";

const METRICS: { key: keyof Omit<Measure, "ok">; label: string; unit: string }[] = [
  { key: "calls", label: "wywołania modelu", unit: "" },
  { key: "in", label: "tokeny wejściowe", unit: " tok." },
  { key: "out", label: "tokeny wyjściowe", unit: " tok." },
  { key: "s", label: "czas", unit: " s" },
];
const COLORS = ["var(--color-cat-1)", "var(--color-cat-2)", "var(--color-cat-3)", "var(--color-fg-muted)"]; // bez cat-4: róż za bliski czerwonych kropek błędnych odpowiedzi

/** Kwantyl z interpolacją liniową (jak numpy.percentile). */
function quantile(xs: number[], q: number) {
  const s = [...xs].sort((a, b) => a - b);
  const pos = (s.length - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
}

const ROW = "grid grid-cols-[1fr_auto] items-center gap-x-5 gap-y-1.5 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)_9.5rem]";

const fmt = (v: number, key: string) => (key === "s" ? v.toFixed(1) : String(Math.round(v)));

/**
 * Organizm: boxplot kosztu i czasu architektur na tym samym zadaniu (po 10 uruchomień).
 * Pudełko = kwartyle, kreska = mediana, wąsy = min–max, kropki = uruchomienia (zielona = poprawna odpowiedź).
 * Przełącznik miary przesuwa pudełka (przejście CSS); wysokość się nie zmienia.
 */
export function CostCompareViz() {
  const rows = Object.entries(COMPARE);
  const [metric, setMetric] = useState<(typeof METRICS)[number]["key"]>("out");
  const M = METRICS.find((m) => m.key === metric)!;
  // oś od zera z „okrągłym” krokiem (1, 2, 2,5, 5 × 10^k), około 4–5 podziałek
  const raw = Math.max(1, ...rows.flatMap(([, runs]) => runs.map((r) => r[metric])));
  const p10 = 10 ** Math.floor(Math.log10(raw / 4));
  const tick = [1, 2, 2.5, 5, 10].map((m) => m * p10).find((t) => t * 4 >= raw) ?? 10 * p10;
  const max = Math.ceil((raw * 1.04) / tick) * tick;
  const pct = (v: number) => `${(v / max) * 100}%`;
  const ticks = Array.from({ length: Math.round(max / tick) + 1 }, (_, k) => k * tick);

  return (
    <div>
      <ToggleGroup.Root
        type="single"
        value={metric}
        onValueChange={(v) => v && setMetric(v as typeof metric)}
        className="mb-4 inline-flex flex-wrap gap-1.5 rounded-xl border border-[var(--line)] p-1"
        aria-label="Miara"
      >
        {METRICS.map((m) => (
          <ToggleGroup.Item key={m.key} value={m.key} className="rounded-lg px-3 py-1.5 text-sm text-fg-muted transition-colors data-[state=on]:bg-brand-500 data-[state=on]:text-white">
            {m.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <Panel className="p-5 md:p-7">
        {/* wiersz: nazwa | wykres | liczby; nazwa i liczby wyśrodkowane w pionie względem pudełka (na telefonie nad wykresem) */}
        <ul className="space-y-6">
          {rows.map(([name, runs], i) => {
            const vals = runs.map((r) => r[metric]);
            const [q1, med, q3] = [0.25, 0.5, 0.75].map((q) => quantile(vals, q));
            const lo = Math.min(...vals);
            const hi = Math.max(...vals);
            const ok = runs.filter((r) => r.ok).length;
            const color = COLORS[i % COLORS.length];
            return (
              <li key={name} className={ROW}>
                <span className="col-start-1 row-start-1 text-sm text-fg">{name}</span>
                <div className="relative col-span-2 row-start-2 h-10 sm:col-span-1 sm:col-start-2 sm:row-start-1">
                  {/* wąsy: min–max */}
                  <span className="absolute top-1/2 h-px bg-fg-muted" style={{ left: pct(lo), width: `calc(${pct(hi)} - ${pct(lo)})`, transition: "left 500ms, width 500ms" }} />
                  <span className="absolute top-1/4 h-1/2 w-px bg-fg-muted" style={{ left: pct(lo), transition: "left 500ms" }} />
                  <span className="absolute top-1/4 h-1/2 w-px bg-fg-muted" style={{ left: pct(hi), transition: "left 500ms" }} />
                  {/* pudełko: kwartyle; przy zerowym rozrzucie zostaje sama mediana */}
                  <span
                    className="absolute inset-y-0 rounded-md border-2"
                    style={{ left: pct(q1), width: `calc(${pct(q3)} - ${pct(q1)})`, borderColor: color, background: `color-mix(in srgb, ${color} 25%, transparent)`, transition: "left 500ms, width 500ms" }}
                  />
                  <span className="absolute -inset-y-1 w-[3px] -translate-x-1/2 rounded" style={{ left: pct(med), background: color, transition: "left 500ms" }} />
                  {runs.map((r, k) => (
                    <span
                      key={k}
                      title={`uruchomienie ${k + 1}: ${r[metric]}${M.unit}${r.ok ? "" : " (niepoprawne)"}`}
                      className="absolute top-1/2 size-2.5 -translate-x-1/2 rounded-full border border-ink-950"
                      style={{ left: pct(r[metric]), marginTop: `${(k - (runs.length - 1) / 2) * 3 - 5}px`, background: r.ok ? "var(--color-hit)" : "var(--color-miss)", transition: "left 500ms" }}
                    />
                  ))}
                </div>
                <span className="text-right font-mono text-sm tabular-nums leading-snug text-fg-muted col-start-2 row-start-1 sm:col-start-3">
                  mediana <span className="text-fg">{fmt(med, metric)}{M.unit}</span>
                  <br />
                  poprawne <span className={ok > runs.length / 2 ? "text-hit" : "text-miss"}>{ok}/{runs.length}</span>
                </span>
              </li>
            );
          })}
        </ul>
        {/* oś pod kolumną wykresu */}
        <div className={`${ROW} mt-4`}>
          <div className="relative col-span-2 h-5 border-t border-[var(--line)] font-mono text-[0.7rem] tabular-nums text-fg-muted sm:col-span-1 sm:col-start-2">
            {ticks.map((t, k) => (
              <span key={k} className="absolute top-1 -translate-x-1/2" style={{ left: pct(t) }}>
                {k === ticks.length - 1 ? "" : metric === "s" ? String(t) : fmt(t, metric)}
              </span>
            ))}
          </div>
          <span className="hidden pt-1 text-right font-mono text-[0.7rem] text-fg-muted sm:col-start-3 sm:row-start-1 sm:block">{M.label}</span>
        </div>
      </Panel>
      <p className="mt-2 font-mono text-[0.7rem] text-fg-subtle">
        {COMPARE_TITLE} (critic: {MODELS.chat}) · pudełko: kwartyle, kreska: mediana, wąsy: min–max · kropki: uruchomienia (zielona = odpowiedź z oboma projektami, czerwona = brak „Aplikacji magazynowej”)
      </p>
    </div>
  );
}
