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
 * 5 Real, Authentic Editorial Match-Cut Frames telling Aryan Dani's real story:
 * 1. MIT-WPU Autonomous Systems Capstone (YOLOv11 Threat Detection & PosePro)
 * 2. ProvaanTech Applied AI/ML (Agentic architectures & RAG systems)
 * 3. Artem HealthTech (HIPAA healthcare analytics & medical pipelines)
 * 4. Google Student Ambassador (Gemini advocacy & developer community)
 * 5. Digital Craft (Full-Stack Engineer & Portfolio 2.0 Launch)
 */
const MATCH_CUT_FRAMES = [
  {
    id: "mit-capstone",
    masthead: "THE CHRONICLE OF AUTONOMOUS SYSTEMS",
    edition: "VOL. 24 • SPECIAL CAPSTONE EDITION",
    dateline: "PUNE, INDIA // MIT-WPU AUTONOMOUS LAB",
    category: "RESEARCH BENCHMARK",
    leadIn: "Benchmarked on high-throughput security streams under 25ms,",
    anchor: "Aryan Dani",
    leadOut: "engineered the real-time threat detection pipeline integrating YOLOv11.",
    byline: "— MIT-WPU Capstone Team, Autonomous Systems Lead",
    metaCol1: "SURVEILLANCE AI: Sub-25ms weapon profile identification in streaming scanner feeds.",
    metaCol2: "POSEPRO CV: Kinematic joint angle tracking under 25ms latency for motion symmetry.",
    scale: 0.98,
    tilt: -0.6,
    duration: 620,
  },
  {
    id: "provaan-aiml",
    masthead: "THE APPLIED INTELLIGENCE QUARTERLY",
    edition: "VOL. 25 • MACHINE LEARNING REVIEW",
    dateline: "ENTERPRISE SYSTEMS // PROVAANTECH",
    category: "APPLIED AI / ML SYSTEMS",
    leadIn: "Selected for production machine learning and client systems,",
    anchor: "Aryan Dani",
    leadOut: "deploys agentic pipelines turning raw data into decisive action.",
    byline: "— Applied AI Engineering Division",
    metaCol1: "MULTI-AGENT WORKFLOWS: LangGraph state machines, structured tool calling, and RAG architectures.",
    metaCol2: "DAILY CADENCE: Focused on self-directed research, client deliverables, and rapid shipping.",
    scale: 1.12,
    tilt: 0.5,
    duration: 560,
  },
  {
    id: "artem-health",
    masthead: "HEALTHCARE TECH CHRONICLE",
    edition: "VOL. 26 • CLINICAL SYSTEMS DISPATCH",
    dateline: "CLINICAL DATA SYSTEMS // HEALTHCARE AI",
    category: "HEALTHCARE DIAGNOSTICS",
    leadIn: "From medical diagnostic tools to clinical analytics,",
    anchor: "Aryan Dani",
    leadOut: "engineered HIPAA-conscious pipelines for real-time patient analytics.",
    byline: "— Healthcare Engineering Report",
    metaCol1: "CLINICAL TELEMETRY: Secure diagnostic indicators & low-latency medical database indexing.",
    metaCol2: "PATIENT OUTCOMES: Bridging healthcare compliance with responsive cloud web architecture.",
    scale: 0.94,
    tilt: -0.4,
    duration: 560,
  },
  {
    id: "google-ambassador",
    masthead: "GLOBAL DEVELOPER DISPATCH",
    edition: "VOL. 27 • COMMUNITY ADVOCACY EDITION",
    dateline: "GOOGLE DEVELOPER ECOSYSTEM // PUNE",
    category: "TECH ADVOCACY & COMMUNITY",
    leadIn: "Championing Gemini, agentic workflows, and hands-on coding,",
    anchor: "Aryan Dani",
    leadOut: "leads technical advocacy as Google Student Ambassador.",
    byline: "— Google Student Ambassador Initiative",
    metaCol1: "STUDENT WORKSHOPS: Hands-on hackathons, Gemini Live API demos, and multimodal AI labs.",
    metaCol2: "COMMUNITY REACH: Mentoring next-generation builders on modern web & AI tools.",
    scale: 1.06,
    tilt: 0.4,
    duration: 560,
  },
  {
    id: "portfolio-launch",
    masthead: "DIGITAL CRAFT & ENGINEERING",
    edition: "VOL. 28 • VERIFIED DEPLOYMENT // SHIP READY",
    dateline: "PUNE, INDIA // WORLDWIDE REMOTE",
    category: "PORTFOLIO 2.0 LAUNCH",
    leadIn: "Building the future, one line of code at a time —",
    anchor: "Aryan Dani",
    leadOut: "Full-Stack Developer & AI Engineer.",
    byline: "— Production Verified • Entering Portfolio",
    metaCol1: "FULL-STACK SHIP: Next.js, React 18, Vite, Framer Motion, Tailwind CSS, Neo-Brutalism.",
    metaCol2: "PERFORMANCE: 0ms layout shifts, sub-second TTFB, tactile feedback & agentic intelligence.",
    scale: 1.0,
    tilt: 0,
    duration: 750,
  },
];

