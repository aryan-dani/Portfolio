import { memo, useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { aboutInfo } from "../../data/experience";
import { projects } from "../../data/projects";
import { skills } from "../../data/skills";
import { certifications } from "../../data/certifications";
import { getAssetPath } from "../../utils/paths";
import TypeWriter from "../../components/TypeWriter/TypeWriter";
import { useCountUp } from "../../hooks/useCountUp";

// ─── Animation variants ────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: {
    opacity: 1, y: 0,
    transition: { type: "spring", stiffness: 280, damping: 22 },
  },
};

const carouselVariants = {
  hidden:  { opacity: 0, x: 80, scale: 0.95 },
  visible: {
    opacity: 1, x: 0, scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 22, delay: 0.2 },
  },
};

const slideVariants = {
  enter:  (dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 320, damping: 32 } },
  exit:   (dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0, transition: { duration: 0.28 } }),
};

// ─── Data ─────────────────────────────────────────────────────

const roles = ["Web Developer", "AI Engineer", "Tech Enthusiast", "Problem Solver"];

const photos = [
  { src: "Images/Home/pic_1.jpg", alt: `${aboutInfo.name} – photo 1` },
  { src: "Images/Home/pic_2.jpg", alt: `${aboutInfo.name} – photo 2` },
];

const INTERVAL_MS = 3800;

// ─── Animated Stat Card ────────────────────────────────────────

function StatCard({ value, isPlus, label, bg, delay }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const displayNum = useCountUp(typeof value === "number" ? value : parseInt(value), {
    duration: 1600,
    trigger: inView,
  });

  const bgStyle = bg === "accent"
    ? { background: "var(--color-primary-container)", color: "var(--color-on-primary-container)" }
    : bg === "dark"
    ? { background: "var(--color-on-background)", color: "var(--color-background)" }
    : { background: "var(--color-surface)", color: "var(--color-on-surface)" };

  return (
    <motion.div
      ref={ref}
      className="border-4 border-[var(--color-outline)] p-4 md:p-6 shadow-[4px_4px_0px_0px_var(--shadow-color)] text-center"
      style={bgStyle}
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 24, delay }}
      whileHover={{
        y: -4,
        x: -4,
        boxShadow: "8px 8px 0px 0px var(--shadow-color)",
        transition: { type: "spring", stiffness: 400, damping: 20 },
      }}
    >
      <div className="font-headline-xl text-3xl md:text-4xl font-black">
        {displayNum}{isPlus && "+"}
      </div>
      <div className="font-label-bold text-xs uppercase mt-1 tracking-wider opacity-80">
        {label}
      </div>
    </motion.div>
  );
}

// ─── Photo Carousel ───────────────────────────────────────────

