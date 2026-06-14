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

import { containerVariants, itemVariants } from "../../utils/motionVariants";

const carouselVariants = {
  hidden:  { opacity: 0, x: 80, scale: 0.95 },
  visible: {
    opacity: 1, x: 0, scale: 1,
    transition: { type: "spring", stiffness: 220, damping: 22, delay: 0.2 },
  },
};

// ─── Data ─────────────────────────────────────────────────────

const roles = ["Web Developer", "AI Engineer", "Tech Enthusiast", "Problem Solver"];

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
      className="border-4 border-outline p-4 md:p-6 shadow-[4px_4px_0px_0px_var(--shadow-color)] text-center"
      style={bgStyle}
      initial={{ opacity: 0, y: 40, scale: 0.88 }}
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ type: "spring", stiffness: 350, damping: 18, delay }}
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
              className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-[var(--color-on-background)] uppercase leading-none bg-[var(--color-surface)] border-4 border-outline p-3 md:p-4 shadow-[8px_8px_0px_0px_var(--shadow-color)] inline-block w-fit relative overflow-hidden"
              whileHover={{
                x: -2,
                y: -2,
                boxShadow: "12px 12px 0px 0px var(--shadow-color)",
                transition: { type: "spring", stiffness: 400, damping: 20 },
              }}
            >
              <div className="absolute inset-0 animate-shimmer opacity-20 pointer-events-none" />
              {aboutInfo.name}
            </motion.h1>
          </motion.div>

          {/* Role typewriter */}
          <motion.h2
            className="font-headline-md text-xl md:text-2xl lg:text-headline-md text-[var(--color-on-primary-container)] bg-[var(--color-primary-container)] border-4 border-outline p-2 px-4 w-fit shadow-[4px_4px_0px_0px_var(--shadow-color)] uppercase"
            variants={itemVariants}
          >
            <TypeWriter texts={roles} speed={80} deleteSpeed={40} pauseTime={2500} />
          </motion.h2>

          {/* Bio */}
          <motion.p
            className="font-body-lg text-base md:text-lg lg:text-body-lg text-[var(--color-on-surface)] bg-[var(--color-surface)] border-4 border-outline p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] max-w-2xl"
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
              className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-150 inline-block animate-pulse-glow"
            >
              View My Work
            </MagneticLink>
            <MagneticLink
              to="/contact"
              className="bg-[var(--color-on-background)] text-[var(--color-background)] border-4 border-outline px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase shadow-[8px_8px_0px_0px_var(--shadow-accent)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-accent)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-150 inline-block"
            >
              Work With Me
            </MagneticLink>
            <MagneticLink
              to="/about"
              className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-outline px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase shadow-[4px_4px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none hover:bg-[var(--color-surface-variant)] transition-all duration-150 inline-block"
            >
              About Me
            </MagneticLink>
          </motion.div>
        </div>

        {/* Carousel Placeholder / Blank Space */}
        <motion.div
          className="flex-1 w-full flex justify-center lg:justify-end mt-8 lg:mt-0"
          variants={carouselVariants}
        >
          {/* Moved to About page */}
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
        className="border-4 border-outline overflow-hidden py-3 -mx-4 md:-mx-8 relative"
        style={{ background: "var(--color-on-background)" }}
        variants={itemVariants}
      >
        {/* Fade edges */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(90deg, var(--color-on-background), transparent)" }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
          style={{ background: "linear-gradient(-90deg, var(--color-on-background), transparent)" }}
        />
        <div className="marquee-strip flex gap-10 whitespace-nowrap">
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className="flex gap-10 items-center font-label-bold text-sm uppercase tracking-widest shrink-0"
              style={{ color: "var(--color-background)" }}
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
