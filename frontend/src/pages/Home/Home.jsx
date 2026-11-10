import { lazy, memo, Suspense, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { aboutInfo } from "../../data/experience";
import { portfolioStats } from "../../data/stats";
import TypeWriter from "../../components/TypeWriter/TypeWriter";
import StatCard from "../../components/StatCard/StatCard";
import MagneticLink from "../../components/MagneticLink/MagneticLink";
import { usePageSEO } from "../../utils/seo";
import { containerVariants, itemVariants } from "../../utils/motionVariants";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { MOBILE_LITE_QUERY, FINE_POINTER_QUERY } from "../../utils/device";
import { usePrefetchPortfolioImages } from "../../hooks/usePrefetchPortfolioImages";
import TechGlobeFallback from "../../components/TechGlobe/TechGlobeFallback";

const TechGlobe = lazy(() => import("../../components/TechGlobe/TechGlobe"));

const carouselVariants = {
  hidden: { opacity: 0.2, x: 24, scale: 0.99 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 170, damping: 28, delay: 0.08 },
  },
};

const roles = ["Web Developer", "AI Engineer", "Agentic AI Builder", "Problem Solver"];

const CAPABILITIES = [
  {
    title: "Custom AI Agents & LLM Workflows",
    body: "LangGraph agents, grounded RAG, voice flows, and human-in-the-loop automation for teams that need answers they can trust.",
  },
  {
    title: "Full-Stack Web & SaaS",
    body: "Next.js, React, TypeScript, Supabase, and FastAPI products with auth, dashboards, and clean handover.",
  },
  {
    title: "UI/UX & Conversion Redesigns",
    body: "Fast, mobile-first sites for startups and local businesses that need clearer offers and stronger enquiry paths.",
  },
  {
    title: "Computer Vision & ML Pipelines",
    body: "YOLO, PyTorch, and edge or cloud deployment for detection, form analysis, and document intelligence.",
  },
];

const GlobePlaceholder = () => (
  <div
    className="w-full max-w-[560px] min-h-[280px] border-4 border-outline bg-[var(--color-surface)] shadow-[8px_8px_0_var(--shadow-color)]"
    aria-hidden="true"
  />
);

