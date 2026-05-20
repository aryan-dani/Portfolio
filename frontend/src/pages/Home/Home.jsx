import { memo, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { aboutInfo } from "../../data/experience";
import { projects } from "../../data/projects";
import { skills } from "../../data/skills";
import { certifications } from "../../data/certifications";
import { getAssetPath } from "../../utils/paths";
import TypeWriter from "../../components/TypeWriter/TypeWriter";

// ─── Animation variants ────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

const carouselVariants = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 200, damping: 20 },
  },
};

// slide directions (removed rotation)
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 300, damping: 30 },
  },
  exit: (direction) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
    transition: { duration: 0.3 },
  }),
};

// ─── Data ─────────────────────────────────────────────────────────────────

const roles = [
  "Web Developer",
  "AI Engineer",
  "Tech Enthusiast",
  "Problem Solver",
];

const photos = [
  { src: "Images/Home/pic_1.jpg", alt: `${aboutInfo.name} – photo 1` },
  { src: "Images/Home/pic_2.jpg", alt: `${aboutInfo.name} – photo 2` },
];

const INTERVAL_MS = 3500;

// ─── Stats Ribbon ─────────────────────────────────────────────────────────

function StatsRibbon() {
  const totalProjects = projects.length;
  const totalSkills = Object.values(skills).flat().length;
  const totalCerts = certifications.length;

  return (
    <motion.div
      className="grid grid-cols-3 gap-4 w-full"
      variants={itemVariants}
    >
      {[
        { value: totalProjects, label: "Projects", bg: "bg-primary-container" },
        { value: `${totalSkills}+`, label: "Skills", bg: "bg-black text-white" },
        { value: totalCerts, label: "Certifications", bg: "bg-white" },
      ].map((stat) => (
        <div
          key={stat.label}
          className={`${stat.bg} border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all`}
        >
          <div className="font-headline-xl text-3xl md:text-4xl">{stat.value}</div>
          <div className="font-label-bold text-xs uppercase mt-1">{stat.label}</div>
        </div>
      ))}
    </motion.div>
  );
}

// ─── Carousel sub-component ───────────────────────────────────────────────

function PhotoCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const go = useCallback(
    (next) => {
      const nextIdx = (next + photos.length) % photos.length;
      setDirection(next > index ? 1 : -1);
      setIndex(nextIdx);
    },
    [index]
  );

  // Auto-advance
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % photos.length);
    }, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [isPaused]);

  return (
    <div
      className="relative w-full max-w-sm md:max-w-md"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* ── Main frame ── */}
      <div
        className="relative aspect-square border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden"
        style={{ userSelect: "none" }}
      >
        {/* Slide area */}
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
            <img
              src={getAssetPath(photos[index].src)}
              alt={photos[index].alt}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
            />
          </motion.div>
        </AnimatePresence>

        {/* ── Arrow buttons ── */}
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

        {/* ── Index badge (top-right corner) ── */}
        <div className="absolute top-2 right-2 z-20 bg-primary-container border-2 border-black px-2 py-0.5 text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {index + 1} / {photos.length}
        </div>
      </div>

      {/* ── Dot navigation ── */}
      <div className="flex items-center justify-center gap-3 mt-4">
        {photos.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to photo ${i + 1}`}
            className={`border-2 border-black transition-all duration-200 ${
              i === index
                ? "w-6 h-4 bg-primary-container shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                : "w-4 h-4 bg-white hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
            }`}
          />
        ))}
      </div>

      {/* ── Progress bar ── */}
      <div className="mt-3 h-1.5 bg-white border-2 border-black overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        <motion.div
          className="h-full bg-primary-container"
          key={`progress-${index}`}
          initial={{ width: "0%" }}
          animate={{ width: isPaused ? undefined : "100%" }}
          transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

const Home = memo(function Home() {
  return (
    <motion.section
      className="flex flex-col gap-12 lg:gap-16 min-h-[calc(100vh-200px)] w-full relative"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero row */}
      <div className="flex flex-col lg:flex-row gap-gutter items-center justify-between lg:min-h-[600px] relative z-10">
        {/* ── Text content ── */}
        <div className="flex-1 flex flex-col gap-6 lg:gap-8 max-w-3xl w-full z-10">
          <motion.h1
            className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-on-background uppercase wrap-break-word leading-none bg-white neo-border p-3 md:p-4 neo-shadow inline-block w-fit"
            variants={itemVariants}
          >
            {aboutInfo.name}
          </motion.h1>

          <motion.h2
            className="font-headline-md text-xl md:text-2xl lg:text-headline-md text-on-surface-variant bg-primary-container neo-border p-2 w-fit neo-shadow uppercase"
            variants={itemVariants}
          >
            <TypeWriter
              texts={roles}
              speed={80}
              deleteSpeed={40}
              pauseTime={2500}
            />
          </motion.h2>

          <motion.p
            className="font-body-lg text-base md:text-lg lg:text-body-lg text-on-background bg-white neo-border p-4 neo-shadow max-w-2xl"
            variants={itemVariants}
          >
            I&apos;m a passionate Web Developer and AI Engineer, dedicated to
            crafting seamless, high-performance web solutions. Discover my
            projects, skills, and certifications below.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-4 mt-4 lg:mt-8"
            variants={itemVariants}
          >
            <Link
              to="/projects"
              className="bg-primary-container text-black neo-border px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase neo-shadow transition-all neo-shadow-hover neo-shadow-active inline-block"
            >
              View My Work
            </Link>
            <Link
              to="/contact"
              className="bg-black text-white neo-border px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase shadow-[8px_8px_0px_0px_rgba(240,255,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(240,255,0,1)] inline-block"
            >
              Work With Me
            </Link>
            <Link
              to="/about"
              className="bg-white text-black neo-border px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase neo-shadow transition-all neo-shadow-hover neo-shadow-active inline-block"
            >
              About Me
            </Link>
          </motion.div>
        </div>

        {/* ── Carousel ── */}
        <motion.div
          className="flex-1 w-full flex justify-center lg:justify-end mt-12 lg:mt-0"
          variants={carouselVariants}
        >
          <PhotoCarousel />
        </motion.div>
      </div>

      {/* Stats Ribbon */}
      <StatsRibbon />

      {/* Marquee strip */}
      <motion.div
        className="bg-black border-4 border-black overflow-hidden py-3 -mx-4 md:-mx-8"
        variants={itemVariants}
      >
        <div className="marquee-strip flex gap-8 whitespace-nowrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} className="flex gap-8 items-center text-primary-container font-label-bold text-sm uppercase tracking-widest shrink-0">
              <span>✦ Web Developer</span>
              <span>✦ AI Engineer</span>
              <span>✦ React • Next.js • FastAPI</span>
              <span>✦ Gemini • LangGraph</span>
              <span>✦ Open to Opportunities</span>
              <span>✦ Let's Build Something Epic</span>
            </span>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
});

export default Home;
