"use client";

import { useEffect } from "react";

/**
 * Nawigacja między sekcjami (`data-slide`) na każdej stronie:
 *   →  PageDown  — następna sekcja
 *   ←  PageUp    — poprzednia
 *   F            — pełny ekran
 * Strzałki góra/dół i spacja przewijają normalnie. Piloty do prezentacji
 * wysyłają PageUp/PageDown, więc działają od razu. Montowany raz, w layoutcie.
 */
export function PresenterKeys() {
  useEffect(() => {
    const slides = () => Array.from(document.querySelectorAll<HTMLElement>("[data-slide]"));
    const current = () => {
      const mid = window.innerHeight * 0.35;
      let idx = -1;
      slides().forEach((el, i) => {
        if (el.getBoundingClientRect().top <= mid) idx = i;
      });
      return idx;
    };
    const go = (d: number) => {
      const list = slides();
      if (!list.length) return;
      const target = list[Math.max(0, Math.min(list.length - 1, current() + d))];
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement;
      const inControl = !!t.closest("input, textarea, select, [role=slider], [role=radio], [role=tab], [contenteditable]");
      if (["ArrowRight", "PageDown"].includes(e.key) && !(inControl && e.key === "ArrowRight")) {
        e.preventDefault();
        go(1);
      } else if (["ArrowLeft", "PageUp"].includes(e.key) && !(inControl && e.key === "ArrowLeft")) {
        e.preventDefault();
        go(-1);
      } else if (e.key.toLowerCase() === "f" && !inControl) {
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  return null;
}
