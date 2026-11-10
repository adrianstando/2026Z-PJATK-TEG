"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Przelicznik px ekranu → jednostki viewBox dla SVG skalowanego do szerokości kontenera.
 * `px(14)` zwraca rozmiar czcionki w jednostkach viewBox, który na ekranie ma 14 px, niezależnie
 * od tego, czy rysunek ma 400 czy 1300 px szerokości. Przed pomiarem (SSR) zwraca `fallback`.
 */
export function useSvgPx(viewBoxW: number) {
  const ref = useRef<SVGSVGElement>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const px = (size: number, fallback: number) => (width > 0 ? (size * viewBoxW) / width : fallback);
  return { ref, px, width };
}
