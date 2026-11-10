"use client";

import { createContext, useContext, useEffect, useRef, useState, type RefObject } from "react";
import { useInView, useReducedMotion } from "motion/react";

export type Stepper = {
  /** Podpiąć do kontenera animacji: autoodtwarzanie startuje po wejściu w kadr. */
  ref: RefObject<HTMLDivElement | null>;
  step: number;
  total: number;
  playing: boolean;
  next: () => void;
  prev: () => void;
  go: (i: number) => void;
  /** Krok 0 i odtwarzanie od nowa (gdy autoplay). */
  reset: () => void;
  toggle: () => void;
};

/**
 * Wymuszony krok dla niewidocznej kopii animacji (StableSteps): "last" albo numer kroku.
 * Kopia rezerwuje wysokość wybranego stanu, a widoczna animacja działa normalnie.
 */
export const ForcedStepContext = createContext<number | "last" | null>(null);

/**
 * Wspólny hook animacji krok po kroku (0…total−1).
 * Start po Play albo ręcznym kroku (DESIGN.md: bez autoplay). autoplay: true = kroki przechodzą same co `interval` ms, raz, po wejściu w kadr; każda ręczna zmiana zatrzymuje.
 * Przy prefers-reduced-motion i autoplay od razu ostatni krok, bez odtwarzania; ręczne sterowanie działa dalej.
 */
export function useStepper(total: number, { autoplay = false, interval = 1600 }: { autoplay?: boolean; interval?: number } = {}): Stepper {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const reduce = useReducedMotion();
  const last = Math.max(0, total - 1);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(autoplay);
  // dopóki nikt nie kliknął, reduced motion pokazuje gotowy wynik zamiast odtwarzania
  const [touched, setTouched] = useState(false);
  const forced = useContext(ForcedStepContext);
  const frozen = (!!reduce && !touched) || forced != null;
  const shown = forced != null ? (forced === "last" ? last : Math.min(Math.max(0, forced), last)) : frozen && autoplay ? last : Math.min(step, last);
  const isPlaying = playing && !frozen;

  useEffect(() => {
    if (!isPlaying || !inView) return;
    if (step >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => Math.min(s + 1, last)), interval);
    return () => clearTimeout(t);
  }, [isPlaying, inView, step, last, interval]);

  const go = (i: number) => {
    setTouched(true);
    setPlaying(false);
    setStep(Math.max(0, Math.min(last, i)));
  };

  return {
    ref,
    step: shown,
    total,
    playing: isPlaying,
    next: () => go(shown + 1),
    prev: () => go(shown - 1),
    go,
    reset: () => {
      setTouched(true);
      setStep(0);
      setPlaying(autoplay);
    },
    toggle: () => {
      setTouched(true);
      if (shown >= last) setStep(0);
      else setStep(shown);
      setPlaying(!isPlaying);
    },
  };
}