function PhotoCarousel() {
  const [index, setIndex]     = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused]   = useState(false);

  const go = useCallback(
    (next) => {
      const nextIdx = (next + photos.length) % photos.length;
      setDirection(next > index ? 1 : -1);
      setIndex(nextIdx);
    },
    [index]
  );

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
        {/* Main frame */}
        <div
          className="relative aspect-square border-4 border-[var(--color-outline)] bg-[var(--color-surface)] shadow-[8px_8px_0px_0px_var(--shadow-color)] overflow-hidden"
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
              <img
                src={getAssetPath(photos[index].src)}
                alt={photos[index].alt}
                className="w-full h-full object-cover transition-all duration-700"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />
            </motion.div>
          </AnimatePresence>

          {/* Arrow buttons */}
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

          {/* Index badge */}
          <div className="absolute top-2 right-2 z-20 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-2 border-[var(--color-outline)] px-2 py-0.5 text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_var(--shadow-color)]">
            {index + 1} / {photos.length}
          </div>
        </div>

        {/* Dot navigation */}
        <div className="flex items-center justify-center gap-3 mt-4">
          {photos.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to photo ${i + 1}`}
              className={`border-2 border-[var(--color-outline)] transition-all duration-200 ${
                i === index
                  ? "w-6 h-4 bg-[var(--color-primary-container)] shadow-[2px_2px_0px_0px_var(--shadow-color)]"
                  : "w-4 h-4 bg-[var(--color-surface)] hover:bg-[var(--color-surface-variant)] shadow-[2px_2px_0px_0px_var(--shadow-color)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
              }`}
            />
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1.5 bg-[var(--color-surface)] border-2 border-[var(--color-outline)] overflow-hidden shadow-[2px_2px_0px_0px_var(--shadow-color)]">
          <motion.div
            className="h-full bg-[var(--color-primary-container)] progress-bar-fill"
            key={`progress-${index}`}
            initial={{ width: "0%" }}
            animate={{ width: isPaused ? undefined : "100%" }}
            transition={{ duration: INTERVAL_MS / 1000, ease: "linear" }}
          />
        </div>
    </div>
  );
}

// ─── Magnetic Button ──────────────────────────────────────────

function MagneticLink({ to, className, children }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.25;
    const dy = (e.clientY - cy) * 0.25;
    setOffset({ x: dx, y: dy });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setOffset({ x: 0, y: 0 });
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: offset.x, y: offset.y }}
      transition={{ type: "spring", stiffness: 350, damping: 20 }}
    >
      <Link to={to} className={className}>
        {children}
      </Link>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

const Home = memo(function Home() {
  const totalProjects = projects.length;
  const totalSkills   = Object.values(skills).flat().length;
  const totalCerts    = certifications.length;

  return (
    <motion.section
      className="flex flex-col gap-12 lg:gap-16 min-h-[calc(100vh-200px)] w-full relative"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Hero row */}
      <div className="flex flex-col lg:flex-row gap-8 items-center justify-between lg:min-h-[600px] relative z-10">
        {/* Text content */}
        <div className="flex-1 flex flex-col gap-5 lg:gap-7 max-w-3xl w-full z-10">

          {/* Name heading with shimmer */}
          <motion.div variants={itemVariants}>
            <motion.h1
              className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-[var(--color-on-background)] uppercase leading-none bg-[var(--color-surface)] border-4 border-[var(--color-outline)] p-3 md:p-4 shadow-[8px_8px_0px_0px_var(--shadow-color)] inline-block w-fit relative overflow-hidden"
              whileHover={{
                x: -2,
                y: -2,
                boxShadow: "12px 12px 0px 0px var(--shadow-color)",
                transition: { type: "spring", stiffness: 400, damping: 20 },
              }}
            >
              {aboutInfo.name}
            </motion.h1>
          </motion.div>

          {/* Role typewriter */}
          <motion.h2
            className="font-headline-md text-xl md:text-2xl lg:text-headline-md text-[var(--color-on-primary-container)] bg-[var(--color-primary-container)] border-4 border-[var(--color-outline)] p-2 px-4 w-fit shadow-[4px_4px_0px_0px_var(--shadow-color)] uppercase"
            variants={itemVariants}
          >
            <TypeWriter texts={roles} speed={80} deleteSpeed={40} pauseTime={2500} />
          </motion.h2>

          {/* Bio */}
          <motion.p
            className="font-body-lg text-base md:text-lg lg:text-body-lg text-[var(--color-on-surface)] bg-[var(--color-surface)] border-4 border-[var(--color-outline)] p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] max-w-2xl"
            variants={itemVariants}
          >
            I&apos;m a passionate Web Developer and AI Engineer, dedicated to
            crafting seamless, high-performance web solutions. Discover my
            projects, skills, and certifications below.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-wrap gap-4 mt-2 lg:mt-4"
            variants={itemVariants}
          >
            <MagneticLink
              to="/projects"
              className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-[var(--color-outline)] px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-150 inline-block"
            >
              View My Work
            </MagneticLink>
            <MagneticLink
              to="/contact"
              className="bg-[var(--color-on-background)] text-[var(--color-background)] border-4 border-[var(--color-outline)] px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase shadow-[8px_8px_0px_0px_var(--shadow-accent)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-accent)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-150 inline-block"
            >
              Work With Me
            </MagneticLink>
            <MagneticLink
              to="/about"
              className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-[var(--color-outline)] px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-[var(--color-surface-variant)] transition-all duration-150 inline-block"
            >
              About Me
            </MagneticLink>
          </motion.div>
        </div>

        {/* Carousel */}
        <motion.div
          className="flex-1 w-full flex justify-center lg:justify-end mt-8 lg:mt-0"
          variants={carouselVariants}
        >
          <PhotoCarousel />
        </motion.div>
      </div>

      {/* Stats ribbon */}
      <motion.div
        className="grid grid-cols-3 gap-4 w-full"
        variants={itemVariants}
      >
        <StatCard value={totalProjects} label="Projects"      bg="accent" delay={0} />
        <StatCard value={totalSkills}   isPlus label="Skills" bg="dark"   delay={0.08} />
        <StatCard value={totalCerts}    label="Certifications" bg="light" delay={0.16} />
      </motion.div>

      {/* Marquee strip */}
      <motion.div
        className="border-4 border-[var(--color-outline)] overflow-hidden py-3 -mx-4 md:-mx-8 relative"
        style={{ background: "#0D0D0D" }}
        variants={itemVariants}
      >
        {/* Fade edges */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(90deg, #0D0D0D, transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(-90deg, #0D0D0D, transparent)" }}
        />
        <div className="marquee-strip flex gap-10 whitespace-nowrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className="flex gap-10 items-center font-label-bold text-sm uppercase tracking-widest shrink-0"
              style={{ color: "var(--color-primary-container)" }}
            >
              <span>✦ Web Developer</span>
              <span>✦ AI Engineer</span>
              <span>✦ React • Next.js • FastAPI</span>
              <span>✦ Gemini • LangGraph</span>
              <span>✦ Open to Opportunities</span>
              <span>✦ Let&apos;s Build Something Epic</span>
            </span>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
});

export default Home;
