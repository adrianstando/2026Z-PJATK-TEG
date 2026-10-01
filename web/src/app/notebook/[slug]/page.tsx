import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Download, ExternalLink, Presentation } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { NotebookView } from "@/components/notebook/NotebookView";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Button } from "@/components/ui/Button";
import { listNotebooks, readNotebook } from "@/lib/notebooks";
import { REPO_URL, colabUrl } from "@/lib/paths";

export const dynamicParams = false;

export function generateStaticParams() {
  return listNotebooks().map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = listNotebooks().find((n) => n.slug === slug);
  return { title: entry ? readNotebook(entry).title : "Notebook" };
}

export default async function NotebookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = listNotebooks().find((n) => n.slug === slug);
  if (!entry) notFound();
  const { title, sections } = readNotebook(entry);
  const repoPath = `${entry.folder}/${entry.file}`;
  return (
    <>
      <SiteNav />
      <main className="px-6 pb-32 pt-32">
        <div className="mx-auto max-w-4xl">
          <Eyebrow>
            Zajęcia {entry.lessonN} · {entry.kind === "zadanie" ? "zadanie" : "notebook"}
          </Eyebrow>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight md:text-5xl">{title}</h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild>
              <a href={colabUrl(repoPath)}>
                <ExternalLink className="size-4" /> Otwórz w Colabie
              </a>
            </Button>
            <Button variant="ghost" asChild>
              <a href={`${REPO_URL}/raw/main/${repoPath}`}>
                <Download className="size-4" /> Pobierz .ipynb
              </a>
            </Button>
            {entry.kind === "lekcja" && (
              <Button variant="ghost" asChild>
                <Link href={`/zajecia/${entry.lessonSlug}/`}>
                  <Presentation className="size-4" /> Prezentacja
                </Link>
              </Button>
            )}
          </div>
          <div className="mt-6">
            <NotebookView sections={sections} baseDir={entry.folder} />
          </div>
        </div>
      </main>
    </>
  );
}
