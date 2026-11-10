import { memo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaExternalLinkAlt, FaGithub } from "react-icons/fa";
import { getCaseStudyBySlug } from "../../data/caseStudies";
import { usePageSEO } from "../../utils/seo";
import { containerVariants, itemVariants } from "../../utils/motionVariants";

const WorkCaseStudy = memo(function WorkCaseStudy() {
  const { slug } = useParams();
  const study = getCaseStudyBySlug(slug);
  const seoPath = study ? `/work/${study.slug}` : null;
  usePageSEO(undefined, seoPath || undefined);

  if (!study) {
    return <Navigate to="/services" replace />;
  }

  const sections = [
    { title: "Problem", body: study.problem },
    { title: "Approach", body: study.approach },
    { title: "Architecture", body: study.architecture },
    study.outcome ? { title: "Outcome", body: study.outcome } : null,
    study.retrospective
      ? { title: "What I would do differently", body: study.retrospective }
      : null,
  ].filter(Boolean);

  return (
    <motion.article
      className="flex flex-col gap-10 md:gap-14 w-full pb-8"
      initial={false}
      animate="visible"
      variants={containerVariants}
    >
      <motion.header
        className="mt-4 border-4 border-outline bg-hatch p-5 md:p-6 shadow-[6px_6px_0_0_var(--shadow-color)] flex flex-col gap-4"
        variants={itemVariants}
      >
        <p className="font-label-bold text-xs uppercase tracking-[0.16em]">
          <Link to="/services" className="underline underline-offset-4">
            Services
          </Link>
          <span aria-hidden> / </span>
          Case study
        </p>
        <h1 className="font-headline-xl text-4xl md:text-6xl uppercase tracking-tighter leading-none bg-[var(--color-surface)] border-4 border-outline p-4 shadow-[8px_8px_0_0_var(--shadow-color)] w-fit">
          {study.title}
        </h1>
        <p className="font-body-lg text-base md:text-lg max-w-3xl bg-[var(--color-surface)] border-4 border-outline p-4 shadow-[4px_4px_0_0_var(--shadow-color)] leading-snug">
          {study.oneLiner}
        </p>
        <ul className="flex flex-wrap gap-2" aria-label="Stack">
          {study.stack.map((tag) => (
            <li
              key={tag}
              className="border-2 border-outline px-2 py-1 font-label-bold text-[10px] uppercase bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)]"
            >
              {tag}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          {study.live && (
            <a
              href={study.live}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-4 border-outline bg-[var(--color-surface)] px-4 py-2 font-label-bold text-xs uppercase shadow-[4px_4px_0_0_var(--shadow-color)]"
            >
              Live demo <FaExternalLinkAlt className="text-[10px]" aria-hidden />
            </a>
          )}
          {study.github && (
            <a
              href={study.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-4 border-outline bg-[var(--color-surface)] px-4 py-2 font-label-bold text-xs uppercase shadow-[4px_4px_0_0_var(--shadow-color)]"
            >
              GitHub <FaGithub aria-hidden />
            </a>
          )}
        </div>
      </motion.header>

      {sections.map((section) => (
        <motion.section
          key={section.title}
          aria-labelledby={`${study.slug}-${section.title}`}
          className="border-4 border-outline bg-[var(--color-surface)] p-5 md:p-6 shadow-[6px_6px_0_0_var(--shadow-color)] flex flex-col gap-3"
          variants={itemVariants}
        >
          <h2
            id={`${study.slug}-${section.title}`}
            className="font-headline-md text-xl md:text-2xl uppercase border-b-4 border-outline pb-2 w-fit"
          >
            {section.title}
          </h2>
          <p className="font-body-md text-base leading-relaxed max-w-3xl">{section.body}</p>
        </motion.section>
      ))}

      <motion.p variants={itemVariants} className="font-body-md text-sm">
        <Link to="/services" className="underline underline-offset-4 font-label-bold uppercase">
          Back to services
        </Link>
      </motion.p>
    </motion.article>
  );
});

export default WorkCaseStudy;
