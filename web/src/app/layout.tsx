import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { BackgroundMesh } from "@/components/site/BackgroundMesh";
import { PresenterKeys } from "@/components/site/PresenterKeys";
import { ScrollProgress } from "@/components/motion/ScrollProgress";
import "./globals.css";

const sans = Geist({ subsets: ["latin", "latin-ext"], variable: "--font-geist-sans" });
const mono = Geist_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: { default: "Technologie Generatywne", template: "%s · Technologie Generatywne" },
  description: "Technologie generatywne: LLM, RAG, GraphRAG, agenci, MCP. Materiały do laboratoriów.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior: Next wyłącza płynne przewijanie na czas zmiany strony.
    <html lang="pl" className={`${sans.variable} ${mono.variable}`} data-scroll-behavior="smooth">
      {/* suppressHydrationWarning: rozszerzenia (np. Grammarly) dopisują atrybuty do <body> */}
      <body suppressHydrationWarning>
        <BackgroundMesh />
        <ScrollProgress />
        <PresenterKeys />
        {children}
      </body>
    </html>
  );
}
