"use client";

import { useSyncExternalStore } from "react";

/**
 * true, gdy media query pasuje. Na serwerze (statyczny eksport) zawsze false,
 * więc pierwszy render to wersja szeroka; po hydratacji przełącza się na właściwą.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (on) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", on);
      return () => m.removeEventListener("change", on);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Telefon: węższy od breakpointu `sm` Tailwinda (640 px). */
export const useNarrow = () => useMediaQuery("(max-width: 639px)");
