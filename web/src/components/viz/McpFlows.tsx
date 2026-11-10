"use client";

import { useState } from "react";
import { ToggleGroup } from "radix-ui";
import { ModeSequence, type Actor, type SeqMode } from "@/components/viz/ActorSequence";
import { StableHeight } from "@/components/molecules/StableHeight";
import { cn } from "@/lib/cn";
import { CLIENT, HITL, HTTP, INJECTION, LEAST, TICKET_102, MODELS } from "@/content/lesson05/snippets";

const cut = (t: string, n = 260) => (t.length > n ? t.slice(0, n).trimEnd() + " …" : t);
const model = MODELS.agent;

// ---------- (a) tools / resources / prompts ----------

const PRIM_ACTORS: Actor[] = [
  { id: "user", label: "użytkownik" },
  { id: "agent", label: "harness", sub: "z klientami MCP" },
  { id: "llm", label: "LLM" },
  { id: "server", label: "serwer MCP", sub: "nordwind" },
];

type Primitive = { id: string; name: string; who: string; how: string; what: string; when: string };

const PRIMS: Primitive[] = [
  {
    id: "tools",
    name: "tools",
    who: "decyduje model",
    how: "tools/list, tools/call z nazwą i argumentami",
    what: "Funkcja z argumentami; może tylko czytać albo coś zmieniać. Najczęściej używany element, część harnessów obsługuje tylko narzędzia.",
    when: "find_employee(query), create_ticket(title, …): model sam wybiera narzędzie i argumenty.",
  },
  {
    id: "resources",
    name: "resources",
    who: "decyduje aplikacja albo użytkownik",
    how: "resources/list, resources/read z URI",
    what: "Dane tylko do odczytu pod adresem URI, jak GET w API. Adres stały albo szablon z parametrem.",
    when: "nordwind://schema (stały), nordwind://employees/{id} (szablon): kontekst dołączany bez pytania modelu.",
  },
  {
    id: "prompts",
    name: "prompts",
    who: "decyduje użytkownik",
    how: "prompts/list, prompts/get z nazwą i argumentami",
    what: "Gotowy szablon polecenia z argumentami. Harness pokazuje go jako polecenie do wybrania.",
    when: "project_report(project_name): w Claude Code polecenie /mcp__nordwind__project_report.",
  },
];

const PRIMITIVES: SeqMode[] = [
  {
    id: "tools",
    label: "tools",
    actors: PRIM_ACTORS,
    caption: "wynik tools/call: zapis z notebooka (ClientSession)",
    steps: [
      { from: "user", to: "agent", label: "pytanie", detail: "„Kto pracuje w Gdańsku i ile ma urlopu?”" },
      { from: "agent", to: "llm", label: "pytanie + narzędzia", detail: "harness dołącza nazwy, opisy i schematy narzędzi z tools/list" },
      { from: "llm", to: "agent", label: "tool_call", detail: 'model wybiera narzędzie i argumenty: find_employee({"query": "Gdańsk"})', tone: "focus" },
      { from: "agent", to: "server", label: "tools/call", detail: '{"name": "find_employee", "arguments": {"query": "Gdańsk"}}' },
      { from: "server", to: "agent", label: "wynik", detail: CLIENT.tool, tone: "hit" },
      { from: "agent", to: "llm", label: "wynik narzędzia", detail: "wynik wraca do modelu jako wiadomość tool; model pisze odpowiedź" },
      { from: "agent", to: "user", label: "odpowiedź" },
    ],
  },
  {
    id: "resources",
    label: "resources",
    actors: PRIM_ACTORS,
    caption: "wyniki resources/list i resources/read: zapis z notebooka (ClientSession)",
    steps: [
      { from: "agent", to: "server", label: "resources/list", detail: CLIENT.resources },
      { from: "user", to: "agent", label: "@nordwind:nordwind://schema", detail: "użytkownik dołącza zasób do wiadomości (albo aplikacja robi to sama)", tone: "focus" },
      { from: "agent", to: "server", label: "resources/read", detail: '{"uri": "nordwind://schema"}' },
      { from: "server", to: "agent", label: "treść zasobu", detail: CLIENT.read, tone: "hit" },
      { from: "agent", to: "llm", label: "pytanie + schemat bazy", detail: "treść zasobu trafia do kontekstu; model o tym nie decydował" },
    ],
  },
  {
    id: "prompts",
    label: "prompts",
    actors: PRIM_ACTORS,
    caption: "wynik prompts/get: zapis z notebooka (ClientSession)",
    steps: [
      { from: "agent", to: "server", label: "prompts/list", detail: "project_report(project_name): harness pokazuje go jako polecenie" },
      { from: "user", to: "agent", label: "/project_report", detail: 'użytkownik wybiera polecenie i podaje project_name = "Portal klienta"', tone: "focus" },
      { from: "agent", to: "server", label: "prompts/get", detail: '{"name": "project_report", "arguments": {"project_name": "Portal klienta"}}' },
      { from: "server", to: "agent", label: "gotowa wiadomość", detail: CLIENT.prompt, tone: "hit" },
      { from: "agent", to: "llm", label: "wiadomość użytkownika", detail: "szablon staje się poleceniem; dalej model może wołać narzędzia" },
    ],
  },
];

