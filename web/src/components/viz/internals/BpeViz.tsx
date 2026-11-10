"use client";

import { useEffect, useRef } from "react";
import { Tabs } from "radix-ui";
import raw from "@/data/llm-internals.json";
import { Panel } from "@/components/ui/Panel";
import { StickySteps } from "@/components/molecules/StickySteps";
import { useStepper } from "@/lib/useStepper";
import { StableSteps } from "@/components/molecules/StableSteps";
import { cn } from "@/lib/cn";

type Step = { merge: string[] | null; count: number; tokens: string[] };
const data = raw.bpe as { text: string; alphabet: number; vocab: string[]; steps: Step[]; newText: string; encoded: { t: string; id: number }[] };
const gpt = raw.gpt2 as { tokens: string[]; ids: number[]; vocab: number };
const MAX = data.steps.length - 1;
/** co 10. krok obu animacji i ostatni: rezerwa wysokości w StableSteps (każdy krok to ~70 kopii, za ciężko na telefonie) */
const BPE_STEPS: (number | "last")[] = [...Array.from({ length: Math.ceil(Math.max(MAX + 1, data.encoded.length + 1) / 10) }, (_, i) => i * 10), "last"];
const BASE = data.alphabet;

const show = (t: string) => t.replace(/ /g, "·");

function Chip({ t, hot, small }: { t: string; hot?: boolean; small?: boolean }) {
  return (
    <span
      className={cn(
        "rounded-[4px] border font-mono whitespace-pre",
        small ? "px-1 text-xs md:text-sm" : "px-1.5 py-0.5 text-sm md:text-base",
        hot ? "border-focus/70 bg-focus/15 text-focus" : t.length > 1 ? "border-brand-500/40 bg-brand-500/10 text-fg" : "border-[var(--line)] text-fg-muted",
      )}
    >
      {show(t)}
    </span>
  );
}

