"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Wjazd w kadr przy przewijaniu. Jedyny sposób animowania wejścia sekcji —
 * nie piszemy własnych IntersectionObserverów w komponentach.
 * `delay` (s) rozkłada w czasie sąsiednie elementy.
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
      initial={reduce ? false : { opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