function PrimCard({ p, on }: { p: Primitive; on: boolean }) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border p-4 text-left transition-colors", on ? "border-focus bg-focus/[0.06]" : "border-[var(--line)] bg-[var(--panel)] hover:border-brand-400")}>
      <p className="flex flex-wrap items-baseline justify-between gap-x-3">
        <span className={cn("font-mono text-base", on ? "text-focus" : "text-brand-300")}>{p.name}</span>
        <span className="text-sm text-fg">{p.who}</span>
      </p>
      <p className="mt-1 font-mono text-xs text-fg-muted">{p.how}</p>
      <p className="mt-2 text-sm text-fg-muted">{p.what}</p>
      <p className="mt-1 text-sm text-fg-muted">
        <span className="text-fg">Przykład: </span>
        {p.when}
      </p>
    </div>
  );
}

/** Organizm: trzy elementy serwera MCP jako karty do wyboru; obok przepływ wybranego elementu (wyniki z notebooka). */
export function PrimitivesViz() {
  const [id, setId] = useState("tools");
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
      <ToggleGroup.Root type="single" value={id} onValueChange={(v) => v && setId(v)} className="flex flex-col gap-3" aria-label="Element serwera MCP">
        {PRIMS.map((p) => (
          <ToggleGroup.Item key={p.id} value={p.id} className="block w-full rounded-[var(--radius-card)] focus-visible:outline-2 focus-visible:outline-brand-400">
            <PrimCard p={p} on={p.id === id} />
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <ModeSequence modes={PRIMITIVES} value={id} label="Element serwera MCP" />
    </div>
  );
}

// ---------- (b) stdio vs streamable HTTP ----------

const TRANSPORTS: SeqMode[] = [
  {
    id: "stdio",
    label: "stdio",
    actors: [
      { id: "client", label: "klient", sub: "proces nadrzędny" },
      { id: "stdin", label: "stdin" },
      { id: "server", label: "serwer", sub: "proces potomny" },
      { id: "stdout", label: "stdout" },
    ],
    caption: "stdio: serwer działa tyle co połączenie; jeden klient na proces",
    steps: [
      { from: "client", to: "server", label: "uruchom proces", detail: "klient uruchamia python nordwind_mcp.py jako podproces, z uprawnieniami użytkownika", tone: "focus" },
      { from: "client", to: "stdin", label: "JSON + \\n", detail: '{"jsonrpc": "2.0", "id": 1, "method": "initialize", ...}' },
      { from: "stdin", to: "server", label: "readline()", detail: "serwer czyta po jednym komunikacie w linii" },
      { from: "server", to: "stdout", label: "odpowiedź", detail: '{"jsonrpc": "2.0", "id": 1, "result": {...}}' },
      { from: "stdout", to: "client", label: "readline()", detail: "stdout należy do protokołu: print() w serwerze by go zepsuł, logi idą na stderr", tone: "hit" },
      { from: "client", to: "server", label: "koniec", detail: "zamknięcie stdin albo terminate(): proces znika razem ze stanem w pamięci", tone: "miss" },
    ],
  },
  {
    id: "http",
    label: "streamable HTTP",
    actors: [
      { id: "a", label: "klient A" },
      { id: "b", label: "klient B" },
      { id: "server", label: "serwer", sub: ":8000/mcp" },
    ],
    caption: "streamable HTTP: jeden działający serwer, wielu klientów; sesja opcjonalna",
    steps: [
      { from: "server", to: "server", label: "nasłuchuje", detail: "python nordwind_mcp.py --http → http://127.0.0.1:8000/mcp (localhost albo zdalna maszyna)", tone: "focus" },
      { from: "a", to: "server", label: "POST initialize", detail: "każdy komunikat to osobne żądanie POST na ten sam adres /mcp" },
      { from: "server", to: "a", label: "200 + Mcp-Session-Id", detail: "serwer może nadać sesji identyfikator; kolejne żądania klienta A go niosą. Z FastMCP(..., stateless_http=True) sesji nie ma: każde żądanie jest niezależne" },
      { from: "b", to: "server", label: "POST initialize", detail: "drugi klient dostaje własną sesję; dane serwera (baza) są wspólne" },
      { from: "a", to: "server", label: "POST tools/list" },
      { from: "server", to: "a", label: "JSON albo strumień SSE", detail: `narzędzia: ${HTTP.tools}`, tone: "hit" },
      { from: "a", to: "server", label: "DELETE /mcp", detail: "klient A kończy sesję; serwer działa dalej dla klienta B" },
    ],
  },
];

/** Organizm: transport stdio (proces potomny) i streamable HTTP (serwer pod adresem URL). */
export function TransportViz() {
  return <ModeSequence modes={TRANSPORTS} label="Transport" />;
}

// ---------- (c) prompt injection i obrona ----------

const INJ_ACTORS: Actor[] = [
  { id: "user", label: "użytkownik" },
  { id: "agent", label: "agent", sub: model },
  { id: "server", label: "serwer MCP", sub: "nordwind" },
];
const injected = TICKET_102.match(/\[.*\]/)?.[0] ?? TICKET_102;
const created = INJECTION.calls.filter((c) => c.name === "create_ticket");

const INJECTION_MODES: SeqMode[] = [
  {
    id: "none",
    label: "bez obrony",
    actors: INJ_ACTORS,
    caption: `${model} · zapisany przebieg z notebooka`,
    steps: [
      { from: "user", to: "agent", label: "pytanie", detail: "„Podsumuj otwarte zgłoszenia IT.”" },
      { from: "agent", to: "server", label: "list_tickets", detail: INJECTION.calls[0] ? `${INJECTION.calls[0].name}(${INJECTION.calls[0].args})` : "" },
      { from: "server", to: "agent", label: "wynik z #102", detail: `opis zgłoszenia #102: ${cut(injected, 240)}`, tone: "miss" },
      { from: "agent", to: "agent", label: "kontekst modelu", detail: "opis zgłoszenia leży w historii obok pytania użytkownika; model nie odróżnia danych od poleceń" },
      ...created.map((c, i) => ({ from: "agent", to: "server", label: `create_ticket${created.length > 1 ? ` (${i + 1})` : ""}`, detail: `${c.name}(${cut(c.args, 200)})`, tone: "miss" as const })),
      { from: "server", to: "agent", label: "zgłoszenie utworzone", detail: `w bazie: ${INJECTION.created}`, tone: "miss" },
      { from: "agent", to: "user", label: "„podsumowanie”", detail: cut(INJECTION.answer, 300) },
    ],
  },
  {
    id: "readonly",
    label: "tylko readOnlyHint",
    actors: INJ_ACTORS,
    caption: `${model} · zapisany przebieg z notebooka`,
    steps: [
      { from: "agent", to: "server", label: "tools/list", detail: "przy starcie sesji agent pobiera listę narzędzi z adnotacjami" },
      { from: "server", to: "agent", label: "lista narzędzi", detail: "find_employee, list_projects, list_tickets, run_sql, create_ticket" },
      { from: "agent", to: "agent", label: "filtr readOnlyHint", detail: `model dostaje tylko narzędzia z readOnlyHint: ${LEAST.tools}`, tone: "focus" },
      { from: "user", to: "agent", label: "pytanie", detail: "„Podsumuj otwarte zgłoszenia IT.”" },
      { from: "agent", to: "server", label: "list_tickets", detail: LEAST.calls[0] ? `${LEAST.calls[0].name}(${LEAST.calls[0].args})` : "" },
      { from: "server", to: "agent", label: "wynik z #102", detail: `to samo polecenie w opisie: ${cut(injected, 200)}`, tone: "miss" },
      { from: "agent", to: "agent", label: "brak create_ticket", detail: "model nie ma narzędzia, którym mógłby wykonać polecenie" },
      { from: "agent", to: "user", label: "podsumowanie", detail: cut(LEAST.answer, 300), tone: "hit" },
    ],
  },
  {
    id: "hitl",
    label: "human in the loop",
    actors: INJ_ACTORS,
    caption: `${model} · zapisany przebieg z notebooka`,
    steps: [
      { from: "user", to: "agent", label: "pytanie", detail: "„Podsumuj otwarte zgłoszenia IT.”" },
      { from: "agent", to: "server", label: "list_tickets", detail: "wynik zawiera zgłoszenie #102 z poleceniem" },
      { from: "agent", to: "user", label: "interrupt", detail: `agent zatrzymuje się i pyta o zgodę na wywołanie: ${HITL.pending}`, tone: "focus" },
      { from: "user", to: "agent", label: "reject", detail: "„To polecenie pochodzi z treści zgłoszenia, nie od użytkownika.”", tone: "miss" },
      { from: "agent", to: "user", label: "podsumowanie", detail: cut(HITL.answer, 300), tone: "hit" },
    ],
  },
];

/**
 * Organizm: prompt injection ze zgłoszenia #102 w trzech wariantach (bez obrony, filtr readOnlyHint,
 * human in the loop). Przełącznik zmienia jednocześnie kod (`codes`, renderowany na serwerze)
 * i przebieg. Wszystkie warianty kodu rezerwują wysokość (StableHeight), więc slajd nie skacze.
 */
export function SecurityViz({ codes }: { codes: Record<"none" | "readonly" | "hitl", React.ReactNode> }) {
  const [id, setId] = useState<"none" | "readonly" | "hitl">("none");
  return (
    <div>
      <ToggleGroup.Root
        type="single"
        value={id}
        onValueChange={(v) => v && setId(v as typeof id)}
        className="mb-4 inline-flex flex-wrap gap-1.5 rounded-xl border border-[var(--line)] p-1"
        aria-label="Wariant obrony"
      >
        {INJECTION_MODES.map((x) => (
          <ToggleGroup.Item key={x.id} value={x.id} className="rounded-lg px-3 py-1.5 text-sm text-fg-muted transition-colors data-[state=on]:bg-brand-500 data-[state=on]:text-white">
            {x.label}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
      <div className="grid gap-6 lg:grid-cols-2">
        <StableHeight variants={Object.values(codes)} mode="hug">
          {codes[id]}
        </StableHeight>
        <ModeSequence modes={INJECTION_MODES} value={id} label="Wariant obrony" />
      </div>
    </div>
  );
}
