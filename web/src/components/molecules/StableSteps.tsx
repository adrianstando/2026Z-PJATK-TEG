"use client";

import { ForcedStepContext } from "@/lib/useStepper";

/**
 * Molekuła: rezerwuje wysokość animacji krok po kroku bez zmian w jej kodzie. Obok widocznej animacji
 * renderuje niewidoczne kopie ustawione na wybranych krokach (domyślnie ostatnim; kontekst
 * ForcedStepContext w useStepper), w tej samej komórce siatki. Dla animacji, w których treść przybywa
 * z kolejnymi krokami (wiersze tabeli, lista wyników). Kopie są za widoczną treścią w DOM, więc id
 * (np. markery SVG) wskazują na widoczne elementy.
 */
export function StableSteps({ children, steps = ["last"] }: { children: React.ReactNode; steps?: (number | "last")[] }) {
  return (
    <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
      <div className="min-w-0">{children}</div>
      {steps.map((st) => (
        <ForcedStepContext.Provider key={String(st)} value={st}>
          <div aria-hidden inert className="pointer-events-none invisible min-w-0">
            {children}
          </div>
        </ForcedStepContext.Provider>
      ))}
    </div>
  );
}
