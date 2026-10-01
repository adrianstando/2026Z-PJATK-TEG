import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNav } from "@/components/site/SiteNav";
import { Slide } from "@/components/site/Slide";
import { HeroTitle } from "@/components/lesson/HeroTitle";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { LESSONS } from "@/content/course";

// Zajęcia bez gotowej prezentacji. Gotowe mają własny folder (np. 01-llm-embeddingi/),
// który ma pierwszeństwo przed tą trasą.
export const dynamicParams = false;

export function generateStaticParams() {
  return LESSONS.filter((l) => !l.ready).map((l) => ({ slug: l.slug }));
}

export default async function LessonPlaceholder({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = LESSONS.find((l) => l.slug === slug);
  if (!lesson) notFound();
  return (
    <>
      <SiteNav />
      <Slide id="start">
        <HeroTitle eyebrow={`Zajęcia ${lesson.n} z 8 · w przygotowaniu`} lines={[lesson.accent, lesson.title].filter(Boolean)} accentLine={0} lead={lesson.topics.join(" · ")} />
        <Reveal delay={0.8} className="mt-10">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="size-4" /> Wszystkie moduły
            </Link>
          </Button>
        </Reveal>
      </Slide>
    </>
  );
}
