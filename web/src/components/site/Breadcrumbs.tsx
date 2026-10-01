"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, House } from "lucide-react";
import { LESSONS } from "@/content/course";

type Crumb = { label: string; href?: string };

/** Ścieżka okruszków liczona z adresu. Strona główna nie ma okruszków. */
export function crumbsFor(pathname: string): Crumb[] {
  const parts = pathname.split("/").filter(Boolean);
  if (!parts.length) return [];
  const home: Crumb = { label: "Strona główna", href: "/" };
  const lessonCrumb = (slug: string): Crumb => {
    const l = LESSONS.find((x) => x.slug === slug);
    return { label: l ? `Zajęcia ${l.n} · ${l.accent} ${l.title}`.trim() : slug, href: l?.ready ? `/zajecia/${slug}/` : undefined };
  };
  if (parts[0] === "dostep-do-llm") return [home, { label: "Dostęp do modeli" }];
  if (parts[0] === "zajecia" && parts[1]) return [home, { ...lessonCrumb(parts[1]), href: undefined }];
  if (parts[0] === "notebook" && parts[1]) {
    const isTask = parts[1].endsWith("-zadanie");
    const slug = parts[1].replace(/-zadanie$/, "");
    return [home, lessonCrumb(slug), { label: isTask ? "Zadanie" : "Notebook" }];
  }
  return [home];
}

/** Molekuła: okruszki pod paskiem nawigacji (Strona główna / Zajęcia 1 / Notebook). */
export function Breadcrumbs() {
  const crumbs = crumbsFor(usePathname());
  if (!crumbs.length) return null;
  return (
    <nav aria-label="Ścieżka" className="mx-auto flex max-w-7xl items-center gap-1.5 overflow-x-auto whitespace-nowrap pb-2.5 text-xs text-fg-subtle">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="size-3 shrink-0 opacity-60" />}
          {c.href ? (
            <Link href={c.href} className="flex items-center gap-1 transition-colors hover:text-fg">
              {i === 0 && <House className="size-3" />}
              {c.label}
            </Link>
          ) : (
            <span className="text-fg-muted" aria-current="page">
              {c.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
