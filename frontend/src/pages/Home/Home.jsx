import { lazy, memo, Suspense } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { aboutInfo } from "../../data/experience";
import { portfolioStats } from "../../data/stats";
import TypeWriter from "../../components/TypeWriter/TypeWriter";
import StatCard from "../../components/StatCard/StatCard";
import MagneticLink from "../../components/MagneticLink/MagneticLink";

import { itemVariants } from "../../utils/motionVariants";

const TechGlobe = lazy(() => import("../../components/TechGlobe/TechGlobe"));

const carouselVariants = {
  hidden:  { opacity: 0, x: 48, scale: 0.97 },
  visible: {
    opacity: 1, x: 0, scale: 1,
    transition: { type: "spring", stiffness: 170, damping: 28, delay: 0.18 },
  },
};

// ─── Data ─────────────────────────────────────────────────────

const roles = ["Web Developer", "AI Engineer", "Tech Enthusiast", "Problem Solver"];

// ─── Page ─────────────────────────────────────────────────────

const Home = memo(function Home() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.35], [0, -52]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.97]);
  const totalProjects = portfolioStats.projects;
  const totalSkills   = portfolioStats.skills;
  const totalCerts    = portfolioStats.certifications;

  return (
    <motion.section
      className="flex flex-col gap-10 lg:gap-14 min-h-[calc(100vh-200px)] w-full relative"
    >
      {/* Hero row */}
      <div className="flex flex-col lg:flex-row gap-10 xl:gap-14 items-center justify-between lg:min-h-[560px] relative z-10">
        {/* Text content */}
        <div className="flex-1 flex flex-col gap-4 lg:gap-5 max-w-2xl w-full z-10">

          {/* Name heading with shimmer */}
          <motion.div variants={itemVariants}>
            <motion.h1
              className="font-headline-xl text-5xl md:text-6xl xl:text-8xl text-[var(--color-on-background)] uppercase leading-none bg-[var(--color-surface)] border-4 border-outline p-3 md:p-4 shadow-[8px_8px_0px_0px_var(--shadow-color)] inline-block w-fit relative overflow-hidden"
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
            className="font-headline-md text-lg md:text-2xl text-[var(--color-on-primary-container)] bg-[var(--color-primary-container)] border-4 border-outline p-2 px-4 w-fit shadow-[4px_4px_0px_0px_var(--shadow-color)] uppercase"
            variants={itemVariants}
          >
            <TypeWriter texts={roles} speed={80} deleteSpeed={40} pauseTime={2500} />
          </motion.h2>

          {/* Bio */}
          <motion.p
            className="font-body-lg text-base md:text-lg text-[var(--color-on-surface)] bg-[var(--color-surface)] border-4 border-outline p-4 md:p-5 shadow-[4px_4px_0px_0px_var(--shadow-color)] max-w-xl"
            variants={itemVariants}
          >
            I build fast, high-contrast web products and AI systems that feel
            sharp, useful, and memorable. Start with the work, search the site,
            or jump straight into the CLI.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-wrap items-center gap-3 md:gap-4 mt-2"
            variants={itemVariants}
          >
            <MagneticLink
              to="/projects"
              className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-200 inline-block animate-pulse-glow"
            >
              View My Work
            </MagneticLink>
            <span className="font-label-bold text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              or press Ctrl/Alt+K
            </span>
          </motion.div>

        </div>

        {/* Signature 3D showcase */}
        <motion.div
          className="flex-1 w-full flex justify-center lg:justify-end mt-6 lg:mt-0"
          variants={carouselVariants}
          style={{ y: heroY, scale: heroScale }}
        >
          <Suspense fallback={<div className="w-full max-w-[560px] aspect-square border-4 border-outline bg-[var(--color-surface)] shadow-[8px_8px_0_var(--shadow-color)]" />}>
            <TechGlobe />
          </Suspense>
        </motion.div>
      </div>

      {/* Stats ribbon */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full"
        variants={itemVariants}
      >
        <StatCard to="/projects" value={totalProjects} label="Projects"      bg="var(--color-primary-container)" text="var(--color-on-primary-container)" />
        <StatCard to="/skills" value={totalSkills}   isPlus label="Skills" bg="var(--color-on-background)" text="var(--color-background)" />
        <StatCard to="/certifications" value={totalCerts}    label="Certifications" bg="var(--color-surface)" text="var(--color-on-surface)" />
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
              <span>+ Web Developer</span>
              <span>+ AI Engineer</span>
              <span>+ React / Next.js / FastAPI</span>
              <span>+ Gemini / LangGraph</span>
              <span>+ Open to Opportunities</span>
              <span>+ Click, Search, Navigate</span>
            </span>
          ))}
        </div>
      </motion.div>
    </motion.section>
  );
});

export default Home;
