"use client";

import { motion } from "motion/react";
import { GRADING, SCALE } from "@/content/course";

const COLORS = ["var(--color-cat-1)", "var(--color-cat-2)", "var(--color-cat-3)", "var(--color-cat-4)"];

/** Organizm: 100 punktów jako pasek segmentów + skala ocen jako schodki. */
export function GradingBar() {
  return (
    <div>
      <div className="flex h-16 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
        {GRADING.map((g, i) => (
          <motion.div
            key={g.label}
            className="relative flex items-center justify-center overflow-hidden"
            style={{ background: COLORS[i] }}
            initial={{ width: 0 }}
            whileInView={{ width: `${g.points}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.1, delay: 0.2 + i * 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="font-mono text-lg font-semibold text-ink-950">{g.points}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {GRADING.map((g, i) => (
          <motion.div
            key={g.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 + i * 0.12 }}
            className="border-l-2 pl-4"
            style={{ borderColor: COLORS[i] }}
          >
            <p className="font-medium">
              {g.label} <span className="font-mono text-sm text-fg-subtle">· {g.points} pkt</span>
            </p>
            <p className="mt-1 text-sm text-fg-muted">{g.note}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/** Organizm: skala ocen jako schodki — wyższa ocena, wyższy i jaśniejszy słupek. */
export function GradeScale() {
  const rows = [...SCALE].reverse(); // od 2 do 5
  return (
    <div className="grid grid-cols-6 items-end gap-2 sm:gap-3">
      {rows.map((s, i) => {
        const upper = i === rows.length - 1 ? 100 : rows[i + 1].from - 1;
        const range = s.from === 0 ? "< 50" : `${s.from}–${upper}`;
        return (
          <motion.div
            key={s.grade}
            initial={{ opacity: 0, height: 0 }}
            whileInView={{ opacity: 1, height: `${5 + i * 1.6}rem` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-between overflow-hidden rounded-xl border border-[var(--line)] p-3"
            style={{ background: `color-mix(in oklab, var(--color-brand-500) ${8 + i * 9}%, transparent)` }}
          >
            <span className="font-mono text-2xl font-semibold sm:text-3xl">{s.grade}</span>
            <span className="font-mono text-xs text-fg-muted">{range} pkt</span>
          </motion.div>
        );
      })}
    </div>
  );
}
