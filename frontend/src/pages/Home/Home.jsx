import { lazy, memo, Suspense, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { aboutInfo } from "../../data/experience";
import { portfolioStats } from "../../data/stats";
import { CASE_STUDIES } from "../../data/caseStudies";
import { getProjectById } from "../../data/projects";
import {
  WEB_PACKAGES,
  SERVICES_PACKAGES,
  formatWebPackagePrice,
  formatAiPackagePrice,
} from "../../data/services";
import { AVAILABILITY, PRIMARY_CTA, SECONDARY_CTA } from "../../data/availability";
import MagneticLink from "../../components/MagneticLink/MagneticLink";
import ProgressiveImage from "../../components/ProgressiveImage/ProgressiveImage";
import StatCard from "../../components/StatCard/StatCard";
import TypeWriter from "../../components/TypeWriter/TypeWriter";
import BriefBuilder from "../../components/BriefBuilder/BriefBuilder";
import TechGlobeFallback from "../../components/TechGlobe/TechGlobeFallback";
import { usePageSEO } from "../../utils/seo";
import { containerVariants, itemVariants } from "../../utils/motionVariants";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { MOBILE_LITE_QUERY, FINE_POINTER_QUERY } from "../../utils/device";

const TechGlobe = lazy(() => import("../../components/TechGlobe/TechGlobe"));

const FEATURED_SLUGS = ["prism", "swiggy-nexus", "utility"];

const ROLES = ["Web Developer", "AI Engineer", "Agentic AI Builder", "Problem Solver"];

const CAPABILITIES = [
  {
    title: "Websites & web apps",
    body: "Next.js, React, TypeScript, Supabase, and FastAPI products with auth, dashboards, and clean handover.",
    to: "/services/website-development-pune",
  },
  {
    title: "Custom AI agents & RAG",
    body: "Grounded chatbots, document search, and human-in-the-loop automation that answer from your own content.",
    to: "/services/rag-chatbot-development",
  },
  {
    title: "Redesigns & conversion",
    body: "Fast, mobile-first rebuilds for startups and local businesses that need a clearer offer and stronger enquiry path.",
    to: "/services/website-redesign",
  },
  {
    title: "MVPs & product builds",
    body: "From brief to launch in milestones, with demos every couple of weeks and the repo owned by you from day one.",
    to: "/services/web-app-mvp-development",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Brief",
    body: "Lock outcomes, inputs, and constraints in a short written brief. No chargeable work until a fixed quote.",
  },
  {
    step: "02",
    title: "Fixed quote",
    body: "Written estimate with milestones. Prices below are starting ranges from live packages.",
  },
  {
    step: "03",
    title: "Build & handover",
    body: "Milestone demos, then you own the repo, domain, and credentials.",
  },
];

/** Below-the-fold sections rise into place as they scroll into view. */
const revealProps = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { type: "spring", stiffness: 110, damping: 22, mass: 0.9 },
};

const heroVariants = {
  hidden: { opacity: 0, x: 28, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 150, damping: 26, delay: 0.1 },
  },
};

function pickStartingPrices() {
  const starter = WEB_PACKAGES.find((p) => p.id === "starter-website");
  const webApp = WEB_PACKAGES.find((p) => p.id === "custom-web-app");
  const prototype = SERVICES_PACKAGES.find((p) => p.id === "prototype-sprint");
  const grounded = SERVICES_PACKAGES.find((p) => p.id === "grounded-mvp");
  return [
    {
      id: starter.id,
      name: starter.name,
      price: formatWebPackagePrice(starter, "INR"),
      alt: formatWebPackagePrice(starter, "USD"),
    },
    {
      id: webApp.id,
      name: webApp.name,
      price: formatWebPackagePrice(webApp, "INR"),
      alt: formatWebPackagePrice(webApp, "USD"),
    },
    {
      id: prototype.id,
      name: prototype.name,
      price: formatAiPackagePrice(prototype, "USD"),
      alt: formatAiPackagePrice(prototype, "INR"),
    },
    {
      id: grounded.id,
      name: grounded.name,
      price: formatAiPackagePrice(grounded, "USD"),
      alt: formatAiPackagePrice(grounded, "INR"),
    },
  ];
}