function Learn() {
  const st = useStepper(MAX + 1, { autoplay: false, interval: 900 });
  const s = st.step;
  const cur = data.steps[s];
  const merged = cur.merge?.join("");
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [s]);

  return (
    <div>
      <StickySteps stepper={st} slider label={s === 0 ? "start: same znaki" : `scalenie ${s}: ${show(cur.merge![0])} + ${show(cur.merge![1])} → ${show(merged!)} (${cur.count}×)`} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_15rem]">
        <div>
          <p className="mb-3 text-xs uppercase tracking-wider text-fg-subtle">
            Tekst treningowy: <span className="font-mono tabular-nums text-fg">{cur.tokens.length}</span> tokenów (na starcie {data.steps[0].tokens.length})
          </p>
          <p className="flex flex-wrap gap-0.5 leading-relaxed">
            {cur.tokens.map((t, k) => (
              <Chip key={k} t={t} small hot={t === merged} />
            ))}
          </p>
        </div>
        <div>
          <p className="mb-3 text-xs uppercase tracking-wider text-fg-subtle">
            Słownik: <span className="font-mono tabular-nums text-fg">{BASE + s}</span> tokenów
          </p>
          <ol ref={listRef} className="max-h-80 space-y-0.5 overflow-y-auto rounded-xl border border-[var(--line)] p-2 font-mono text-sm">
            <li className="px-2 py-1 text-xs text-fg-subtle">
              ID 0–{BASE - 1}: pojedyncze znaki
              <span className="mt-1 block break-all text-fg-muted">{data.vocab.slice(0, BASE).map(show).join(" ")}</span>
            </li>
            {data.vocab.slice(BASE, BASE + s).map((t, i) => (
              <li key={i} className={cn("grid grid-cols-[2.5rem_1fr] rounded px-2", i === s - 1 ? "bg-focus/10 text-focus" : "text-fg-muted")}>
                <span className="tabular-nums text-fg-subtle">{BASE + i}</span>
                <span className="whitespace-pre">{show(t)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function Encode() {
  const N = data.encoded.length;
  const st = useStepper(N + 1, { autoplay: false, interval: 320 });
  const s = st.step;
  const done = data.encoded.slice(0, s);
  const used = done.reduce((a, x) => a + x.t.length, 0);
  const rest = data.newText.slice(used);
  const listRef = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [s]);

  return (
    <div>
      <StickySteps stepper={st} slider label={s === 0 ? "nowy tekst, którego nie było w treningu" : `token ${s}: „${show(data.encoded[s - 1].t)}” → ID ${data.encoded[s - 1].id}`} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_15rem]">
        <div>
          <p className="flex flex-wrap items-baseline gap-0.5 leading-relaxed">
            {done.map((x, k) => (
              <Chip key={k} t={x.t} hot={k === s - 1} />
            ))}
            <span className="font-mono text-sm whitespace-pre-wrap text-fg-subtle md:text-base">{rest}</span>
          </p>
          <p className="mt-6 text-xs uppercase tracking-wider text-fg-subtle">Do modelu trafia tylko ciąg liczb</p>
          <p className="mt-2 font-mono text-sm break-words text-brand-300">[{done.map((x) => x.id).join(", ")}]</p>
          <p className="mt-6 text-sm text-fg-muted">
            Tokenizer bierze kolejne słowo i stosuje wyuczone scalenia w tej samej kolejności, w jakiej powstały. Słowa z treningu („·the”, „·city”, „·river”) wchodzą jednym tokenem. „Eiffel” i „Paris” rozpadają się na pojedyncze litery, a „Tower” z wielkiej litery to inny ciąg znaków niż „tower”.
          </p>
        </div>
        <ol ref={listRef} className="max-h-80 space-y-0.5 overflow-y-auto rounded-xl border border-[var(--line)] p-2 font-mono text-sm">
          {done.map((x, i) => (
            <li key={i} className={cn("grid grid-cols-[1fr_auto] gap-2 rounded px-2", i === s - 1 ? "bg-focus/10 text-focus" : "text-fg-muted")}>
              <span className="whitespace-pre">{show(x.t)}</span>
              <span className="tabular-nums">{x.id}</span>
            </li>
          ))}
          {!s && <li className="px-2 text-fg-subtle">token → ID</li>}
        </ol>
      </div>
      <div className="mt-8 border-t border-[var(--line)] pt-5">
        <p className="text-xs uppercase tracking-wider text-fg-subtle">To samo zdanie w prawdziwym tokenizerze GPT-2 (słownik {gpt.vocab.toLocaleString("pl-PL")} tokenów)</p>
        <p className="mt-3 flex flex-wrap gap-1.5">
          {gpt.tokens.map((t, i) => (
            <span key={i} className="flex flex-col items-center gap-0.5">
              <Chip t={t} />
              <span className="font-mono text-[0.7rem] tabular-nums text-fg-subtle">{gpt.ids[i]}</span>
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

/** Organizm: BPE na akapicie: tokeny rosną ze scalenia na scalenie, słownik z ID; potem kodowanie nowego tekstu token po tokenie. Dane: scripts/llm_internals_data.py. */
export function BpeViz() {
  return (
    <StableSteps steps={BPE_STEPS}>
      <BpeVizInner />
    </StableSteps>
  );
}

function BpeVizInner() {
  return (
    <Panel className="p-4 sm:p-6 md:p-8">
      <Tabs.Root defaultValue="learn">
        <Tabs.List aria-label="Etap" className="flex w-fit flex-wrap gap-1.5 rounded-xl border border-[var(--line)] p-1">
          {[
            ["learn", "1. Uczenie słownika"],
            ["encode", "2. Tokenizacja nowego tekstu"],
          ].map(([v, l]) => (
            <Tabs.Trigger key={v} value={v} className="rounded-lg px-3 py-1.5 text-sm text-fg-muted transition-colors data-[state=active]:bg-brand-500 data-[state=active]:text-white">
              {l}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        <Tabs.Content value="learn" className="mt-6">
          <Learn />
        </Tabs.Content>
        <Tabs.Content value="encode" className="mt-6">
          <Encode />
        </Tabs.Content>
      </Tabs.Root>
    </Panel>
  );
}
