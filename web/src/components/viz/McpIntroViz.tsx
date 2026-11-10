"use client";

import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { useNarrow } from "@/lib/useMediaQuery";
import { useSvgPx } from "@/lib/useSvgPx";

// ---------- (a) M×N integracji → M+N ----------

const APPS = ["Claude Desktop", "Claude Code", "VS Code", "własny agent"];
const SYSTEMS = ["baza Nordwind", "GitHub", "pliki", "kalendarz"];

const WHY_LABELS = [
  <>bez MCP: każda aplikacja ma własną integrację z każdym systemem, {APPS.length} × {SYSTEMS.length} = {APPS.length * SYSTEMS.length}</>,
  <>z MCP: aplikacja ma klienta MCP, system ma serwer MCP, {APPS.length} + {SYSTEMS.length} = {APPS.length + SYSTEMS.length}</>,
];

/**
 * Organizm: problem M×N. Krok 1: każda aplikacja połączona z każdym systemem (własne integracje).
 * Krok 2: między nimi warstwa MCP, każda strona ma jedno połączenie. Start przyciskiem Play.
 */
export function McpWhyViz() {
  const narrow = useNarrow();
  const W = narrow ? 460 : 900;
  const H = narrow ? 360 : 340;
  const { ref, px } = useSvgPx(W);
  const font = px(15, narrow ? 20 : 17);
  const st = useStepper(2, { interval: 1800 });
  const mcp = st.step === 1;

  const boxW = narrow ? 150 : 210;
  const boxH = font * 2.4;
  const rowY = (i: number) => 30 + boxH / 2 + i * ((H - 60 - boxH) / 3);
  const appX = boxW / 2 + 4;
  const sysX = W - boxW / 2 - 4;
  const midX = W / 2;
  const barW = narrow ? 56 : 90;

  return (
    <div ref={st.ref}>
      <Panel className="p-4 md:p-6">
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Integracje aplikacji z systemami bez MCP i z MCP">
          {/* bez MCP: M×N linii */}
          <g style={{ opacity: mcp ? 0 : 1, transition: "opacity 500ms" }}>
            {APPS.map((_, i) =>
              SYSTEMS.map((__, k) => (
                <line key={`${i}-${k}`} x1={appX + boxW / 2} y1={rowY(i)} x2={sysX - boxW / 2} y2={rowY(k)} stroke="var(--color-miss)" strokeOpacity={0.7} strokeWidth={1.6} />
              )),
            )}
          </g>
          {/* z MCP: M + N linii przez warstwę MCP */}
          <g style={{ opacity: mcp ? 1 : 0, transition: "opacity 500ms" }}>
            {APPS.map((_, i) => (
              <line key={`a${i}`} x1={appX + boxW / 2} y1={rowY(i)} x2={midX - barW / 2} y2={rowY(i)} stroke="var(--color-hit)" strokeWidth={2} />
            ))}
            {SYSTEMS.map((_, k) => (
              <line key={`s${k}`} x1={midX + barW / 2} y1={rowY(k)} x2={sysX - boxW / 2} y2={rowY(k)} stroke="var(--color-hit)" strokeWidth={2} />
            ))}
            <rect x={midX - barW / 2} y={20} width={barW} height={H - 40} rx={14} fill="color-mix(in srgb, var(--color-focus) 14%, transparent)" stroke="var(--color-focus)" strokeWidth={2} />
            <text x={midX} y={H / 2} textAnchor="middle" dominantBaseline="middle" className="fill-focus font-mono" style={{ fontSize: font * 1.1 }} transform={`rotate(-90 ${midX} ${H / 2})`}>
              MCP
            </text>
          </g>
          {APPS.map((a, i) => (
            <g key={a}>
              <rect x={appX - boxW / 2} y={rowY(i) - boxH / 2} width={boxW} height={boxH} rx={10} fill="var(--panel-hi)" stroke="var(--color-brand-400)" />
              <text x={appX} y={rowY(i)} textAnchor="middle" dominantBaseline="middle" className="fill-fg" style={{ fontSize: font }}>
                {a}
              </text>
            </g>
          ))}
          {SYSTEMS.map((s, k) => (
            <g key={s}>
              <rect x={sysX - boxW / 2} y={rowY(k) - boxH / 2} width={boxW} height={boxH} rx={10} fill="var(--panel-hi)" stroke="var(--line-strong)" />
              <text x={sysX} y={rowY(k)} textAnchor="middle" dominantBaseline="middle" className="fill-fg" style={{ fontSize: font }}>
                {s}
              </text>
            </g>
          ))}
        </svg>
        <div className="mt-4">
          <StepControls stepper={st} label={WHY_LABELS[st.step]} labels={WHY_LABELS} />
        </div>
      </Panel>
    </div>
  );
}

