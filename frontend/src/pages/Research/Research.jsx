import { useEffect, useMemo, useRef, useState, memo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  FaFileDownload,
  FaExternalLinkAlt,
  FaGithub,
  FaEye,
  FaArrowRight,
  FaTimes,
} from "react-icons/fa";
import { researchPapers } from "../../data/research";
import { getAssetPath } from "../../utils/paths";
import { usePageSEO } from "../../utils/seo";
import PageHeader from "../../components/PageHeader/PageHeader";
import {
  containerVariants,
  cardVariants,
} from "../../utils/motionVariants";

const detailVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 280, damping: 28, staggerChildren: 0.06 },
  },
  exit: { opacity: 0, y: 16, transition: { duration: 0.2 } },
};

const detailItem = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 26 } },
};

function Research() {
  const [searchParams, setSearchParams] = useSearchParams();
  const detailRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);

  const seoData = useMemo(() => ({ papers: researchPapers }), []);
  usePageSEO(seoData);

  const selected = useMemo(
    () => researchPapers.find((p) => p.id === selectedId) || null,
    [selectedId],
  );

  useEffect(() => {
    const highlight = searchParams.get("highlight");
    if (!highlight) return;
    if (researchPapers.some((p) => p.id === highlight)) {
      setSelectedId(highlight);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId || !detailRef.current) return;
    const timer = window.setTimeout(() => {
      detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 180);
    return () => window.clearTimeout(timer);
  }, [selectedId]);

  const selectPaper = (id) => {
    if (selectedId === id) {
      clearSelection();
      return;
    }
    setSelectedId(id);
    const next = new URLSearchParams(searchParams);
    next.set("highlight", id);
    setSearchParams(next, { replace: true });
  };

  const clearSelection = () => {
    setSelectedId(null);
    const next = new URLSearchParams(searchParams);
    next.delete("highlight");
    setSearchParams(next, { replace: true });
  };

  return (
    <motion.section
      className="flex flex-col gap-8 w-full pb-16"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <PageHeader
        title="Research"
        count={researchPapers.length}
        description="Papers and technical write-ups. Pick a card to expand abstract, metrics, authors, and the full PDF."
      />

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 overflow-visible p-3 -m-3"
        variants={containerVariants}
      >
        {researchPapers.map((paper, index) => (
          <ResearchCard
            key={paper.id}
            paper={paper}
            index={index}
            isSelected={selectedId === paper.id}
            onSelect={() => selectPaper(paper.id)}
          />
        ))}
      </motion.div>

      <div ref={detailRef} className="scroll-mt-28">
        <AnimatePresence mode="wait">
          {selected && (
            <PaperDetail
              key={selected.id}
              paper={selected}
              onClose={clearSelection}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

const ResearchCard = memo(function ResearchCard({ paper, index, isSelected, onSelect }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      layout
      variants={cardVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{ type: "spring", stiffness: 260, damping: 22, delay: (index % 3) * 0.05 }}
      className="w-full h-full"
    >
      <motion.article
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        aria-label={`Open details for ${paper.title}`}
        onClick={onSelect}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
          }
        }}
        className={`bg-[var(--color-surface)] border-4 border-outline shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col group h-full cursor-none transition-all duration-200 hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0px_0px_var(--shadow-color)] ${
          isSelected ? "ring-4 ring-[var(--color-primary-container)] ring-offset-2 -translate-y-1 -translate-x-1 shadow-[12px_12px_0px_0px_var(--shadow-color)]" : ""
        }`}
        whileTap={{ scale: 0.99 }}
      >
        <div className="border-b-4 border-outline bg-hatch p-5 md:p-6 flex flex-col gap-3 relative overflow-hidden min-h-[140px]">
          <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none" />
          <div className="flex flex-wrap gap-2 relative z-10">
            <span className="bg-[var(--color-on-background)] text-[var(--color-background)] border-2 border-outline px-2 py-1 font-label-bold text-[10px] uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              {paper.year}
            </span>
            <span className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-2 border-outline px-2 py-1 font-label-bold text-[10px] uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)]">
              {paper.category}
            </span>
            {paper.status && (
              <span className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-2 border-outline px-2 py-1 font-label-bold text-[10px] uppercase shadow-[2px_2px_0px_0px_var(--shadow-color)]">
                {paper.status}
              </span>
            )}
          </div>
          <p className="font-label-bold text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] relative z-10">
            {paper.venue}
          </p>
        </div>

        <div className="p-6 md:p-7 flex flex-col grow gap-4">
          <h3 className="font-headline-md text-xl md:text-2xl text-[var(--color-on-surface)] uppercase leading-tight">
            {paper.title}
          </h3>
          <p
            className="font-body-md text-sm text-[var(--color-text-muted)] grow"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {paper.summary}
          </p>
          <div className="flex flex-wrap gap-2">
            {paper.keywords.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="bg-[var(--color-surface-variant)] text-[var(--color-on-surface)] border-2 border-outline px-2 py-1 font-label-bold text-[10px] uppercase"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="border-t-4 border-outline pt-4 mt-auto">
            <span className="inline-flex w-full items-center justify-center gap-2 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline py-3 font-label-bold text-sm uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] group-hover:translate-x-1 group-hover:translate-y-1 group-hover:shadow-none transition-all">
              {isSelected ? "Selected" : "Read paper"}
              <FaArrowRight className="text-sm" aria-hidden="true" />
            </span>
          </div>
        </div>
      </motion.article>
    </motion.div>
  );
});

