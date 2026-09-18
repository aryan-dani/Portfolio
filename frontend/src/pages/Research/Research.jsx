import { useMemo, useState, memo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFileDownload,
  FaExternalLinkAlt,
  FaGithub,
  FaEye,
  FaArrowRight,
} from "react-icons/fa";
import { researchPaper } from "../../data/research";
import { getAssetPath } from "../../utils/paths";
import { usePageSEO } from "../../utils/seo";
import PageHeader from "../../components/PageHeader/PageHeader";
import { containerVariants, itemVariants, cardVariants } from "../../utils/motionVariants";

function Research() {
  const [viewerReady, setViewerReady] = useState(true);
  const pdfSrc = useMemo(() => getAssetPath(researchPaper.pdfUrl), []);
  usePageSEO();

  return (
    <motion.section
      className="flex flex-col gap-8 w-full pb-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <PageHeader
        title="Research"
        description="Capstone paper on real-time multi-modal threat detection — YOLOv11 + EfficientNetV2 with an adaptive Angular operator console."
      >
        <div className="flex flex-wrap gap-3">
          <a
            href={pdfSrc}
            download="Final_Research_Paper.pdf"
            className="inline-flex items-center gap-2 border-4 border-outline bg-[var(--color-primary-container)] px-4 py-3 font-label-bold text-sm uppercase text-[var(--color-on-primary-container)] shadow-[4px_4px_0_0_var(--shadow-color)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <FaFileDownload aria-hidden="true" />
            Download PDF
          </a>
          <a
            href={pdfSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-4 border-outline bg-[var(--color-surface)] px-4 py-3 font-label-bold text-sm uppercase text-[var(--color-on-surface)] shadow-[4px_4px_0_0_var(--shadow-color)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <FaEye aria-hidden="true" />
            Open PDF
          </a>
          <a
            href={researchPaper.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-4 border-outline bg-[var(--color-surface)] px-4 py-3 font-label-bold text-sm uppercase text-[var(--color-on-surface)] shadow-[4px_4px_0_0_var(--shadow-color)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <FaGithub aria-hidden="true" />
            Code
          </a>
          <a
            href={researchPaper.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-4 border-outline bg-[var(--color-surface)] px-4 py-3 font-label-bold text-sm uppercase text-[var(--color-on-surface)] shadow-[4px_4px_0_0_var(--shadow-color)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <FaExternalLinkAlt aria-hidden="true" />
            Live demo
          </a>
        </div>
      </PageHeader>

      {/* Title block */}
      <motion.article
        className="border-4 border-outline bg-[var(--color-surface)] p-6 md:p-8 shadow-[8px_8px_0_0_var(--shadow-color)] flex flex-col gap-5"
        variants={itemVariants}
      >
        <div className="flex flex-wrap gap-2">
          <span className="border-2 border-outline bg-[var(--color-primary-container)] px-3 py-1 font-label-bold text-xs uppercase text-[var(--color-on-primary-container)]">
            {researchPaper.year}
          </span>
          <span className="border-2 border-outline bg-[var(--color-surface-variant)] px-3 py-1 font-label-bold text-xs uppercase text-[var(--color-on-surface)]">
            {researchPaper.venue}
          </span>
        </div>
        <h2 className="font-headline-md text-2xl md:text-4xl uppercase tracking-tight text-[var(--color-on-surface)] leading-tight">
          {researchPaper.title}
        </h2>
        <p className="font-body-md text-base md:text-lg text-[var(--color-on-surface-variant)] max-w-3xl">
          {researchPaper.subtitle}
        </p>
        <p className="font-label-bold text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)]">
          {researchPaper.affiliation}
        </p>
      </motion.article>

      {/* Highlights */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={containerVariants}
      >
        {researchPaper.highlights.map((stat) => (
          <motion.div
            key={stat.label}
            className="border-4 border-outline bg-[var(--color-surface)] p-5 shadow-[4px_4px_0_0_var(--shadow-color)] flex flex-col gap-2"
            variants={cardVariants}
          >
            <span className="font-label-bold text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              {stat.label}
            </span>
            <span className="font-headline-md text-3xl md:text-4xl text-[var(--color-on-surface)] leading-none">
              {stat.value}
            </span>
            <span className="font-body-md text-sm text-[var(--color-on-surface-variant)]">
              {stat.detail}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Abstract */}
      <motion.div
        className="border-4 border-outline bg-hatch p-6 md:p-8 shadow-[6px_6px_0_0_var(--shadow-color)]"
        variants={itemVariants}
      >
        <h3 className="font-headline-md text-2xl uppercase border-b-4 border-outline pb-2 mb-4 w-fit text-[var(--color-on-surface)]">
          Abstract
        </h3>
        <p className="font-body-lg text-base md:text-lg text-[var(--color-on-surface)] max-w-4xl leading-relaxed bg-[var(--color-surface)] border-4 border-outline p-4 md:p-5 shadow-[4px_4px_0_0_var(--shadow-color)]">
          {researchPaper.abstract}
        </p>
      </motion.div>

      {/* Authors */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        <h3 className="font-headline-md text-2xl uppercase text-[var(--color-on-surface)]">
          Authors
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none m-0 p-0">
          {researchPaper.authors.map((author) => (
            <li
              key={author.email}
              className="border-4 border-outline bg-[var(--color-surface)] p-4 shadow-[4px_4px_0_0_var(--shadow-color)] flex flex-col gap-1"
            >
              <span className="font-label-bold text-[10px] uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                {author.role}
              </span>
              <span className="font-headline-md text-lg uppercase text-[var(--color-on-surface)]">
                {author.name}
              </span>
              <a
                href={`mailto:${author.email}`}
                className="font-body-md text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] underline-offset-2 hover:underline"
              >
                {author.email}
              </a>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Sections */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        variants={containerVariants}
      >
        {researchPaper.sections.map((section) => (
          <motion.div
            key={section.title}
            className="border-4 border-outline bg-[var(--color-surface)] p-5 md:p-6 shadow-[4px_4px_0_0_var(--shadow-color)] flex flex-col gap-3"
            variants={cardVariants}
          >
            <h3 className="font-headline-md text-xl uppercase border-b-4 border-outline pb-2 w-fit text-[var(--color-on-surface)]">
              {section.title}
            </h3>
            <p className="font-body-md text-base text-[var(--color-on-surface)] leading-relaxed">
              {section.body}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Keywords */}
      <motion.div variants={itemVariants} className="flex flex-wrap gap-2">
        {researchPaper.keywords.map((kw) => (
          <span
            key={kw}
            className="border-2 border-outline bg-[var(--color-surface-variant)] px-3 py-1.5 font-label-bold text-xs uppercase text-[var(--color-on-surface)]"
          >
            {kw}
          </span>
        ))}
      </motion.div>

      {/* PDF viewer */}
      <motion.div
        className="border-4 border-outline bg-[var(--color-surface)] shadow-[8px_8px_0_0_var(--shadow-color)] overflow-hidden"
        variants={itemVariants}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-outline bg-[var(--color-primary-container)] px-4 py-3">
          <h3 className="font-headline-md text-lg md:text-xl uppercase text-[var(--color-on-primary-container)]">
            Full paper
          </h3>
          <a
            href={pdfSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-label-bold text-xs uppercase text-[var(--color-on-primary-container)] underline-offset-2 hover:underline"
          >
            Open in new tab
            <FaArrowRight aria-hidden="true" />
          </a>
        </div>
        {viewerReady ? (
          <iframe
            title={`${researchPaper.title} PDF`}
            src={`${pdfSrc}#view=FitH`}
            className="w-full h-[70vh] min-h-[420px] bg-[var(--color-surface)]"
            onError={() => setViewerReady(false)}
          />
        ) : (
          <div className="p-8 text-center font-body-md text-[var(--color-on-surface)]">
            Inline preview unavailable.{" "}
            <a href={pdfSrc} className="underline font-label-bold" download>
              Download the PDF
            </a>{" "}
            instead.
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Link
          to="/projects?highlight=5"
          className="inline-flex items-center gap-2 border-4 border-outline bg-[var(--color-surface)] px-5 py-3 font-label-bold text-sm uppercase text-[var(--color-on-surface)] shadow-[4px_4px_0_0_var(--shadow-color)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          Related project
          <FaArrowRight aria-hidden="true" />
        </Link>
      </motion.div>
    </motion.section>
  );
}

export default memo(Research);
