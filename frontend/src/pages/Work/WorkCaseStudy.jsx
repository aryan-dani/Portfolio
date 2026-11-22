import { memo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { getCaseStudyBySlug } from "../../data/caseStudies";
import { getProjectById } from "../../data/projects";
import { PRIMARY_CTA } from "../../data/availability";
import { openSiteBrowser } from "../../utils/siteBrowser";
import ProgressiveImage from "../../components/ProgressiveImage/ProgressiveImage";
import {
  Button,
  Card,
  Eyebrow,
  Reveal,
  Rule,
  Section,
  Tag,
} from "../../components/ui";
import { usePageSEO } from "../../utils/seo";

const WorkCaseStudy = memo(function WorkCaseStudy() {
  const { slug } = useParams();
  const study = getCaseStudyBySlug(slug);
  const project = study ? getProjectById(study.projectId) : null;
  const seoPath = study ? `/work/${study.slug}` : null;
  usePageSEO(undefined, seoPath || undefined);

  if (!study) {
    return <Navigate to="/services" replace />;
  }

  const sections = [
    { title: "Problem", body: study.problem },
    { title: "Approach", body: study.approach },
    { title: "Architecture", body: study.architecture },
    study.outcome ? { title: "Outcome", body: study.outcome, pull: true } : null,
    study.retrospective
      ? { title: "What I would do differently", body: study.retrospective }
      : null,
  ].filter(Boolean);

  return (
    <article className="flex flex-col gap-12 md:gap-16 w-full pb-8">
      <Reveal>
        <header className="flex flex-col gap-5 mt-2">
          <Eyebrow>
            <Link to="/projects" className="underline underline-offset-4">
              Projects
            </Link>
            <span aria-hidden> / </span>
            Case study
          </Eyebrow>
          <h1 className="font-headline-xl text-[clamp(2.5rem,6vw,4.5rem)] leading-none tracking-tight uppercase max-w-4xl w-fit bg-surface border-4 border-outline p-3 md:p-5 shadow-[8px_8px_0_0_var(--shadow-color)]">
            {study.title}
          </h1>
          <p className="font-body-lg text-base md:text-lg max-w-3xl text-on-surface-variant leading-snug">
            {study.oneLiner}
          </p>
          <Rule />
          <div className="flex flex-wrap gap-x-6 gap-y-2 font-label-bold text-[10px] uppercase tracking-[0.14em] text-text-muted">
            {project?.year ? <span>{project.year}</span> : null}
            {study.live ? <span>Live</span> : <span>Private / offline demo</span>}
            <span>{study.stack.length} stack tags</span>
          </div>
          <ul className="flex flex-wrap gap-2" aria-label="Stack">
            {study.stack.map((tag) => (
              <li key={tag}>
                <Tag tone="solid">{tag}</Tag>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            {study.live && (
              <Button
                as="a"
                href={study.live}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  openSiteBrowser({ url: study.live, title: study.title });
                }}
              >
                {study.liveAnchor || "Live demo"} <FaExternalLinkAlt className="text-[10px]" aria-hidden />
              </Button>
            )}
            {study.github && (
              <Button as="a" href={study.github} target="_blank" rel="noopener noreferrer" variant="quiet">
                GitHub <FaGithub aria-hidden />
              </Button>
            )}
          </div>
        </header>
      </Reveal>

      {project?.image ? (
        <Reveal>
          <ProgressiveImage
            src={project.image}
            alt={`${study.title} screenshot`}
            className="w-full aspect-[16/9] border border-outline-variant bg-surface"
            imgClassName="w-full h-full object-cover"
            loading="eager"
          />
        </Reveal>
      ) : null}

      {sections.map((section) => (
        <Reveal key={section.title}>
          <Section aria-labelledby={`${study.slug}-${section.title}`}>
            <Eyebrow>{section.title}</Eyebrow>
            {section.pull ? (
              <blockquote
                id={`${study.slug}-${section.title}`}
                className="font-serif text-xl md:text-2xl leading-snug max-w-3xl text-on-background border-l-2 border-[var(--color-brand-accent)] pl-5 mt-2"
                style={{ fontFamily: "var(--font-serif)" }}
              >
                {section.body}
              </blockquote>
            ) : (
              <>
                <h2
                  id={`${study.slug}-${section.title}`}
                  className="font-headline-md text-xl md:text-2xl normal-case tracking-tight"
                >
                  {section.title}
                </h2>
                <p className="font-body-md text-base leading-relaxed max-w-3xl text-on-surface-variant">
                  {section.body}
                </p>
              </>
            )}
            {section.title === "Outcome" && study.live ? (
              <a
                href={study.live}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  openSiteBrowser({ url: study.live, title: study.title });
                }}
                className="font-label-bold text-[11px] uppercase tracking-[0.14em] underline underline-offset-4 inline-flex items-center gap-2"
              >
                {study.liveAnchor || "Visit live site"} <FaExternalLinkAlt className="text-[10px]" aria-hidden />
              </a>
            ) : null}
          </Section>
        </Reveal>
      ))}

      <Reveal>
        <Card className="p-5 flex flex-wrap items-center gap-4 justify-between">
          <Link to="/projects" className="font-label-bold text-[11px] uppercase tracking-[0.14em] underline underline-offset-4">
            Back to projects
          </Link>
          <Button to={PRIMARY_CTA.to}>{PRIMARY_CTA.label}</Button>
        </Card>
      </Reveal>
    </article>
  );
});

export default WorkCaseStudy;