const PaperDetail = memo(function PaperDetail({ paper, onClose }) {
  const pdfSrc = getAssetPath(paper.pdfUrl);
  const [viewerReady, setViewerReady] = useState(true);

  return (
    <motion.div
      className="flex flex-col gap-6 border-4 border-outline bg-[var(--color-surface)] p-4 md:p-8 shadow-[8px_8px_0_0_var(--shadow-color)]"
      variants={detailVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <motion.div
        className="flex flex-col md:flex-row md:items-start justify-between gap-4"
        variants={detailItem}
      >
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex flex-wrap gap-2">
            <span className="border-2 border-outline bg-[var(--color-primary-container)] px-3 py-1 font-label-bold text-xs uppercase text-[var(--color-on-primary-container)]">
              {paper.year}
            </span>
            <span className="border-2 border-outline bg-[var(--color-surface-variant)] px-3 py-1 font-label-bold text-xs uppercase text-[var(--color-on-surface)]">
              {paper.venue}
            </span>
          </div>
          <h2 className="font-headline-md text-2xl md:text-4xl uppercase tracking-tight text-[var(--color-on-surface)] leading-tight">
            {paper.title}
          </h2>
          <p className="font-body-md text-base md:text-lg text-[var(--color-on-surface-variant)] max-w-3xl">
            {paper.subtitle}
          </p>
          <p className="font-label-bold text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)]">
            {paper.affiliation}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close paper details"
          className="shrink-0 self-end md:self-start border-4 border-outline bg-[var(--color-surface)] w-12 h-12 flex items-center justify-center text-[var(--color-on-surface)] shadow-[4px_4px_0_0_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <FaTimes aria-hidden="true" />
        </button>
      </motion.div>

      <motion.div className="flex flex-wrap gap-3" variants={detailItem}>
        <a
          href={pdfSrc}
          download={paper.pdfFileName || "research-paper.pdf"}
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
        {paper.githubUrl && (
          <a
            href={paper.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-4 border-outline bg-[var(--color-surface)] px-4 py-3 font-label-bold text-sm uppercase text-[var(--color-on-surface)] shadow-[4px_4px_0_0_var(--shadow-color)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <FaGithub aria-hidden="true" />
            Code
          </a>
        )}
        {paper.projectUrl && (
          <a
            href={paper.projectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border-4 border-outline bg-[var(--color-surface)] px-4 py-3 font-label-bold text-sm uppercase text-[var(--color-on-surface)] shadow-[4px_4px_0_0_var(--shadow-color)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            <FaExternalLinkAlt aria-hidden="true" />
            Live demo
          </a>
        )}
        {paper.projectId != null && (
          <Link
            to={`/projects?highlight=${paper.projectId}`}
            className="inline-flex items-center gap-2 border-4 border-outline bg-[var(--color-surface)] px-4 py-3 font-label-bold text-sm uppercase text-[var(--color-on-surface)] shadow-[4px_4px_0_0_var(--shadow-color)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            Related project
            <FaArrowRight aria-hidden="true" />
          </Link>
        )}
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={detailItem}
      >
        {paper.highlights.map((stat) => (
          <div
            key={stat.label}
            className="border-4 border-outline bg-[var(--color-surface)] p-5 shadow-[4px_4px_0_0_var(--shadow-color)] flex flex-col gap-2"
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
          </div>
        ))}
      </motion.div>

      <motion.div
        className="border-4 border-outline bg-hatch p-6 md:p-8 shadow-[6px_6px_0_0_var(--shadow-color)]"
        variants={detailItem}
      >
        <h3 className="font-headline-md text-2xl uppercase border-b-4 border-outline pb-2 mb-4 w-fit text-[var(--color-on-surface)]">
          Abstract
        </h3>
        <p className="font-body-lg text-base md:text-lg text-[var(--color-on-surface)] max-w-4xl leading-relaxed bg-[var(--color-surface)] border-4 border-outline p-4 md:p-5 shadow-[4px_4px_0_0_var(--shadow-color)]">
          {paper.abstract}
        </p>
      </motion.div>

      <motion.div className="flex flex-col gap-4" variants={detailItem}>
        <h3 className="font-headline-md text-2xl uppercase text-[var(--color-on-surface)]">
          Authors
        </h3>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 list-none m-0 p-0">
          {paper.authors.map((author) => (
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

      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={detailItem}>
        {paper.sections.map((section) => (
          <div
            key={section.title}
            className="border-4 border-outline bg-[var(--color-surface)] p-5 md:p-6 shadow-[4px_4px_0_0_var(--shadow-color)] flex flex-col gap-3"
          >
            <h3 className="font-headline-md text-xl uppercase border-b-4 border-outline pb-2 w-fit text-[var(--color-on-surface)]">
              {section.title}
            </h3>
            <p className="font-body-md text-base text-[var(--color-on-surface)] leading-relaxed">
              {section.body}
            </p>
          </div>
        ))}
      </motion.div>

      <motion.div className="flex flex-wrap gap-2" variants={detailItem}>
        {paper.keywords.map((kw) => (
          <span
            key={kw}
            className="border-2 border-outline bg-[var(--color-surface-variant)] px-3 py-1.5 font-label-bold text-xs uppercase text-[var(--color-on-surface)]"
          >
            {kw}
          </span>
        ))}
      </motion.div>

      <motion.div
        className="border-4 border-outline bg-[var(--color-surface)] shadow-[8px_8px_0_0_var(--shadow-color)] overflow-hidden"
        variants={detailItem}
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
            title={`${paper.title} PDF`}
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
    </motion.div>
  );
});

export default memo(Research);
