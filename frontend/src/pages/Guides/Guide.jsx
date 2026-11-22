import { memo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { getGuideBySlug } from "../../data/services";
import { PRIMARY_CTA } from "../../data/availability";
import {
  Button,
  Eyebrow,
  Reveal,
  Rule,
  Section,
} from "../../components/ui";
import { usePageSEO } from "../../utils/seo";

const Guide = memo(function Guide() {
  const { slug } = useParams();
  const guide = getGuideBySlug(slug);
  const seoPath = guide ? `/guides/${guide.slug}` : null;
  usePageSEO(undefined, seoPath || undefined);

  if (!guide) {
    return <Navigate to="/services" replace />;
  }

  return (
    <article className="flex flex-col gap-12 md:gap-14 w-full pb-8">
      <Reveal>
        <header className="flex flex-col gap-4 mt-2">
          <Eyebrow>
            <Link to="/services" className="underline underline-offset-4">
              Services
            </Link>
            <span aria-hidden> / </span>
            Guide
          </Eyebrow>
          <h1 className="font-headline-xl text-[clamp(2rem,5vw,3.5rem)] leading-[1] tracking-tight normal-case max-w-4xl w-fit bg-surface border-4 border-outline p-4 md:p-6 shadow-[8px_8px_0_0_var(--shadow-color)]">
            {guide.title}
          </h1>
          <p className="font-body-lg text-base md:text-lg max-w-3xl text-on-surface-variant leading-snug">
            {guide.description}
          </p>
          <Rule />
        </header>
      </Reveal>

      <div className="flex flex-col gap-8 max-w-3xl">
        {guide.sections.map((section) => (
          <Reveal key={section.title}>
            <Section>
              <h2 className="font-headline-md text-xl md:text-2xl normal-case tracking-tight">
                {section.title}
              </h2>
              <p className="font-body-md text-base leading-relaxed text-on-surface-variant">
                {section.body}
              </p>
            </Section>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <Button to={PRIMARY_CTA.to}>{PRIMARY_CTA.label}</Button>
      </Reveal>
    </article>
  );
});

export default Guide;
