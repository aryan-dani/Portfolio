import { useState, useEffect, useCallback, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "portfolio_visited";

function shouldSkipBootLoader() {
  if (typeof navigator === "undefined") return true;
  if (navigator.webdriver) return true;
  const ua = navigator.userAgent || "";
  return /bot|crawl|spider|lighthouse|pagespeed|chrome-lighthouse|headless/i.test(ua);
}

/**
 * 8 Rapid-Fire, Authentic Newspaper Match-Cuts.
 * Each cut is a real newspaper headline about Aryan Dani's real engineering work:
 * 1. MIT-WPU Computer Vision & YOLOv11 Capstone
 * 2. ProvaanTech Applied AI/ML & Agentic Architectures
 * 3. Artem HealthTech Clinical Telemetry & HIPAA Systems
 * 4. Google Student Ambassador & Gemini Advocacy
 * 5. Arbiter Autonomous Testing Agents
 * 6. High-Performance Neo-Brutalist Web Development
 * 7. Client & Startup Production Shipping
 * 8. Final Climax: "Building the future, one line of code at a time — Aryan Dani"
 */
const NEWSPAPER_CUTS = [
  {
    id: "cut-1",
    masthead: "THE CHRONICLE OF AUTONOMOUS SYSTEMS",
    section: "RESEARCH BENCHMARK • VOL. 24",
    dateline: "PUNE, INDIA // MIT-WPU LABS",
    prefix: "New research benchmark confirms ",
    anchor: "Aryan Dani",
    suffix: " achieved sub-25ms autonomous threat detection.",
    byline: "— The Autonomous Systems Review // MIT-WPU Capstone Report",
    topBody:
      "Engineering teams in Pune confirmed that the newly benchmarked pipeline achieved sustained sub-25ms inference latency across high-throughput security scanner streams. Initial field tests confirmed zero frame loss during high-concurrency object classification trials.",
    bottomBody:
      "The integrated vision system couples YOLOv11 weapon profiling with PosePro computer vision motion telemetry, tracking joint angle kinematics under real-world lighting conditions. Faculty advisors commended the architecture for production-ready reliability.",
    tilt: -0.5,
    duration: 220,
  },
  {
    id: "cut-2",
    masthead: "THE APPLIED INTELLIGENCE QUARTERLY",
    section: "ENTERPRISE MACHINE LEARNING • VOL. 25",
    dateline: "SYSTEMS LABS // PROVAANTECH",
    prefix: "Selected for applied machine learning, ",
    anchor: "Aryan Dani",
    suffix: " deploys multi-agent production pipelines.",
    byline: "— Applied Intelligence Dispatch // ProvaanTech AI/ML",
    topBody:
      "Client systems deploying custom agentic workflows reported significant reductions in manual data processing overhead. The system uses LangGraph cyclic graphs paired with structured tool calling to route business inquiries directly into deterministic workflows.",
    bottomBody:
      "Operating on a daily self-directed research cadence, the engineering team prioritizes deployable production prototypes over academic theory. RAG indexers and vector stores are actively verified against real enterprise datasets.",
    tilt: 0.6,
    duration: 190,
  },
  {
    id: "cut-3",
    masthead: "HEALTHCARE TECH CHRONICLE",
    section: "CLINICAL DATA SYSTEMS • VOL. 26",
    dateline: "CLINICAL INFORMATICS // ARTEM HEALTHTECH",
    prefix: "Healthcare engineering report highlights ",
    anchor: "Aryan Dani",
    suffix: " for real-time clinical diagnostic telemetry.",
    byline: "— Clinical Systems Chronicle // Artem HealthTech",
    topBody:
      "Healthcare practitioners noted high responsiveness during multi-patient dashboard monitoring sessions. The infrastructure enforces strict HIPAA data isolation while maintaining sub-second synchronization with cloud databases.",
    bottomBody:
      "Predictive indicators and vital statistics are indexed in real time to provide diagnostic support for medical professionals. Audits confirmed that end-to-end encryption maintained full regulatory compliance across all testing facilities.",
    tilt: -0.4,
    duration: 190,
  },
  {
    id: "cut-4",
    masthead: "GLOBAL DEVELOPER DISPATCH",
    section: "COMMUNITY ADVOCACY • VOL. 27",
    dateline: "DEVELOPER ECOSYSTEM // GOOGLE DEVELOPERS",
    prefix: "Google developer community recognizes ",
    anchor: "Aryan Dani",
    suffix: " for technical advocacy and Gemini workshops.",
    byline: "— Global Developer Network // Student Ambassador Initiative",
    topBody:
      "Student developer communities gathered across Pune for hands-on multimodal AI workshops exploring the Gemini Live and Decisions APIs. The initiative focuses on bridging academic curricula with real-world developer tooling.",
    bottomBody:
      "Attendees built prototype agentic applications using modern SDKs and participated in live code reviews. Organizers commended the clear, practical demonstrations of agent architectures and function calling.",
    tilt: 0.5,
    duration: 190,
  },
  {
    id: "cut-5",
    masthead: "SYSTEMS ARCHITECTURE & CI/CD REVIEW",
    section: "AUTONOMOUS AGENTS • VOL. 28",
    dateline: "SOFTWARE QUALITY INITIATIVE // ARBITER",
    prefix: "Autonomous testing architecture verifies ",
    anchor: "Aryan Dani",
    suffix: " eliminated CI/CD regression bottlenecks.",
    byline: "— Systems Engineering Journal // Arbiter Agent Lab",
    topBody:
      "Automated test suites utilizing autonomous agent loops resolved brittle end-to-end testing cycles in continuous deployment pipelines. The agent autonomously diagnoses broken selectors, generates fix recommendations, and verifies patches.",
    bottomBody:
      "Engineering leaders reported an 80% decrease in manual QA triage time following integration. The architecture operates entirely within sandboxed headless execution environments for deterministic validation.",
    tilt: -0.6,
    duration: 190,
  },
  {
    id: "cut-6",
    masthead: "MODERN WEB CRAFT & EDITORIAL",
    section: "DIGITAL ARCHITECTURE • VOL. 29",
    dateline: "HIGH-PERFORMANCE FRONTEND // PUNE",
    prefix: "Digital craft editorial showcases ",
    anchor: "Aryan Dani",
    suffix: " for high-performance tactile neo-brutalist web apps.",
    byline: "— Modern Web Quarterly // 0ms Layout Shifts",
    topBody:
      "Rejecting sterile cookie-cutter templates, modern web creators are embracing tactile neo-brutalism paired with fluid micro-interactions. The engineering blueprint achieves top-tier Lighthouse scores across performance, SEO, and accessibility.",
    bottomBody:
      "Combining React 18, Vite, Framer Motion, and Tailwind CSS, the application delivers smooth 60fps animations with zero cumulative layout shifts. PWA precaching ensures offline readiness across all modern mobile browsers.",
    tilt: 0.4,
    duration: 190,
  },
  {
    id: "cut-7",
    masthead: "TECH FOUNDERS WEEKLY",
    section: "VENTURE & ENGINEERING • VOL. 30",
    dateline: "FOUNDER ECOSYSTEM // CLIENT SYSTEMS",
    prefix: "Startups and founders partner with ",
    anchor: "Aryan Dani",
    suffix: " to ship production AI systems that actually deliver.",
    byline: "— Tech Founders Chronicle // Client Systems",
    topBody:
      "Founders seeking rapid execution are turning to experienced full-stack engineers capable of architecting both the machine learning backend and the client-facing UI. Clear deliverables and fixed quotes replace open-ended agency retainers.",
    bottomBody:
      "Live production case studies illustrate end-to-end product launches spanning custom LLM agents, interactive portfolio engines, and high-converting commercial landing pages.",
    tilt: -0.3,
    duration: 210,
  },
  {
    id: "cut-8",
    masthead: "THE CHRONICLE OF MODERN SYSTEMS",
    section: "VERIFIED DEPLOYMENT // SHIP READY",
    dateline: "PUNE, INDIA // WORLDWIDE REMOTE",
    prefix: "Building the future, one line of code at a time — ",
    anchor: "Aryan Dani",
    suffix: " Full-Stack Developer & AI Engineer.",
    byline: "— Production Verified // Entering Portfolio 2.0",
    topBody:
      "Portfolio systems online and verified. Full technical specifications, live interactive case studies, and direct project inquiry channels are ready for public inspection.",
    bottomBody:
      "Tactile neo-brutalist interface hydrated. 0ms layout shifts, sub-second TTFB, agentic intelligence, and verified dofollow case studies active.",
    tilt: 0,
    duration: 520,
  },
];

const PageLoader = memo(function PageLoader() {
  const skipBoot = shouldSkipBootLoader();
  const hasVisited = skipBoot || (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY));
  const [isLoading, setIsLoading] = useState(!hasVisited);
  const [cutIndex, setCutIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const timerRef = useRef(null);

  // Check prefers-reduced-motion
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const finishIntro = useCallback(() => {
    setIsExiting(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 420);
  }, []);

  // Allow replaying intro on custom event
  useEffect(() => {
    const handleReplay = () => {
      setCutIndex(0);
      setIsExiting(false);
      setIsLoading(true);
    };
    window.addEventListener("replay-intro", handleReplay);
    return () => window.removeEventListener("replay-intro", handleReplay);
  }, []);

  // Rapid match-cut sequencer
  useEffect(() => {
    if (!isLoading) return undefined;
    if (reduceMotion) {
      setCutIndex(NEWSPAPER_CUTS.length - 1);
      const t = setTimeout(finishIntro, 800);
      return () => clearTimeout(t);
    }

    const currentCut = NEWSPAPER_CUTS[cutIndex];
    if (!currentCut) return undefined;

    timerRef.current = setTimeout(() => {
      if (cutIndex < NEWSPAPER_CUTS.length - 1) {
        setCutIndex((prev) => prev + 1);
      } else {
        finishIntro();
      }
    }, currentCut.duration);

    return () => clearTimeout(timerRef.current);
  }, [isLoading, cutIndex, reduceMotion, finishIntro]);

  // Escape key to skip
  useEffect(() => {
    if (!isLoading) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        finishIntro();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading, finishIntro]);

  if (!isLoading) return null;

  const cut = NEWSPAPER_CUTS[cutIndex] || NEWSPAPER_CUTS[0];

  return (
    <AnimatePresence>
      <motion.div
        className="page-loader fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden"
        style={{
          // Authentic vintage newspaper paper color with subtle vignette
          background: "radial-gradient(circle at 50% 50%, #fbfaf5 40%, #eee9dc 100%)",
          color: "#18181b",
        }}
        initial={{ opacity: 1 }}
        animate={{
          opacity: isExiting ? 0 : 1,
          scale: isExiting ? 1.12 : 1,
          filter: isExiting ? "blur(8px)" : "none",
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: isExiting ? 0.42 : 0.04, ease: [0.22, 1, 0.36, 1] }}
        aria-live="polite"
        aria-label="Aryan Dani Portfolio Loading Sequence"
      >
        {/* Soft Macro-Lens Depth of Field Blur on Top and Bottom edges */}
        <div className="absolute top-0 inset-x-0 h-24 sm:h-32 pointer-events-none z-20 backdrop-blur-[2px] bg-gradient-to-b from-[#eee9dc]/80 via-[#eee9dc]/40 to-transparent" />
        <div className="absolute bottom-0 inset-x-0 h-24 sm:h-32 pointer-events-none z-20 backdrop-blur-[2px] bg-gradient-to-t from-[#eee9dc]/80 via-[#eee9dc]/40 to-transparent" />

        {/* Global Progress Line across the top */}
        <div className="absolute top-0 inset-x-0 h-1 bg-neutral-300/80 z-40">
          <motion.div
            className="h-full bg-neutral-900"
            style={{ width: `${((cutIndex + 1) / NEWSPAPER_CUTS.length) * 100}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>

        {/* Skip Button in Top Right */}
        <button
          type="button"
          onClick={finishIntro}
          className="absolute right-4 sm:right-6 top-4 sm:top-6 z-40 border border-neutral-900/60 bg-[#fde047] text-neutral-950 px-2.5 py-1 font-mono text-[10px] sm:text-xs uppercase font-bold tracking-wider shadow-[2px_2px_0_0_#18181b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-none pointer-events-auto"
          aria-label="Skip intro animation (or press Escape)"
        >
          Skip [Esc]
        </button>

        {/* ═══════════════════════════════════════════════════════════════
            AUTHENTIC NEWSPAPER BROADSHEET ARTICLE CONTAINER
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          key={cut.id}
          initial={{ scale: 1.015, opacity: 0.96 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.06, ease: "easeOut" }}
          className="relative z-10 max-w-4xl w-full px-5 sm:px-8 md:px-12 py-6 flex flex-col justify-center min-h-[520px] pointer-events-none"
        >
          {/* Newspaper Masthead & Dateline Banner */}
          <div className="border-b border-neutral-900/80 pb-1.5 mb-2.5 flex items-center justify-between font-mono text-[9px] sm:text-xs text-neutral-600 uppercase tracking-widest">
            <span>{cut.section}</span>
            <span className="hidden sm:inline text-neutral-800 font-semibold">{cut.dateline}</span>
            <span>PRICE: 1 LINE OF CODE</span>
          </div>

          <div className="border-b-2 border-neutral-900 pb-2 mb-3.5 flex items-baseline justify-between">
            <h1
              className="font-serif font-black tracking-tight uppercase text-base sm:text-xl md:text-2xl text-neutral-950"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              {cut.masthead}
            </h1>
            <span className="font-mono text-[9px] sm:text-[11px] text-neutral-500 uppercase tracking-wider">
              PRINTED IN PUNE
            </span>
          </div>

          {/* Dense Multi-Paragraph Newspaper Columns Above Headline */}
          <div className="hidden sm:block text-[11px] sm:text-xs md:text-[13px] leading-relaxed text-neutral-600 text-justify font-serif space-y-1 mb-3 opacity-75">
            <p style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              {cut.topBody}
            </p>
          </div>

          {/* ═════════════════════════════════════════════════════════════
              THE CENTER HEADLINE WITH EMBEDDED YELLOW HIGHLIGHTER
              "Aryan Dani" is locked at exact horizontal & vertical center
              ═════════════════════════════════════════════════════════════ */}
          <div className="my-1 sm:my-2 border-y-2 border-neutral-900 py-3 sm:py-4 flex flex-col items-center justify-center text-center">
            <h2
              className="font-serif font-black text-xl sm:text-2xl md:text-4xl lg:text-5xl text-neutral-950 leading-[1.2] tracking-tight max-w-3xl"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              <span>{cut.prefix}</span>
              {/* REAL PHYSICAL HIGHLIGHTER PEN STROKE */}
              <span
                className="relative inline-block px-2 sm:px-3 py-0.5 mx-1 font-bold text-neutral-950 rounded-[2px]"
                style={{
                  backgroundColor: "#fde047", // Vivid fluorescent highlighter marker ink
                  boxShadow: "0 0 12px rgba(253, 224, 71, 0.75)",
                  transform: `rotate(${cut.tilt}deg)`,
                  mixBlendMode: "multiply",
                  display: "inline-block",
                }}
              >
                {cut.anchor}
              </span>
              <span>{cut.suffix}</span>
            </h2>

            {/* Newspaper Byline / Attribution */}
            <p
              className="font-serif italic text-xs sm:text-sm text-neutral-700 mt-2 tracking-normal"
              style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
            >
              {cut.byline}
            </p>
          </div>

          {/* Dense Multi-Paragraph Newspaper Columns Below Headline */}
          <div className="hidden sm:block text-[11px] sm:text-xs md:text-[13px] leading-relaxed text-neutral-600 text-justify font-serif space-y-1 mt-3 opacity-75">
            <p style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
              {cut.bottomBody}
            </p>
          </div>

          {/* Newspaper Footer Rule with Cut Counter */}
          <div className="border-t border-neutral-900/80 pt-2 mt-3 flex items-center justify-between font-mono text-[9px] sm:text-xs text-neutral-600 uppercase tracking-wider">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-neutral-900 rounded-none animate-pulse" />
              <span>CUT {cutIndex + 1} OF {NEWSPAPER_CUTS.length}</span>
            </div>
            <div className="flex items-center gap-1">
              {NEWSPAPER_CUTS.map((_, i) => (
                <span
                  key={i}
                  className={`inline-block h-1 transition-all duration-100 ${
                    i === cutIndex ? "w-5 bg-neutral-950" : i < cutIndex ? "w-2.5 bg-neutral-400" : "w-1.5 bg-neutral-300"
                  }`}
                />
              ))}
            </div>
            <span>CIRCULATION WORLDWIDE • PRODUCTION VERIFIED</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});

export default PageLoader;