const GlobePlaceholder = () => (
  <div
    className="w-full max-w-[560px] min-h-[280px] border-4 border-outline bg-surface shadow-[8px_8px_0_var(--shadow-color)]"
    aria-hidden="true"
  />
);

const SectionTitle = ({ id, children }) => (
  <h2
    id={id}
    className="font-headline-md text-2xl md:text-3xl  border-b-4 border-outline pb-2 w-fit"
  >
    {children}
  </h2>
);

const Home = memo(function Home() {
  usePageSEO();
  const preferLite = useMediaQuery(MOBILE_LITE_QUERY);
  const showCommandHint = useMediaQuery(FINE_POINTER_QUERY);
  const [mountGlobe, setMountGlobe] = useState(false);
  // While the intro plays, the finished page already sits underneath it so the
  // intro can measure where the name lands. Returning visitors get the stagger.
  const [settled] = useState(
    () =>
      typeof document !== "undefined"
      && document.documentElement.classList.contains("intro-v2-playing"),
  );

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

  const featured = useMemo(
    () =>
      FEATURED_SLUGS.map((slug) => {
        const study = CASE_STUDIES.find((s) => s.slug === slug);
        if (!study) return null;
        const project = getProjectById(study.projectId);
        return { ...study, image: project?.image || null };
      }).filter(Boolean),
    [],
  );
  const startingPrices = useMemo(() => pickStartingPrices(), []);

  return (
    <motion.section
      className="flex flex-col gap-10 lg:gap-14 w-full relative pb-4"
      variants={containerVariants}
      initial={settled ? false : "hidden"}
      animate="visible"
    >
      {/* Hero */}
      <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 items-center justify-between relative z-10">
        <div className="flex-1 flex flex-col gap-3.5 lg:gap-4 max-w-2xl w-full z-10">
          <motion.div variants={itemVariants}>
            <motion.h1
              data-intro-name-target
              className="font-headline-xl text-5xl md:text-6xl xl:text-8xl text-on-background  leading-none bg-surface border-4 border-outline p-3 md:p-4 shadow-[8px_8px_0px_0px_var(--shadow-color)] inline-block w-fit relative"
              whileHover={{
                x: -2,
                y: -2,
                boxShadow: "12px 12px 0px 0px var(--shadow-color)",
                transition: { type: "spring", stiffness: 400, damping: 20 },
              }}
            >
              <span data-intro-name-text className="relative">
                {aboutInfo.name}
              </span>
            </motion.h1>
          </motion.div>

          <motion.p
            className="font-headline-md text-base md:text-xl text-on-surface bg-surface border-4 border-outline px-4 py-2 w-fit shadow-[4px_4px_0px_0px_var(--shadow-color)] "
            variants={itemVariants}
          >
            Freelance AI Engineer &amp; Full-Stack Developer
          </motion.p>

          <motion.h2
            className="font-headline-md text-lg md:text-2xl text-on-primary-container bg-primary-container border-4 border-outline p-2 px-4 w-fit shadow-[4px_4px_0px_0px_var(--shadow-color)] "
            variants={itemVariants}
          >
            <TypeWriter texts={ROLES} speed={120} deleteSpeed={60} pauseTime={3200} />
          </motion.h2>

          <motion.p
            className="font-body-lg text-base md:text-lg text-on-surface bg-surface border-4 border-outline p-3.5 md:p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)] max-w-xl leading-snug"
            variants={itemVariants}
          >
            I build websites, web apps, and grounded AI tools for startups, product teams, and local
            businesses. Based in Pune and open to remote clients worldwide. Send a short brief and get
            a fixed quote.
          </motion.p>

          <motion.div className="flex flex-wrap items-center gap-3 mt-1" variants={itemVariants}>
            <MagneticLink
              to={PRIMARY_CTA.to}
              trackLabel={PRIMARY_CTA.label}
              className="btn-sheen relative isolate overflow-hidden bg-primary-container text-on-primary-container border-4 border-outline px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold  shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-[transform,box-shadow] duration-200 ease-[var(--ease-spring)] inline-block animate-pulse-glow"
            >
              {PRIMARY_CTA.label}
            </MagneticLink>
            <MagneticLink
              to={SECONDARY_CTA.to}
              className="btn-sheen relative isolate overflow-hidden bg-surface text-on-surface border-4 border-outline px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-label-bold  shadow-[8px_8px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0px_0px_var(--shadow-color)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-[transform,box-shadow] duration-200 ease-[var(--ease-spring)] inline-block"
            >
              {SECONDARY_CTA.label}
            </MagneticLink>
            <span
              data-availability-chip
              className="inline-flex items-center border-2 border-outline bg-surface px-2.5 py-2 font-label-bold text-[11px]  tracking-[0.14em] text-on-surface whitespace-nowrap"
            >
              <span className="mr-2 inline-block h-2 w-2 bg-on-surface animate-pulse" aria-hidden="true" />
              {AVAILABILITY.chip}
            </span>
            <span className="hidden sm:inline font-label-bold text-xs  tracking-[0.18em] text-text-muted">
              {showCommandHint ? "or press Ctrl/Alt+K" : "or open the menu"}
            </span>
          </motion.div>
        </div>

        <motion.div
          className="flex-1 w-full flex justify-center lg:justify-end mt-2 lg:mt-0 max-w-[560px] lg:max-w-none mx-auto lg:mx-0"
          variants={heroVariants}
        >
          <Suspense fallback={<GlobePlaceholder />}>
            {!mountGlobe ? (
              <GlobePlaceholder />
            ) : preferLite ? (
              <TechGlobeFallback />
            ) : (
              <TechGlobe />
            )}
          </Suspense>
        </motion.div>
      </div>

      {/* Brief builder */}
      <motion.section
        aria-labelledby="brief-heading"
        className="flex flex-col gap-5"
        {...revealProps}
      >
        <SectionTitle id="brief-heading">What do you need?</SectionTitle>
        <p className="font-body-lg text-base md:text-lg text-on-surface max-w-2xl leading-snug">
          Pick a chip. Four agents draft scope, stack, timeline, and price from real packages.
        </p>
        <BriefBuilder />
      </motion.section>

      {/* Selected work */}
      <motion.section
        aria-labelledby="selected-work-heading"
        className="flex flex-col gap-5"
        {...revealProps}
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionTitle id="selected-work-heading">Selected work</SectionTitle>
          <Link
            to="/projects"
            className="font-label-bold text-xs  tracking-[0.14em] underline underline-offset-4 decoration-2 hover:decoration-4 transition-all"
          >
            All case studies
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {featured.map((study) => (
            <Link
              key={study.slug}
              to={`/work/${study.slug}`}
              className="group flex flex-col border-4 border-outline bg-surface shadow-[4px_4px_0_0_var(--shadow-color)] transition-[transform,box-shadow] duration-200 ease-[var(--ease-spring)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_var(--shadow-color)]"
            >
              {study.image && (
                <div className="overflow-hidden border-b-4 border-outline">
                  <ProgressiveImage
                    src={study.image}
                    alt={`${study.title} screenshot`}
                    className="w-full aspect-[16/10]"
                    imgClassName="w-full h-full object-cover transition-transform duration-500 ease-[var(--ease-out-smooth)] group-hover:scale-[1.04]"
                    loading="lazy"
                  />
                </div>
              )}
              <div className="flex flex-col gap-2 p-4 md:p-5">
                <h3 className="font-headline-md text-lg ">{study.title}</h3>
                <p className="font-body-md text-sm leading-snug text-on-surface">{study.oneLiner}</p>
              </div>
            </Link>
          ))}
        </div>
      </motion.section>

      {/* Capabilities */}
      <motion.section
        aria-labelledby="capabilities-heading"
        className="flex flex-col gap-5"
        {...revealProps}
      >
        <SectionTitle id="capabilities-heading">Services &amp; capabilities</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CAPABILITIES.map((item) => (
            <MagneticLink
              key={item.title}
              to={item.to}
              className="border-4 border-outline bg-surface p-5 shadow-[4px_4px_0_0_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_var(--shadow-color)] transition-[transform,box-shadow] duration-200 ease-[var(--ease-spring)] flex flex-col gap-2 text-left"
            >
              <h3 className="font-headline-md text-lg ">{item.title}</h3>
              <p className="font-body-md text-sm leading-snug text-on-surface">{item.body}</p>
            </MagneticLink>
          ))}
        </div>
      </motion.section>

      {/* How it works */}
      <motion.section
        aria-labelledby="how-it-works-heading"
        className="flex flex-col gap-5"
        {...revealProps}
      >
        <SectionTitle id="how-it-works-heading">How it works</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HOW_IT_WORKS.map((item) => (
            <div
              key={item.step}
              className="flex flex-col gap-2 border-4 border-outline bg-surface p-5 shadow-[4px_4px_0_0_var(--shadow-color)]"
            >
              <span className="font-label-bold text-xs  tracking-[0.18em] text-text-muted">
                Step {item.step}
              </span>
              <h3 className="font-headline-md text-xl ">{item.title}</h3>
              <p className="font-body-md text-sm leading-snug text-on-surface">{item.body}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {startingPrices.map((pack) => (
            <div
              key={pack.id}
              className="border-4 border-outline bg-surface-variant p-4 shadow-[4px_4px_0_0_var(--shadow-color)]"
            >
              <p className="font-label-bold text-[10px]  tracking-[0.18em] text-text-muted mb-1">
                Starting at
              </p>
              <p className="font-headline-md text-base  mb-1">{pack.name}</p>
              <p className="font-headline-md text-xl">{pack.price}</p>
              <p className="font-body-md text-xs text-text-muted mt-1">{pack.alt}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Closing band */}
      <motion.div
        className="w-full border-4 border-outline bg-primary-container text-on-primary-container p-5 md:p-6 shadow-[8px_8px_0px_0px_var(--shadow-color)] flex flex-col md:flex-row md:items-center gap-5 md:gap-8"
        {...revealProps}
      >
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <p className="font-label-bold text-xs  tracking-[0.18em] opacity-80">
            {AVAILABILITY.label}
          </p>
          <p className="font-headline-md text-xl md:text-2xl  leading-tight max-w-3xl">
            Clear packages for websites, web apps, and AI tools, with starting prices and live proof.
          </p>
        </div>
        <MagneticLink
          to={PRIMARY_CTA.to}
          trackLabel={PRIMARY_CTA.label}
          className="shrink-0 self-start md:self-center bg-surface text-on-surface border-4 border-outline px-6 md:px-8 py-3 md:py-4 font-label-bold text-sm md:text-base  shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] transition-[transform,box-shadow] duration-200 ease-[var(--ease-spring)] inline-block text-center"
        >
          {PRIMARY_CTA.label}
        </MagneticLink>
      </motion.div>

      <motion.div
        className="bg-hatch border-4 border-outline p-3 md:p-4 shadow-[4px_4px_0_var(--shadow-color)] w-full"
        {...revealProps}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          <StatCard
            compact
            to="/projects"
            value={portfolioStats.projects}
            label="Projects"
            bg="var(--color-primary-container)"
            text="var(--color-on-primary-container)"
          />
          <StatCard
            compact
            to="/skills"
            value={portfolioStats.skills}
            isPlus
            label="Skills"
            bg="var(--color-on-background)"
            text="var(--color-background)"
          />
          <StatCard
            compact
            to="/certifications"
            value={portfolioStats.certifications}
            label="Certifications"
            bg="var(--color-surface)"
            text="var(--color-on-surface)"
          />
        </div>
      </motion.div>
    </motion.section>
  );
});

export default Home;
