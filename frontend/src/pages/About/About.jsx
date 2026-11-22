import { useState, useRef, memo, useCallback, lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  FaEnvelope,
  FaArrowRight,
} from "react-icons/fa";
import { aboutInfo, socialLinks } from "../../data/experience";
import { useToast } from "../../context/ToastContext";
import { getAssetPath } from "../../utils/paths";
import { usePageSEO } from "../../utils/seo";
import PageHeader from "../../components/PageHeader/PageHeader";
import { containerVariants, itemVariants } from "../../utils/motionVariants";
import { socialIconMap } from "../../utils/socialIcons";
import ProgressiveImage from "../../components/ProgressiveImage/ProgressiveImage";

import GitHubTicker from "../../components/GitHubTicker/GitHubTicker";
import GitCareerTimeline from "../../components/GitCareerTimeline/GitCareerTimeline";

import ResumeActions from "../../components/ResumeModal/ResumeActions";
import { AVAILABILITY, PRIMARY_CTA } from "../../data/availability";
import { trackActionClick } from "../../utils/funnel";

const GitHubStats = lazy(() => import("../../components/GitHubStats/GitHubStats"));
const ResumeModal = lazy(() => import("../../components/ResumeModal/ResumeModal"));

const slideVariants = {
  enter:  (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 32 } },
  exit:   (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.28 } }),
};

const photos = [
  { src: "Images/About/pic_1.jpg", alt: `${aboutInfo.name} – photo 1` },
  { src: "Images/About/pic_2.jpg", alt: `${aboutInfo.name} – photo 2` },
  { src: "Images/About/pic_3.jpg", alt: `${aboutInfo.name} – photo 3` },
];

function PhotoCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = useCallback(
    (next) => {
      const nextIdx = (next + photos.length) % photos.length;
      setDirection(next > index ? 1 : -1);
      setIndex(nextIdx);
    },
    [index],
  );

  return (
    <div className="relative w-full">
      {/* Main frame — manual navigation only (no auto-advance) */}
      <div
        className="relative aspect-square border-4 border-outline bg-surface shadow-[8px_8px_0px_0px_var(--shadow-color)] overflow-hidden"
        style={{ userSelect: "none" }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            className="absolute inset-0"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
          >
            <ProgressiveImage
              src={getAssetPath(photos[index].src)}
              alt={photos[index].alt}
              width="720"
              height="720"
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="w-full h-full"
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : undefined}
            />
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => go(index - 1)}
          aria-label="Previous photo"
          className="nb-carousel-arrow absolute left-2 top-1/2 -translate-y-1/2 z-20"
        >
          ‹
        </button>
        <button
          onClick={() => go(index + 1)}
          aria-label="Next photo"
          className="nb-carousel-arrow absolute right-2 top-1/2 -translate-y-1/2 z-20"
        >
          ›
        </button>

        <div className="absolute top-2 right-2 z-20 bg-primary-container text-on-primary-container border-2 border-outline px-2 py-0.5 text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_var(--shadow-color)]">
          {index + 1} / {photos.length}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-4">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to photo ${i + 1}`}
            className={`border-2 border-outline transition-all duration-200 ${
              i === index
                ? "w-6 h-4 bg-primary-container shadow-[2px_2px_0px_0px_var(--shadow-color)]"
                : "w-4 h-4 bg-surface hover:bg-surface-variant shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function About() {
  usePageSEO();
  const { showToast } = useToast();
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [resumeVersion, setResumeVersion] = useState("classic");

  const copyEmail = () => {
    navigator.clipboard.writeText(aboutInfo.email);
    showToast("Email copied to clipboard!", "success");
  };

  return (
    <motion.section
      className="flex flex-col gap-16 md:gap-20 w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header */}
      <PageHeader
        title="About Me"
        description="Full-stack developer with a passion for clean code. Building innovative solutions across the tech stack."
        className="mb-8"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Photo + Bio */}
        <motion.div className="flex flex-col gap-12" variants={itemVariants}>
          <div className="relative group">
              <PhotoCarousel />
            {/* Name badge */}
            <motion.div
              className="absolute -top-6 -left-6 z-30 border-4 border-outline px-6 py-3 font-headline-md text-2xl uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)]"
              style={{ background: "var(--color-on-background)", color: "var(--color-background)" }}
              initial={{ opacity: 0, scale: 0.8, x: -10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 280, damping: 22 }}
            >
              {aboutInfo.name}
            </motion.div>
          </div>

          {/* Bio */}
          <motion.div
            className="bg-surface border-4 border-outline p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)] mt-8"
            variants={itemVariants}
          >
            <h2 className="font-headline-md text-3xl uppercase mb-6 border-b-4 border-outline pb-4 text-on-surface">
              The Story
            </h2>
            <div className="font-body-md text-lg space-y-4 text-on-surface-variant">
              {aboutInfo.bio.split("\n\n").map((paragraph, i) => (
                <p key={i} className="leading-relaxed">{paragraph}</p>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right: Title + Highlights + CTA */}
        <motion.div className="flex flex-col gap-12" variants={containerVariants}>
          {/* Title + social icons */}
          <motion.div
            className="border-4 border-outline p-8 shadow-[8px_8px_0px_0px_var(--shadow-color)]"
            style={{ background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }}
            variants={itemVariants}
          >
            <h2 className="font-headline-md text-3xl uppercase mb-2">{aboutInfo.title}</h2>
            <p className="font-label-bold text-xl uppercase mb-8 border-b-4 border-outline pb-4 opacity-80">
              {aboutInfo.tagline}
            </p>
            <div className="flex flex-wrap gap-4">
              <motion.button
                type="button"
                onClick={copyEmail}
                className="bg-surface text-on-surface border-4 border-outline h-12 px-4 flex items-center justify-center gap-2 text-sm font-label-bold uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none hover:bg-primary-container hover:text-on-primary-container transition-all cursor-none"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaEnvelope />
                Copy Email
              </motion.button>
              {socialLinks.map((link) => {
                const Icon = socialIconMap[link.name];
                return Icon ? (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-surface text-on-surface border-4 border-outline w-12 h-12 flex items-center justify-center text-2xl shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-y-1 hover:translate-x-1 hover:shadow-none hover:bg-on-background hover:text-background transition-all cursor-none"
                    aria-label={link.name}
                    title={link.name}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon />
                  </motion.a>
                ) : null;
              })}
            </div>
          </motion.div>

          {/* Highlights */}
          <div className="flex flex-col gap-6">
            <motion.h2 className="font-headline-md text-3xl uppercase text-on-surface" variants={itemVariants}>
              Why work with me
            </motion.h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch overflow-visible p-3 -m-3">
              {aboutInfo.highlights.map((highlight, index) => (
                <HighlightCard key={index} highlight={highlight} index={index} />
              ))}
            </div>
          </div>

          {/* CTA */}
          <motion.div
            className="border-4 border-outline p-8 shadow-[8px_8px_0px_0px_var(--shadow-accent)] relative overflow-hidden m-3"
            style={{ background: "var(--color-on-background)", color: "var(--color-background)" }}
            variants={itemVariants}
            whileHover={{ x: -2, y: -2, boxShadow: "14px 14px 0px 0px var(--shadow-accent)" }}
          >

            <h3 className="font-headline-md text-3xl uppercase mb-4">Let&apos;s Connect</h3>
            <p className="font-body-md text-lg mb-3 opacity-70">
              {AVAILABILITY.label}. Open to client projects and thoughtful collaborations.
            </p>
            <p className="font-body-md text-base mb-6 opacity-70">
              {AVAILABILITY.detail}
            </p>
            <div className="flex flex-col gap-4">
              <Link
                to={PRIMARY_CTA.to}
                onClick={() => trackActionClick(PRIMARY_CTA.label, PRIMARY_CTA.to)}
                className="btn-cta-get-in-touch px-6 py-4 font-headline-md text-xl uppercase flex items-center justify-center gap-3 hover:translate-y-1 hover:translate-x-1 hover:shadow-[2px_2px_0px_0px_var(--color-background)] transition-all w-full cursor-none"
              >
                <FaArrowRight />
                <span>{PRIMARY_CTA.label}</span>
              </Link>
              <p className="font-body-md text-sm opacity-70">
                Recruiters: download the resume below.
              </p>
              <ResumeActions
                onView={(id) => {
                  setResumeVersion(id);
                  setIsResumeOpen(true);
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div className="flex flex-col gap-8" variants={itemVariants}>
        <GitHubTicker />
        <GitCareerTimeline />
      </motion.div>

      <Suspense fallback={null}>
        <GitHubStats />
      </Suspense>

      {isResumeOpen && (
        <Suspense fallback={null}>
          <ResumeModal
            isOpen={isResumeOpen}
            initialVersion={resumeVersion}
            onClose={() => setIsResumeOpen(false)}
          />
        </Suspense>
      )}
    </motion.section>
  );
}

// ── Highlight Card ────────────────────────────────────────────

function HighlightCard({ highlight, index }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      className="bg-surface border-4 border-outline p-6 shadow-[6px_6px_0px_0px_var(--shadow-color)] flex flex-col h-full"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 280, damping: 22, delay: index * 0.08 }}
      whileHover={{ y: -4, x: -4, boxShadow: "12px 12px 0px 0px var(--shadow-color)", transition: { type: "spring", stiffness: 400, damping: 20 } }}
    >
      <motion.span
        className="text-4xl mb-4 block border-2 border-outline w-fit p-2 bg-surface-variant shadow-[2px_2px_0px_0px_var(--shadow-color)]"
        animate={inView ? { y: [0, -6, 0, -3, 0] } : {}}
        transition={{ duration: 0.65, delay: index * 0.12 + 0.35 }}
        whileHover={{ y: [0, -5, 0, -3, 0], transition: { duration: 0.5 } }}
      >
        {highlight.icon}
      </motion.span>
      <h4 className="font-headline-md text-xl uppercase mb-2 text-on-surface">
        {highlight.title}
      </h4>
      <p className="font-body-md text-base text-on-surface-variant">
        {highlight.description}
      </p>
    </motion.div>
  );
}

export default memo(About);
