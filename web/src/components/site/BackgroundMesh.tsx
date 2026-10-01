"use client";

import { motion, useScroll, useTransform } from "motion/react";

/**
 * Organizm: żywe tło całej aplikacji — trzy rozmyte plamy niebieskiego, które
 * powoli dryfują i przesuwają się z przewijaniem (paralaksa), plus siatka.
 * Stoi za treścią (fixed, -z-10), więc sekcje nie muszą malować własnego tła.
 */
export function BackgroundMesh() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-ink-900 via-ink-950 to-ink-950" />
      <motion.div
        style={{ y: y1 }}
        animate={{ x: ["-4%", "5%", "-4%"], scale: [1, 1.12, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-[15%] -top-[20%] h-[75vh] w-[75vh] rounded-full bg-brand-500/30 blur-[140px]"
      />
      <motion.div
        style={{ y: y2 }}
        animate={{ x: ["3%", "-6%", "3%"], scale: [1.05, 0.95, 1.05] }}
        transition={{ duration: 34, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-[10%] top-[25%] h-[65vh] w-[65vh] rounded-full bg-cyan-400/15 blur-[150px]"
      />
      <motion.div
        animate={{ y: ["0%", "-8%", "0%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-25%] left-[30%] h-[60vh] w-[60vh] rounded-full bg-brand-600/25 blur-[160px]"
      />
      <div className="bg-grid absolute inset-0 opacity-40" />
    </div>
  );
}
