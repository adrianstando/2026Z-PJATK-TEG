"use client";

import { motion } from "motion/react";
import { Bot, Package, Sparkles, Webhook } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { StepControls } from "@/components/molecules/StepControls";
import { useStepper } from "@/lib/useStepper";
import { cn } from "@/lib/cn";

// Polecenia i komunikaty jak w dokumentacji Claude Code (Create a marketplace, Install and manage plugins).
const STEPS = [
  { cmd: "/plugin marketplace add ./06-agentic-coding/cwiczenia/plugin", out: "✔ Successfully added marketplace: teg-plugins", label: "1. Marketplace: folder albo repo z .claude-plugin/marketplace.json, czyli listą pluginów. Tu lokalny folder z repo kursu; z GitHuba: /plugin marketplace add właściciel/repo." },
  { cmd: "/plugin install secure-api-kit@teg-plugins", out: "Will install: 2 skills · 1 agent · 1 hook", label: "2. Instalacja: nazwa pluginu @ nazwa marketplace z kroku 1. Przed zgodą widać, co plugin doda; hooki uruchamiają kod, więc warto je przeczytać." },
  { cmd: "→ Install for you (user scope)", out: "~/.claude/settings.json: enabledPlugins += secure-api-kit@teg-plugins", label: "3. Zakres: dla siebie (user, wszystkie projekty) albo dla zespołu (project, wpis w .claude/settings.json w repo)." },
  { cmd: "/secure-api-kit:secure-api", out: "skill secure-api wczytany (wywołany ręcznie)", label: "4. Skill można wywołać ręcznie: ukośnik, nazwa pluginu, dwukropek, nazwa skilla." },
  { cmd: "> dodaj endpoint zmiany hasła", out: "skill secure-api wczytany sam · hook run-tests.sh po edycji", label: "5. Zwykle nie trzeba: opis skilla jest w kontekście od startu sesji, więc agent wczytuje go sam, gdy zadanie pasuje; hook działa po każdej edycji." },
];

const PARTS = [
  { icon: Sparkles, name: "skills/secure-api", from: 2 },
  { icon: Sparkles, name: "skills/api-tests", from: 2 },
  { icon: Bot, name: "agents/security-reviewer", from: 2 },
  { icon: Webhook, name: "hooks/hooks.json", from: 2 },
];

/** Organizm: instalacja pluginu Claude Code krok po kroku: marketplace → install → zakres → aktywne komponenty. */
export function PluginInstallViz() {
  const st = useStepper(STEPS.length, { interval: 1900 });
  const { ref, step } = st;
  return (
    <div ref={ref} className="space-y-4">
      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <Panel className="overflow-hidden bg-ink-950/60">
          <div className="border-b border-[var(--line)] px-4 py-2.5 font-mono text-xs text-fg-subtle">claude · sesja w sklonowanym repo kursu</div>
          <div className="space-y-3 px-4 py-4 font-mono text-xs sm:text-[0.8rem]">
            {STEPS.map((s, i) => (
              <motion.div key={i} initial={false} animate={{ opacity: i <= step ? 1 : 0, y: i <= step ? 0 : 6 }} transition={{ duration: 0.35 }}>
                <p className={cn(i === step ? "text-fg" : "text-fg-muted")}>{s.cmd}</p>
                <p className="text-hit/90">{s.out}</p>
              </motion.div>
            ))}
          </div>
        </Panel>
        <Panel className="p-4">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-brand-300" />
            <span className="font-mono text-sm">secure-api-kit</span>
            <motion.span className="ml-auto font-mono text-xs" initial={false} animate={{ color: step >= 2 ? "var(--color-hit)" : "var(--color-fg-subtle)" }}>
              {step >= 2 ? "aktywny" : step >= 1 ? "instalacja…" : "w marketplace"}
            </motion.span>
          </div>
          <div className="mt-4 space-y-2">
            {PARTS.map((p, i) => (
              <motion.div
                key={p.name}
                className="flex items-center gap-2 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
                initial={false}
                animate={{ opacity: step >= 1 ? 1 : 0.25, x: step >= p.from ? 0 : -4, borderColor: step >= p.from ? "var(--color-hit)" : "var(--line)" }}
                transition={{ delay: step >= p.from ? i * 0.12 : 0 }}
              >
                <p.icon className="size-4 text-fg-subtle" />
                <span className="font-mono text-xs">{p.name}</span>
              </motion.div>
            ))}
          </div>
          <motion.p className="mt-4 text-sm text-fg-muted" initial={false} animate={{ opacity: step >= 2 ? 1 : 0 }}>
            Plugin to gotowe środowisko pracy: skille, subagenci, hooki i serwery MCP w jednej paczce. Dla jednego projektu wystarczą pliki w .claude/.
          </motion.p>
        </Panel>
      </div>
      <StepControls stepper={st} label={STEPS[step].label} labels={STEPS.map((x) => x.label)} />
    </div>
  );
}
