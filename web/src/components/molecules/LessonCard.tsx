"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { BookOpenText, Lock, Presentation, SquarePen } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ACTIVITY_LABEL, type Lesson } from "@/content/course";
import { cn } from "@/lib/cn";

/** Molekuła: kafelek zajęć. Gotowe zajęcia mają linki do prezentacji i notebooka. */
export function LessonCard({ lesson, index }: { lesson: Lesson; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border p-6",
        lesson.ready ? "border-brand-500/40 bg-gradient-to-br from-brand-500/15 to-transparent" : "border-[var(--line)] bg-[var(--panel)]",
      )}
    >
      {lesson.ready && <div className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-brand-500/30 blur-3xl" />}
      <div className="flex items-start justify-between">
        <span className="font-mono text-5xl font-light tabular-nums text-fg-subtle/70">{String(lesson.n).padStart(2, "0")}</span>
        {!lesson.ready && <Lock className="size-4 text-fg-subtle" />}
      </div>
      <h3 className="mt-6 text-xl font-semibold leading-snug">
        <span className={lesson.ready ? "text-gradient" : ""}>{lesson.accent}</span> {lesson.title}
      </h3>
      <ul className="mt-3 flex-1 space-y-1 text-sm text-fg-muted">
        {lesson.topics.slice(0, 5).map((t) => (
          <li key={t}>· {t}</li>
        ))}
      </ul>
      {lesson.ready ? (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <CardLink href={`/zajecia/${lesson.slug}/`} icon={<Presentation className="size-3.5" />} label="Prezentacja" />
          {lesson.notebook && <CardLink href={`/notebook/${lesson.slug}/`} icon={<BookOpenText className="size-3.5" />} label="Notebook" />}
          {lesson.task ? (
            <CardLink href={`/notebook/${lesson.slug}-zadanie/`} icon={<SquarePen className="size-3.5" />} label="Zadanie" tone="focus" />
          ) : (
            lesson.activity && <Badge tone="focus">{ACTIVITY_LABEL[lesson.activity]}</Badge>
          )}
        </div>
      ) : (
        <div className="mt-5">
          <Badge>wkrótce</Badge>
        </div>
      )}
    </motion.div>
  );
}

function CardLink({ href, icon, label, tone = "brand" }: { href: string; icon: React.ReactNode; label: string; tone?: "brand" | "focus" }) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        tone === "brand"
          ? "border-brand-500/40 bg-brand-500/10 text-brand-300 hover:border-brand-400 hover:bg-brand-500/20"
          : "border-focus/40 bg-focus/10 text-focus hover:border-focus hover:bg-focus/20",
      )}
    >
      {icon} {label}
    </Link>
  );
}
