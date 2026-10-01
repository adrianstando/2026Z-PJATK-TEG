"use client";

import { motion, useReducedMotion } from "motion/react";
import { Eyebrow } from "@/components/ui/Eyebrow";

/**
 * Organizm: wielki tytuł otwierający. Każde słowo wyjeżdża spod maski
 * (overflow-hidden), z opóźnieniem — klasyczny "kinetic type".
 */
export function HeroTitle({
  eyebrow,
  lines,
  accentLine,
  lead,
}: {
  eyebrow: string;
  lines: string[];
  accentLine?: number;
  lead?: string;
}) {
  const reduce = useReducedMotion();
  let k = 0;
  return (
    <div className="max-w-5xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </motion.div>
      <h1 className="mt-6 text-[clamp(3rem,9vw,8rem)] font-semibold leading-[0.95] tracking-[-0.04em]">
        {lines.map((line, li) => (
          <span key={li} className="block">
            {line.split(" ").map((w) => {
              const i = k++;
              // pb + ujemny mb (maska i słowo): ogonki liter g, y, ę nie są ucinane,
              // a odstęp między liniami zostaje ten sam.
              return (
                <span key={w + i} className="-mb-[0.18em] inline-block overflow-hidden pb-[0.22em] align-bottom">
                  <motion.span
                    className={`-mb-[0.2em] inline-block pb-[0.2em] pr-[0.22em] ${li === accentLine ? "text-gradient" : ""}`}
                    initial={reduce ? false : { y: "110%", rotate: 4 }}
                    animate={{ y: "0%", rotate: 0 }}
                    transition={{ duration: 1, delay: 0.15 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {w}
                  </motion.span>
                </span>
              );
            })}
          </span>
        ))}
      </h1>
      {lead && (
        <motion.p
          className="mt-8 max-w-2xl text-lg leading-relaxed text-fg-muted md:text-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {lead}
        </motion.p>
      )}
    </div>
  );
}
