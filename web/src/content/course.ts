// Jedno źródło prawdy o planie zajęć dla aplikacji.
// README.md w katalogu głównym repo trzyma tę samą tabelę dla GitHuba;
// przy zmianie planu trzeba zaktualizować oba miejsca.

export type Activity = "quiz" | "zadanie" | "test" | "skillathon" | "prezentacja" | null;

export type Lesson = {
  n: number;
  slug: string;
  title: string;
  accent: string; // pierwsze słowo/fraza tytułu wyróżniona gradientem
  topics: string[];
  activity: Activity;
  folder: string; // folder w repo z notebookiem i README
  ready: boolean; // czy podstrona z prezentacją jest gotowa
  notebook?: boolean; // czy w folderze jest notebook.ipynb (strona /notebook/<slug>/)
  task?: boolean; // czy w folderze jest zadanie.ipynb (strona /notebook/<slug>-zadanie/)
};

export const COURSE = {
  code: "TEG",
  name: "Technologie Generatywne",
  term: "2026Z",
  school: "PJATK",
  instructor: "Adrian Stańdo",
};

export const LESSONS: Lesson[] = [
  {
    n: 1,
    slug: "01-llm-embeddingi",
    title: "i embeddingi",
    accent: "LLM",
    topics: ["Generowanie tekstu i tokeny", "Wywołanie modelu z Pythona", "Prosty agent", "Embeddingi i miary podobieństwa", "Wyszukiwanie wektorowe"],
    activity: "zadanie",
    folder: "01-llm-embeddingi",
    ready: true,
    notebook: true,
    task: true,
  },
  {
    n: 2,
    slug: "02-rag",
    title: "od podstaw do ewaluacji",
    accent: "RAG",
    topics: ["Chunking", "Chroma i filtrowanie po metadanych", "Hybryda z BM25", "Reranking", "Ewaluacja (RAGAS)"],
    activity: "zadanie",
    folder: "02-rag",
    ready: false,
  },
  {
    n: 3,
    slug: "03-agenci",
    title: "i tool calling",
    accent: "Agenci",
    topics: ["Tool calling", "ReAct w LangGraph", "Pamięć", "Agentic RAG"],
    activity: "quiz",
    folder: "03-agenci",
    ready: false,
  },
  {
    n: 4,
    slug: "04-graphrag",
    title: "i grafy wiedzy",
    accent: "GraphRAG",
    topics: ["Neo4j i Cypher", "Ekstrakcja grafu przez LLM", "Demo TalentMatch", "GraphRAG vs RAG", "Start projektu"],
    activity: "zadanie",
    folder: "04-graphrag",
    ready: false,
  },
  {
    n: 5,
    slug: "05-mcp-multi-agent",
    title: "i systemy wieloagentowe",
    accent: "MCP",
    topics: ["Model Context Protocol", "Własny serwer MCP", "Multi-agent", "Test (TestPortal)"],
    activity: "test",
    folder: "05-mcp-multi-agent",
    ready: false,
  },
  {
    n: 6,
    slug: "06-agentic-coding",
    title: "coding",
    accent: "Agentic",
    topics: ["Claude Code, Codex, Copilot", "AGENTS.md, CLAUDE.md, skille", "Design system dla backendowców", "Vibe coding to nie programowanie", "Zespoły na skillathon"],
    activity: null,
    folder: "06-agentic-coding",
    ready: false,
  },
  {
    n: 7,
    slug: "07-skillathon",
    title: "",
    accent: "Skillathon",
    topics: ["Use case podany na zajęciach", "Każda osoba pisze skill", "Agent koduje max 15 min", "Demo"],
    activity: "skillathon",
    folder: "07-skillathon",
    ready: false,
  },
  {
    n: 8,
    slug: "08-prezentacje",
    title: "projektów",
    accent: "Prezentacje",
    topics: ["Prezentacje zespołów", "Obrona: pytanie do losowej osoby", "Podsumowanie"],
    activity: "prezentacja",
    folder: "08-prezentacje",
    ready: false,
  },
];

export const GRADING = [
  { label: "Projekt", points: 50, note: "stworzenie własnej bazy wiedzy GraphRAG + prezentacja" },
  { label: "Test", points: 30, note: "warunek zaliczenia: min. 50% (15 pkt)" },
  { label: "Praca na zajęciach", points: 12, note: "zadania do wykonania w trakcie zajęć lub quiz" },
  { label: "Skillathon", points: 8, note: "praca w grupach z agentem kodującym na przedostatnich zajęciach" },
] as const;

export const SCALE = [
  { from: 90, grade: "5" },
  { from: 80, grade: "4.5" },
  { from: 70, grade: "4" },
  { from: 60, grade: "3.5" },
  { from: 50, grade: "3" },
  { from: 0, grade: "2" },
] as const;

export const ACTIVITY_LABEL: Record<Exclude<Activity, null>, string> = {
  quiz: "Quiz",
  zadanie: "Zadanie",
  test: "Test",
  skillathon: "Skillathon",
  prezentacja: "Prezentacja",
};
