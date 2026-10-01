import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { SiteNav } from "@/components/site/SiteNav";
import { HeroTitle } from "@/components/lesson/HeroTitle";
import { Markdown } from "@/components/molecules/Markdown";
import { Reveal } from "@/components/motion/Reveal";

export const metadata: Metadata = { title: "Dostęp do LLM" };

// Treść = 00-dostep-do-llm/README.md czytany w czasie builda (ten sam plik co na GitHubie).
const README = fs.readFileSync(path.join(process.cwd(), "..", "00-dostep-do-llm", "README.md"), "utf8");

export default function AccessPage() {
  return (
    <>
      <SiteNav />
      <main className="px-6 pb-32 pt-36">
        <div className="mx-auto max-w-4xl">
          <HeroTitle
            eyebrow="Zajęcia 0 · przygotowanie"
            lines={["Dostęp", "do modeli"]}
            accentLine={1}
            lead="Porównanie opcji, konfiguracja krok po kroku i przykłady wywołań z Pythona."
          />
          <Reveal delay={0.8} className="mt-8">
            <Markdown source={README} baseDir="00-dostep-do-llm" slides />
          </Reveal>
        </div>
      </main>
    </>
  );
}
