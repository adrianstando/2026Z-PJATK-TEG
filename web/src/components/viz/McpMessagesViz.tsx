"use client";

import { motion, useReducedMotion } from "motion/react";
import { JsonBlock } from "@/components/molecules/JsonBlock";
import { StepControls } from "@/components/molecules/StepControls";
import { Panel } from "@/components/ui/Panel";
import { cn } from "@/lib/cn";
import { useStepper } from "@/lib/useStepper";
import { RPC, prettyJson } from "@/content/lesson05/snippets";

const STEP_MS = 1600;

/** Krótki opis pod strzałką i dłuższe wyjaśnienie nad JSON-em: co znaczy dany komunikat. */
function hint(m: (typeof RPC)[number]): { short: string; long: string } {
  if (m.method === "initialize")
    return m.dir === "out"
      ? { short: "klient: wersja protokołu i możliwości", long: "Klient zaczyna sesję: podaje wersję protokołu, którą zna, swoje możliwości i nazwę." }
      : { short: "serwer: wersja, możliwości, instrukcje", long: "Serwer odpowiada wersją, której użyje, listą tego, co obsługuje (tools, resources, prompts) i instrukcjami dla modelu." }
  if (m.method === "notifications/initialized")
    return { short: "uzgadnianie zakończone", long: "Klient potwierdza, że uzgadnianie się skończyło i można wysyłać żądania. To powiadomienie: nie ma id, więc serwer nie odpowiada." };
  if (m.method === "tools/list")
    return m.dir === "out"
      ? { short: "jakie są narzędzia?", long: "Klient prosi o listę narzędzi. Host przekaże ją modelowi jako definicje narzędzi." }
      : { short: "nazwy, opisy, schematy", long: "Dla każdego narzędzia: nazwa, opis (docstring), inputSchema (argumenty), outputSchema (wynik) i adnotacje, np. readOnlyHint." };
  if (m.method === "tools/call") {
    const err = m.body.includes('"isError": true');
    if (m.dir === "out")
      return m.body.includes("DELETE")
        ? { short: "próba zapisu przez run_sql", long: "Wywołanie run_sql z zapytaniem DELETE. Opis narzędzia mówi „tylko SELECT”, ale argument wybiera model." }
        : { short: "wywołanie z argumentami", long: "Wywołanie narzędzia: nazwa i argumenty, które w agencie wybrałby model." };
    return err
      ? { short: "błąd jako zwykły wynik", long: "Baza odrzuciła zapis. Błąd narzędzia wraca jako zwykły wynik z isError: true: model może go przeczytać i poprawić zapytanie." }
      : { short: "content + structuredContent", long: "Wynik dwa razy: content to tekst dla modelu (tu JSON zapisany jako napis), structuredContent to ten sam wynik jako obiekt JSON zgodny z outputSchema." };
  }
  return { short: "", long: "" };
}

/**
 * Organizm: diagram sekwencji JSON-RPC między klientem a serwerem MCP przez stdio,
 * odtworzony z zapisanego wyniku komórki web:jsonrpc. Każdy wiersz to jeden komunikat;
 * aktywny pokazuje sformatowany JSON i opis. Start przyciskiem Play; klik w wiersz.
 */
export function McpMessagesViz() {
  const st = useStepper(RPC.length + 1, { interval: STEP_MS });
  const reduced = useReducedMotion();
  const shown = st.step - 1;

  const cur = shown >= 0 ? RPC[shown] : undefined;
  let pretty = cur?.body ?? "";
  try {
    pretty = prettyJson(JSON.parse(pretty));
  } catch {
    /* niepełny JSON: zostaje jedna linia */
  }

  return (
    <div ref={st.ref} className="grid gap-5 lg:grid-cols-[1.05fr_1fr]">
      <Panel className="flex flex-col p-4 md:p-5">
        <div className="mb-3 grid grid-cols-2 font-mono text-xs uppercase tracking-wider text-fg-subtle">
          <span>klient · notebook</span>
          <span className="text-right">serwer · nordwind_mcp.py</span>
        </div>
        <ol className="relative space-y-2">
          {/* linie życia obu stron */}
          <span aria-hidden className="absolute inset-y-0 left-1 w-px bg-[var(--line-strong)]" />
          <span aria-hidden className="absolute inset-y-0 right-1 w-px bg-[var(--line-strong)]" />
          {RPC.map((m, i) => {
            const visible = i <= shown;
            const active = i === shown;
            const out = m.dir === "out";
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => st.go(i + 1)}
                  disabled={!visible}
                  className={cn("block w-full px-3 py-1.5 text-left transition-opacity", visible ? "opacity-100" : "opacity-0")}
                >
                  <div className={cn("flex items-baseline gap-2 font-mono text-[0.78rem] md:text-sm", out ? "justify-start" : "justify-end")}>
                    {m.id ? <span className="text-fg-subtle tabular-nums">id {m.id}</span> : null}
                    <span className={active ? "text-focus" : out ? "text-brand-300" : "text-hit"}>{m.method}</span>
                    {!out && <span className="text-fg-subtle">wynik</span>}
                  </div>
                  <motion.div
                    className={cn("relative mt-1 h-0.5 rounded", active ? "bg-focus" : out ? "bg-brand-400/70" : "bg-hit/70")}
                    initial={false}
                    animate={{ scaleX: visible ? 1 : 0 }}
                    style={{ originX: out ? 0 : 1 }}
                    transition={{ duration: reduced ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span
                      className={cn(
                        "absolute -top-[5px] size-0 border-y-[6px] border-y-transparent",
                        out ? "right-0 border-l-[9px]" : "left-0 border-r-[9px]",
                        active ? (out ? "border-l-focus" : "border-r-focus") : out ? "border-l-brand-400" : "border-r-hit",
                      )}
                    />
                  </motion.div>
                  <p className={cn("mt-1 text-xs text-fg-muted", out ? "text-left" : "text-right")}>{hint(m).short}</p>
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-auto space-y-3 pt-4">
          <StepControls stepper={st} label={cur ? cur.method : "start"} labels={["start", ...RPC.map((m) => m.method)]} />
          <p className="font-mono text-[0.7rem] text-fg-subtle">stdio · JSON-RPC 2.0 · protokół 2025-11-25 · zapis z notebooka</p>
        </div>
      </Panel>

      {/* prawy panel: na szerokim ekranie wysokość lewej kolumny, dłuższy JSON przewija się w środku */}
      <div className="relative h-[min(30rem,70vh)] lg:h-auto">
        <Panel className="absolute inset-0 flex flex-col overflow-hidden bg-ink-950/60">
          <div className="border-b border-[var(--line)] px-4 py-2.5">
            <div className="flex items-center justify-between gap-2 font-mono text-xs">
              <span className={cur?.dir === "in" ? "text-hit" : "text-brand-300"}>{cur ? (cur.dir === "out" ? "klient → serwer (stdin)" : "serwer → klient (stdout)") : "…"}</span>
              <span className="text-fg-subtle">{cur?.method}</span>
            </div>
            <p className="mt-1.5 text-sm text-fg">{cur ? hint(cur).long : "Play: komunikaty po kolei, tak jak notebook wysyła je do serwera."}</p>
          </div>
          <div className="min-h-0 flex-1 overflow-auto px-4 py-3 [scrollbar-gutter:stable]">
            <JsonBlock text={pretty} className="text-[0.72rem] leading-relaxed sm:text-[0.8rem]" />
          </div>
        </Panel>
      </div>
    </div>
  );
}
