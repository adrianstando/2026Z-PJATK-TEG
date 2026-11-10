"use client";

import { Tabs } from "radix-ui";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import { StableHeight } from "@/components/molecules/StableHeight";

/**
 * Molekuła: ten sam przykład w kilku wariantach (np. OpenAI / Anthropic). Zawartość zakładek renderuje serwer.
 * Wysokość rezerwuje najdłuższa zakładka (StableHeight "hug"), więc przełączanie nie przesuwa strony.
 * layoutId tła zakładki jest unikalny dla instancji: kilka CodeTabs na stronie nie dzieli jednego tła.
 */
export function CodeTabs({
  tabs,
}: {
  tabs: { label: string; content: React.ReactNode }[];
}) {
  const [value, setValue] = useState(tabs[0].label);
  const pillId = `code-tab-pill-${useId()}`;
  return (
    <Tabs.Root value={value} onValueChange={setValue}>
      <Tabs.List
        className="mb-3 inline-flex gap-1 rounded-xl border border-[var(--line)] p-1"
        aria-label="Wariant"
      >
        {tabs.map((t) => (
          <Tabs.Trigger
            key={t.label}
            value={t.label}
            className="relative rounded-lg px-3.5 py-1.5 text-sm text-fg-muted transition-colors data-[state=active]:text-white"
          >
            {value === t.label && (
              <motion.span
                layoutId={pillId}
                className="absolute inset-0 -z-10 rounded-lg bg-brand-500"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            {t.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <StableHeight variants={tabs.map((t) => t.content)} mode="hug">
        <AnimatePresence mode="wait" initial={false}>
          {tabs.map(
            (t) =>
              t.label === value && (
                <Tabs.Content key={t.label} value={t.label} forceMount asChild>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.25 }}
                  >
                    {t.content}
                  </motion.div>
                </Tabs.Content>
              ),
          )}
        </AnimatePresence>
      </StableHeight>
    </Tabs.Root>
  );
}