const Home = memo(function Home() {
  usePageSEO();
  const preferLiteHero = useMediaQuery(MOBILE_LITE_QUERY);
  const showCommandHint = useMediaQuery(FINE_POINTER_QUERY);
  const [mountGlobe, setMountGlobe] = useState(false);
  usePrefetchPortfolioImages({ enabled: !preferLiteHero && mountGlobe });
  const totalProjects = portfolioStats.projects;
  const totalSkills = portfolioStats.skills;
  const totalCerts = portfolioStats.certifications;

  useEffect(() => {
    let idleId = 0;
    let timeoutId = 0;
    const enable = () => setMountGlobe(true);
    if (typeof window.requestIdleCallback === "function") {
      idleId = window.requestIdleCallback(enable, { timeout: 900 });
    } else {
      timeoutId = window.setTimeout(enable, 350);
    }
    return () => {
      if (idleId && typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <motion.section
      className="flex flex-col gap-8 lg:gap-10 w-full relative pb-4"
      variants={containerVariants}
      initial={false}
      animate="visible"
    >
      <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-center justify-between relative z-10">
        <div className="flex-1 flex flex-col gap-3.5 lg:gap-4 max-w-2xl w-full z-10">
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

          <motion.p
            className="font-headline-md text-base md:text-xl text-[var(--color-on-surface)] bg-[var(--color-surface)] border-4 border-outline px-4 py-2 w-fit shadow-[4px_4px_0px_0px_var(--shadow-color)] uppercase"
            variants={itemVariants}
          >
            Freelance AI Engineer & Full-Stack Developer
          </motion.p>

          <h2 className="font-headline-md text-lg md:text-2xl text-[var(--color-on-primary-container)] bg-[var(--color-primary-container)] border-4 border-outline p-2 px-4 w-fit shadow-[4px_4px_0px_0px_var(--shadow-color)] uppercase opacity-100">
            <TypeWriter texts={roles} speed={120} deleteSpeed={60} pauseTime={3200} />
          </h2>

          <motion.p
            className="font-body-lg text-base md:text-lg text-[var(--color-on-surface)] bg-[var(--color-surface)] border-4 border-outline p-3.5 md:p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] max-w-xl leading-snug"
            variants={itemVariants}
          >
            I build custom AI agents, grounded RAG systems, and high-performance Next.js and React
            applications for startups, product teams, and local businesses. Based in Pune and open to
            remote clients worldwide. Browse live case studies, then book a short discovery call for a
            fixed quote.
          </motion.p>

          <motion.div
            className="flex flex-wrap items-center gap-3 mt-1"
            variants={itemVariants}
          >
            <MagneticLink
              to="/services#inquiry"
              className="bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-4 border-outline px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-200 inline-block animate-pulse-glow"
            >
              Book a discovery call
            </MagneticLink>
            <MagneticLink
              to="/projects"
              className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-outline px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold uppercase shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-200 inline-block"
            >
              View case studies
            </MagneticLink>
            <span className="hidden sm:inline font-label-bold text-xs uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              {showCommandHint ? "or press Ctrl/Alt+K" : "or open the menu"}
            </span>
          </motion.div>
        </div>

        <motion.div
          className="flex-1 w-full flex justify-center lg:justify-end mt-2 lg:mt-0 max-w-[560px] lg:max-w-none mx-auto lg:mx-0"
          variants={carouselVariants}
        >
          <Suspense fallback={<GlobePlaceholder />}>
            {!mountGlobe ? (
              <GlobePlaceholder />
            ) : preferLiteHero ? (
              <TechGlobeFallback />
            ) : (
              <TechGlobe />
            )}
          </Suspense>
        </motion.div>
      </div>

      <motion.div
        className="w-full border-4 border-outline bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] p-5 md:p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col md:flex-row md:items-center gap-5 md:gap-8"
        variants={itemVariants}
      >
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <p className="font-label-bold text-xs uppercase tracking-[0.18em] opacity-80">
            Available for freelance
          </p>
          <p className="font-headline-md text-xl md:text-2xl uppercase leading-tight max-w-3xl">
            Clear packages for websites, web apps, and AI tools, with starting prices and live proof.
          </p>
        </div>
        <MagneticLink
          to="/services"
          className="shrink-0 self-start md:self-center bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-outline px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-base uppercase shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-all inline-block text-center"
        >
          Hire / Services
        </MagneticLink>
      </motion.div>

      <motion.section
        aria-labelledby="capabilities-heading"
        className="flex flex-col gap-5"
        variants={itemVariants}
      >
        <h2
          id="capabilities-heading"
          className="font-headline-md text-2xl md:text-3xl uppercase border-b-4 border-outline pb-2 w-fit"
        >
          Services & capabilities
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CAPABILITIES.map((item) => (
            <MagneticLink
              key={item.title}
              to="/services"
              className="border-4 border-outline bg-[var(--color-surface)] p-5 shadow-[4px_4px_0_0_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_var(--shadow-color)] transition-all flex flex-col gap-2 text-left"
            >
              <h3 className="font-headline-md text-lg uppercase">{item.title}</h3>
              <p className="font-body-md text-sm leading-snug text-[var(--color-on-surface)]">
                {item.body}
              </p>
            </MagneticLink>
          ))}
        </div>
      </motion.section>

      <motion.div
        className="bg-hatch border-4 border-outline p-3 md:p-4 shadow-[4px_4px_0_var(--shadow-color)] w-full"
        variants={itemVariants}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          <StatCard compact to="/projects" value={totalProjects} label="Projects" bg="var(--color-primary-container)" text="var(--color-on-primary-container)" />
          <StatCard compact to="/skills" value={totalSkills} isPlus label="Skills" bg="var(--color-on-background)" text="var(--color-background)" />
          <StatCard compact to="/certifications" value={totalCerts} label="Certifications" bg="var(--color-surface)" text="var(--color-on-surface)" />
        </div>
      </motion.div>
    </motion.section>
  );
});

export default Home;