const PageLoader = memo(function PageLoader() {
  const skipBoot = shouldSkipBootLoader();
  const hasVisited = skipBoot || (typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY));
  const [isLoading, setIsLoading] = useState(!hasVisited);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const [isShutter, setIsShutter] = useState(false);
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
    }, 450);
  }, []);

  // Allow replaying intro on custom event
  useEffect(() => {
    const handleReplay = () => {
      setCurrentFrameIndex(0);
      setIsExiting(false);
      setIsLoading(true);
    };
    window.addEventListener("replay-intro", handleReplay);
    return () => window.removeEventListener("replay-intro", handleReplay);
  }, []);

  // Frame match-cut sequencer
  useEffect(() => {
    if (!isLoading) return undefined;
    if (reduceMotion) {
      // For reduced-motion users, hold on the final frame briefly and exit smoothly
      setCurrentFrameIndex(MATCH_CUT_FRAMES.length - 1);
      const t = setTimeout(finishIntro, 900);
      return () => clearTimeout(t);
    }

    const currentFrame = MATCH_CUT_FRAMES[currentFrameIndex];
    if (!currentFrame) return undefined;

    // Trigger subtle shutter pulse on cut change
    setIsShutter(true);
    const shutterTimer = setTimeout(() => setIsShutter(false), 45);

    // Sequence to next frame or finish
    timerRef.current = setTimeout(() => {
      if (currentFrameIndex < MATCH_CUT_FRAMES.length - 1) {
        setCurrentFrameIndex((prev) => prev + 1);
      } else {
        finishIntro();
      }
    }, currentFrame.duration);

    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(shutterTimer);
    };
  }, [isLoading, currentFrameIndex, reduceMotion, finishIntro]);

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

  const frame = MATCH_CUT_FRAMES[currentFrameIndex] || MATCH_CUT_FRAMES[0];
  const progressPercent = Math.round(((currentFrameIndex + 1) / MATCH_CUT_FRAMES.length) * 100);

  return (
    <AnimatePresence>
      <motion.div
        className="page-loader fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none overflow-hidden"
        style={{
          backgroundColor: "#f7f5ee", // Authentic vintage newsprint off-white
          color: "#18181b",
        }}
        initial={{ opacity: 1 }}
        animate={{
          opacity: isExiting ? 0 : 1,
          scale: isExiting ? 1.06 : 1,
          filter: isExiting ? "blur(6px)" : isShutter ? "contrast(1.18) brightness(1.04)" : "none",
        }}
        exit={{ opacity: 0 }}
        transition={{ duration: isExiting ? 0.45 : 0.05, ease: [0.22, 1, 0.36, 1] }}
        aria-live="polite"
        aria-label="Aryan Dani Portfolio Loading Sequence"
      >
        {/* Subtle authentic paper grain / newsprint vignette overlay */}
        <div
          className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-multiply"
          style={{
            backgroundImage: `radial-gradient(ellipse at center, transparent 35%, rgba(0, 0, 0, 0.12) 100%)`,
          }}
          aria-hidden="true"
        />

        {/* Newspaper Grid & Authentic Column Lines */}
        <div className="absolute inset-4 sm:inset-8 md:inset-12 border-2 border-neutral-900/80 pointer-events-none z-1 flex flex-col justify-between p-3 sm:p-5">
          {/* Top Masthead Header */}
          <div className="flex flex-col gap-1 border-b-2 border-neutral-900 pb-2.5">
            <div className="flex items-center justify-between font-mono text-[9px] sm:text-xs uppercase tracking-widest text-neutral-600">
              <span>{frame.edition}</span>
              <span className="hidden sm:inline font-bold text-neutral-800">{frame.category}</span>
              <span>{frame.dateline}</span>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-400/50 pt-1.5">
              <h1 className="font-serif font-black tracking-tighter uppercase text-xs sm:text-base md:text-xl text-neutral-900">
                {frame.masthead}
              </h1>
              <span className="font-mono text-[10px] sm:text-xs tracking-wider text-neutral-500">
                PRICE: 1 LINE OF CODE
              </span>
            </div>
          </div>

          {/* Background Context Columns (Authentic Faded Newspaper Body) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-auto opacity-30 text-[10px] sm:text-xs leading-relaxed font-serif pointer-events-none select-none hidden sm:grid">
            <div className="border-r border-neutral-400/40 pr-6 space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">{"// DISPATCH TELEMETRY"}</p>
              <p>{frame.metaCol1}</p>
              <p>Systems deployed across enterprise infrastructures deliver verified runtime throughput.</p>
            </div>
            <div className="space-y-2">
              <p className="font-mono text-[9px] uppercase tracking-wider text-neutral-500">{"// TECHNICAL LOG"}</p>
              <p>{frame.metaCol2}</p>
              <p>Continuous integration, zero regression testing, and high-frequency model evaluation.</p>
            </div>
          </div>

          {/* Bottom Newspaper Footer & Progress Indicator */}
          <div className="border-t-2 border-neutral-900 pt-2 flex items-center justify-between font-mono text-[9px] sm:text-xs uppercase tracking-wider text-neutral-600">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-neutral-900 rounded-none animate-pulse" />
              <span>CUT {currentFrameIndex + 1} OF {MATCH_CUT_FRAMES.length}</span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              {MATCH_CUT_FRAMES.map((_, idx) => (
                <span
                  key={idx}
                  className={`inline-block h-1.5 transition-all duration-150 ${
                    idx === currentFrameIndex
                      ? "w-6 bg-neutral-950"
                      : idx < currentFrameIndex
                      ? "w-3 bg-neutral-400"
                      : "w-2 bg-neutral-300"
                  }`}
                />
              ))}
            </div>
            <span>PRINTED IN PUNE • SHIP READY</span>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════
            THE MATCH-CUT FOCAL ANCHOR
            "Aryan Dani" is locked at exact viewport center (50% x 50%)
            ═══════════════════════════════════════════════════════════════ */}
        <div className="fixed inset-0 flex flex-col items-center justify-center pointer-events-none z-20 px-4 sm:px-6">
          <motion.div
            key={frame.id}
            initial={{ scale: reduceMotion ? 1 : frame.scale * 1.02, opacity: 0.94 }}
            animate={{ scale: frame.scale, opacity: 1 }}
            transition={{ duration: 0.08, ease: "easeOut" }}
            className="flex flex-col items-center justify-center text-center max-w-3xl w-full mx-auto"
          >
            {/* Lead-in context sentence */}
            <p className="font-serif italic font-medium text-base sm:text-xl md:text-2xl lg:text-3xl text-neutral-900 leading-snug px-2 max-w-2xl drop-shadow-sm">
              &ldquo;{frame.leadIn}&rdquo;
            </p>

            {/* Centered Yellow Highlighter Box */}
            <div className="my-2.5 sm:my-3.5 relative inline-block">
              <motion.span
                className="relative inline-flex items-center justify-center px-4 sm:px-6 py-1.5 sm:py-2.5 font-headline-xl font-black text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-neutral-950 uppercase tracking-tight select-none border-3 border-neutral-950 shadow-[5px_5px_0px_0px_#18181b]"
                style={{
                  backgroundColor: "#fde047", // Signature fluorescent marker yellow
                  transform: `rotate(${frame.tilt}deg)`,
                  fontFamily: "var(--font-headline-xl), 'Space Grotesk', sans-serif",
                }}
                animate={{
                  scale: isExiting ? 1.08 : [1, 1.01, 1],
                }}
                transition={{ duration: 0.2 }}
              >
                {frame.anchor}
              </motion.span>
            </div>

            {/* Lead-out result sentence */}
            <p className="font-serif italic font-medium text-base sm:text-xl md:text-2xl lg:text-3xl text-neutral-900 leading-snug px-2 max-w-2xl drop-shadow-sm">
              &ldquo;{frame.leadOut}&rdquo;
            </p>

            {/* Byline / Source attribution */}
            <p className="font-mono text-[10px] sm:text-xs uppercase tracking-widest text-neutral-700 mt-3 font-semibold">
              {frame.byline}
            </p>
          </motion.div>
        </div>

        {/* Global Progress Line across the top */}
        <div className="absolute top-0 inset-x-0 h-1 bg-neutral-300 z-30">
          <motion.div
            className="h-full bg-neutral-950"
            style={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.15, ease: "linear" }}
          />
        </div>

        {/* Skip button in top right */}
        <button
          type="button"
          onClick={finishIntro}
          className="absolute right-4 sm:right-6 top-4 sm:top-6 z-40 border-2 border-neutral-950 bg-[#fde047] text-neutral-950 px-3 py-1.5 font-mono text-[11px] sm:text-xs uppercase font-bold tracking-wider shadow-[3px_3px_0_0_#18181b] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none active:translate-x-1 active:translate-y-1 transition-all cursor-none pointer-events-auto"
          aria-label="Skip intro animation (or press Escape)"
        >
          Skip Intro [Esc]
        </button>
      </motion.div>
    </AnimatePresence>
  );
});

export default PageLoader;