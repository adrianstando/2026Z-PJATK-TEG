import { Eyebrow } from "@/components/ui/Eyebrow";
import { Reveal } from "@/components/motion/Reveal";

/** Molekuła: nadtytuł + tytuł (z akcentem gradientowym) + lead. */
export function SectionHeading({
  eyebrow,
  title,
  accent,
  lead,
}: {
  eyebrow: string;
  title: string;
  accent?: string;
  lead?: React.ReactNode;
}) {
  return (
    <Reveal className="max-w-3xl">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-4xl font-semibold leading-[1.08] tracking-tight text-balance md:text-6xl">
        {accent && <span className="text-gradient">{accent} </span>}
        {title}
      </h2>
      {lead && <p className="mt-6 text-lg leading-relaxed text-fg-muted md:text-xl">{lead}</p>}
    </Reveal>
  );
}
