"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Wjazd w kadr przy przewijaniu. Jedyny sposób animowania wejścia sekcji —
 * nie piszemy własnych IntersectionObserverów w komponentach.
 * `delay` (s) rozkłada w czasie sąsiednie elementy.
 * Bez filter: blur — animowany filtr na każdym bloku przycinał przewijanie na telefonach.
 */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      // initial taki sam na serwerze i w przeglądarce (useReducedMotion na serwerze zwraca null,
      // więc warunkowy initial psuł hydrację); reduced motion = pojawienie się bez animacji.
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={reduce ? { duration: 0 } : { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