// ---------- (b) host, klienci, serwery ----------

type Srv = { name: string; transport: "stdio" | "HTTP"; where: string };
const SERVERS: Srv[] = [
  { name: "nordwind", transport: "stdio", where: "proces na tym samym komputerze" },
  { name: "filesystem", transport: "stdio", where: "proces na tym samym komputerze" },
  { name: "GitHub", transport: "HTTP", where: "zdalny serwer, adres URL" },
];

/**
 * Organizm (statyczny): host z modelem i jednym klientem na każdy serwer. Serwery stdio to procesy
 * uruchomione przez host na tym samym komputerze, serwer HTTP działa pod adresem URL (localhost albo zdalnie).
 */
export function McpArchitectureViz() {
  const narrow = useNarrow();
  const W = narrow ? 560 : 1000;
  const H = narrow ? 700 : 430;
  const { ref, px } = useSvgPx(W);
  const font = px(15, narrow ? 22 : 18);
  const small = px(13, narrow ? 18 : 15);
  const boxH = font * 3.3;

  // wąski układ: host u góry (LLM, pod nim trzech klientów), serwery na dole
  const host = narrow ? { x: 10, y: 10, w: 540, h: 330 } : { x: 10, y: 10, w: 450, h: 410 };
  const llm = narrow ? { x: 200, y: 70, w: 160, h: 64 } : { x: 40, y: 175, w: 130, h: 80 };
  const rowY = [80, 195, 330];
  const clientBox = (i: number) => (narrow ? { x: 25 + i * 180, y: 230, w: 150 } : { x: 260, y: rowY[i], w: 170 });
  const serverBox = (i: number) => (narrow ? { x: 25 + i * 180, y: 530, w: 150 } : { x: 680, y: rowY[i], w: 290 });
  const local = narrow ? { x: 10, y: 470, w: 360, h: 220 } : { x: 650, y: 20, w: 340, h: 262 };
  const remote = narrow ? { x: 380, y: 470, w: 170, h: 220 } : { x: 650, y: 292, w: 340, h: 128 };

  const mid = (b: { x: number; y: number; w: number }) => ({ cx: b.x + b.w / 2, cy: b.y + boxH / 2 });

  return (
    <Panel className="p-4 md:p-6">
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Host, klienci i serwery MCP">
        {/* strefy serwerów */}
        <rect {...local} width={local.w} height={local.h} rx={16} fill="none" stroke="var(--line-strong)" strokeDasharray="4 6" />
        <text x={local.x + 14} y={local.y + small * 1.4} className="fill-fg-muted font-mono" style={{ fontSize: small }}>
          ten sam komputer
        </text>
        <rect {...remote} width={remote.w} height={remote.h} rx={16} fill="none" stroke="var(--line-strong)" strokeDasharray="4 6" />
        <text x={remote.x + 14} y={remote.y + small * 1.4} className="fill-fg-muted font-mono" style={{ fontSize: small }}>
          {narrow ? "zdalnie" : "zdalnie (albo localhost)"}
        </text>

        {/* host */}
        <rect x={host.x} y={host.y} width={host.w} height={host.h} rx={18} fill="color-mix(in srgb, var(--color-brand-500) 6%, transparent)" stroke="var(--color-brand-400)" />
        <text x={host.x + 18} y={host.y + font * 1.6} className="fill-brand-300 font-mono" style={{ fontSize: small }}>
          host, np. Claude Code
        </text>
        <rect x={llm.x} y={llm.y} width={llm.w} height={llm.h} rx={12} fill="var(--panel)" stroke="var(--line-strong)" />
        <text x={llm.x + llm.w / 2} y={llm.y + llm.h / 2} textAnchor="middle" dominantBaseline="middle" className="fill-fg font-mono" style={{ fontSize: font }}>
          LLM
        </text>

        {SERVERS.map((s, i) => {
          const c = clientBox(i);
          const v = serverBox(i);
          const C = mid(c);
          const V = mid(v);
          const http = s.transport === "HTTP";
          // LLM → klient
          const l1 = narrow ? { x1: llm.x + llm.w / 2, y1: llm.y + llm.h, x2: C.cx, y2: c.y } : { x1: llm.x + llm.w, y1: llm.y + llm.h / 2, x2: c.x, y2: C.cy };
          // klient → serwer
          const l2 = narrow ? { x1: C.cx, y1: c.y + boxH, x2: V.cx, y2: v.y } : { x1: c.x + c.w, y1: C.cy, x2: v.x, y2: V.cy };
          return (
            <g key={s.name}>
              <line {...l1} stroke="var(--line-strong)" strokeWidth={1.4} />
              <line {...l2} stroke={http ? "var(--color-cat-2)" : "var(--color-hit)"} strokeWidth={2.2} strokeDasharray={http ? "9 6" : undefined} />
              <text
                x={(l2.x1 + l2.x2) / 2 + (narrow ? 8 : 0)}
                y={(l2.y1 + l2.y2) / 2 - (narrow ? 0 : 10)}
                textAnchor={narrow ? "start" : "middle"}
                className="fill-fg-muted font-mono"
                style={{ fontSize: small }}
              >
                {s.transport}
              </text>
              <rect x={c.x} y={c.y} width={c.w} height={boxH} rx={12} fill="var(--panel)" stroke="var(--line-strong)" />
              <text x={C.cx} y={C.cy} textAnchor="middle" dominantBaseline="middle" className="fill-fg font-mono" style={{ fontSize: font }}>
                klient {i + 1}
              </text>
              <rect x={v.x} y={v.y} width={v.w} height={boxH} rx={12} fill="var(--panel)" stroke={http ? "var(--color-cat-2)" : "var(--color-hit)"} strokeWidth={1.6} />
              <text x={V.cx} y={V.cy - (narrow ? 0 : small * 0.6)} textAnchor="middle" dominantBaseline="middle" className="fill-fg font-mono" style={{ fontSize: font }}>
                {s.name}
              </text>
              {!narrow && (
                <text x={V.cx} y={V.cy + small * 0.9} textAnchor="middle" dominantBaseline="middle" className="fill-fg-muted" style={{ fontSize: small }}>
                  {http ? "usługa pod adresem URL" : "podproces hosta"}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <dl className="mt-4 grid gap-x-6 gap-y-3 border-t border-[var(--line)] pt-4 text-sm md:grid-cols-3">
        <div>
          <dt className="font-mono text-brand-300">host</dt>
          <dd className="mt-1 text-fg-muted">aplikacja z modelem i pętlą agenta (harness)</dd>
        </div>
        <div>
          <dt className="font-mono text-fg">klient</dt>
          <dd className="mt-1 text-fg-muted">część hosta: jedno połączenie z jednym serwerem</dd>
        </div>
        <div>
          <dt className="font-mono text-hit">serwer</dt>
          <dd className="mt-1 text-fg-muted">program, który udostępnia tools, resources i prompts</dd>
        </div>
      </dl>
    </Panel>
  );
}
