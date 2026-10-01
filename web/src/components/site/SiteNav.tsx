"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { Kbd } from "@/components/ui/Kbd";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { cn } from "@/lib/cn";
import { COURSE } from "@/content/course";
import { REPO_URL } from "@/lib/paths";

/**
 * Organizm: górny pasek. Przezroczysty na górze strony, szklany po przewinięciu.
 * Na stronie głównej nazwa kursu pojawia się dopiero po przewinięciu poza duży tytuł.
 * Na podstronach pod paskiem są okruszki.
 */
export function SiteNav({ children }: { children?: React.ReactNode }) {
  const isHome = usePathname() === "/";
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(!isHome);
  useEffect(() => {
    const on = () => {
      setScrolled(window.scrollY > 24);
      setPastHero(!isHome || window.scrollY > window.innerHeight * 0.55);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [isHome]);
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 px-6 transition-all duration-300", // px-6 na zewnątrz kontenera: wyrównanie z treścią slajdów
        scrolled ? "border-b border-[var(--line)] bg-ink-950/75 backdrop-blur-xl" : "border-b border-transparent",
      )}
    >
      <nav className={cn("mx-auto flex max-w-7xl items-center gap-6 transition-all duration-300", scrolled ? "h-14" : "h-16")}>
        <Link href="/" className="text-sm font-medium" aria-label={COURSE.name}>
          <span className={cn("transition-all duration-300", pastHero ? "opacity-100" : "pointer-events-none -translate-x-1 opacity-0")}>{COURSE.name}</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          {children}
          <span className="hidden items-center gap-2 text-xs text-fg-subtle md:flex" title="Poprzednia / następna sekcja, pełny ekran">
            <Keyboard className="size-3.5" /> <Kbd>←</Kbd> <Kbd>→</Kbd> <Kbd>F</Kbd>
          </span>
          <a href={REPO_URL} className="text-fg-muted transition-colors hover:text-fg" aria-label="Repozytorium na GitHubie">
            <GitHubLogoIcon className="size-5" />
          </a>
        </div>
      </nav>
      <Breadcrumbs />
    </header>
  );
}
