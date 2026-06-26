import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "portfolio_visited";
const PHASES = { GLITCH: 0, TERMINAL: 1, EXIT: 2, DONE: 3 };
const TARGET_TEXT = "ARYAN DANI";
const GLITCH_CHARS = "█$#@%&*?!X10";

function getGlitchChar(index) {
  return GLITCH_CHARS[index % GLITCH_CHARS.length];
}

function getInitialChars() {
  return TARGET_TEXT.split("").map((char, index) => ({
    char: char === " " ? "\u00A0" : getGlitchChar(index * 3 + 1),
    state: char === " " ? "resolved" : "waiting",
  }));
}

const PageLoader = memo(function PageLoader() {
  const hasVisited = sessionStorage.getItem(SESSION_KEY);
  const [isLoading, setIsLoading] = useState(!hasVisited);
  const [phase, setPhase] = useState(PHASES.GLITCH);
  const [isGlitchDone, setIsGlitchDone] = useState(false);
  const [glitchProgress, setGlitchProgress] = useState(0);
  const [terminalStep, setTerminalStep] = useState(0);
  const [memSize, setMemSize] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [displayChars, setDisplayChars] = useState(getInitialChars);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
 
  useEffect(() => {
    if (!isLoading && !hasVisited) {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
  }, [isLoading, hasVisited]);
 
  // Phase 1: Scanline Glitch Scramble Animation
  useEffect(() => {
    if (hasVisited) {
      setPhase(PHASES.DONE);
      setIsLoading(false);
      return;
    }
 
    if (phase !== PHASES.GLITCH) return;
    if (reduceMotion) {
      setDisplayChars(TARGET_TEXT.split("").map((char) => ({
        char: char === " " ? "\u00A0" : char,
        state: "resolved",
      })));
      setTimeout(() => setIsLoading(false), 420);
      return undefined;
    }

    const duration = 950;
    const startTime = performance.now();
    let animationFrameId;

    const updateLoader = (now) => {
      const elapsed = now - startTime;
      const percent = Math.min(elapsed / duration, 1);
      setGlitchProgress(Math.round(percent * 100));

      const nextChars = TARGET_TEXT.split("").map((targetChar, i) => {
        if (TARGET_TEXT[i] === " ") {
          return { char: "\u00A0", state: "resolved" };
        }

        const charSweepTime = (i / TARGET_TEXT.length) * (duration * 0.7);
        const scrambleDuration = 160;

        if (elapsed < charSweepTime) {
          return {
            char: getGlitchChar(i + Math.floor(elapsed / 90)),
            state: "waiting",
          };
        }
        if (elapsed < charSweepTime + scrambleDuration) {
          return {
            char: GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)],
            state: "scrambling",
          };
        }
        return { char: targetChar, state: "resolved" };
      });
      setDisplayChars(nextChars);

      if (percent < 1) {
        animationFrameId = requestAnimationFrame(updateLoader);
      } else {
        setIsGlitchDone(true);
        setTimeout(() => setPhase(PHASES.TERMINAL), 260);
      }
    };

    animationFrameId = requestAnimationFrame(updateLoader);
    return () => cancelAnimationFrame(animationFrameId);
  }, [phase, hasVisited, reduceMotion]);

  // Phase 2: Terminal BIOS Booting Animation with RAM Check
  useEffect(() => {
    if (phase !== PHASES.TERMINAL) return;

    // Fast memory count up
    let memInterval;
    let currentMem = 0;
    memInterval = setInterval(() => {
      currentMem += Math.floor(Math.random() * 160) + 96;
      if (currentMem >= 1024) {
        currentMem = 1024;
        clearInterval(memInterval);
      }
      setMemSize(currentMem);
    }, 24);

    const timers = [
      setTimeout(() => setTerminalStep(1), 90),
      setTimeout(() => setTerminalStep(2), 260),
      setTimeout(() => setTerminalStep(3), 500),
      setTimeout(() => setTerminalStep(4), 730),
      setTimeout(() => setTerminalStep(5), 960),
      setTimeout(() => setPhase(PHASES.EXIT), 1200),
    ];

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(memInterval);
    };
  }, [phase]);

  // Phase 3: Exit Shutter Panel Transition
  useEffect(() => {
    if (phase !== PHASES.EXIT) return;
    const exitTimer = setTimeout(() => setIsLoading(false), 520);
    return () => clearTimeout(exitTimer);
  }, [phase]);

  const skipLoader = () => {
    setPhase(PHASES.DONE);
    setIsLoading(false);
  };

  const terminalProgress = Math.round((Math.min(terminalStep, 5) / 5) * 100);
  const globalProgress = phase === PHASES.GLITCH
    ? glitchProgress * 0.5
    : phase === PHASES.TERMINAL
    ? 50 + (Math.min(terminalStep, 5) / 5) * 50
    : 100;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={`page-loader ${phase === PHASES.EXIT ? "page-loader--exit" : ""}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } }}
        >
          {/* Dot grid background */}
          <div className="page-loader__grid" />
          {/* CRT scanlines */}
          <div className="page-loader__scanline" />
          <div className="page-loader__orbital" aria-hidden="true" />

          {/* Central Container */}
          <div className="w-full h-full flex items-center justify-center relative z-10 p-4">
            <AnimatePresence mode="wait">
              {phase === PHASES.GLITCH ? (
                <motion.div
                  key="glitch"
                  className="page-loader__glitch-container flex flex-col items-center gap-6"
                  initial={{ opacity: 1, scale: 0.95 }}
                  exit={{ opacity: 0, scale: 0.93, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="page-headline-xl tracking-tighter uppercase leading-none font-bold text-center relative px-2" style={{ fontFamily: "var(--font-headline-xl)", fontSize: "clamp(3rem, 10vw, 8rem)" }} aria-label="Aryan Dani">
                    {/* Sweep scanner line */}
                    <motion.div
                      className="absolute top-0 bottom-0 w-[4px] bg-[var(--color-outline)] z-20 pointer-events-none"
                      initial={{ left: "0%" }}
                      animate={{ left: "100%" }}
                      transition={{ duration: 0.95, ease: "linear" }}
                      style={{ boxShadow: "0 0 12px var(--color-outline)" }}
                    />
                    {displayChars.map((item, i) => (
                      <span
                        key={i}
                        className={`page-loader__glitch-char ${
                          item.state === "resolved"
                            ? "page-loader__glitch-char--resolved opacity-100"
                            : item.state === "scrambling"
                              ? "page-loader__glitch-char--scrambling opacity-100"
                              : "page-loader__glitch-char--waiting opacity-50"
                        }`}
                      >
                        {item.char}
                      </span>
                    ))}
                  </div>

                  {/* Circular progress ring overlay */}
                  <div className="flex items-center gap-3 mt-2">
                    <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="stroke-current text-[var(--color-outline-variant)] opacity-30"
                        strokeWidth="3.5"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <motion.path
                        className="stroke-current text-[var(--color-outline)]"
                        strokeWidth="4"
                        strokeDasharray="100, 100"
                        initial={{ strokeDashoffset: 100 }}
                        animate={{ strokeDashoffset: 100 - glitchProgress }}
                        transition={{ duration: 0.1, ease: "linear" }}
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="font-mono text-sm font-bold tracking-widest text-[var(--color-on-background)] opacity-80">
                      {glitchProgress}%
                    </span>
                  </div>

                  {isGlitchDone && (
                    <motion.div
                      className="page-loader__glitch-subtitle"
                      initial={{ opacity: 0, scale: 0.82, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 380, damping: 28 }}
                    >
                      WEB DEVELOPER • AI ENGINEER
                    </motion.div>
                  )}
                </motion.div>
              ) : phase === PHASES.TERMINAL ? (
                <motion.div
                  key="terminal"
                  className="nb-loader max-w-[720px] w-full"
                  initial={{ scale: 0.92, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: -20, filter: "blur(2px)" }}
                  transition={{ duration: 0.38, ease: "easeOut" }}
                >
                  {/* Title Bar */}
                  <div className="nb-loader__header">
                    <div className="nb-loader__header-dots">
                      <span className="nb-loader__header-dot" />
                      <span className="nb-loader__header-dot" />
                      <span className="nb-loader__header-dot" />
                    </div>
                    <span className="nb-loader__title">
                      ARYAN_DANI // SYSTEM_BIOS_V4.0
                    </span>
                    <span className="nb-loader__badge">
                      BOOTING
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="nb-loader__body text-left">
                    {terminalStep >= 1 && (
                      <motion.div
                        className="nb-loader__line nb-loader__line--command"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        &gt; INITIALIZING SYSTEM BOOT SEQUENCE...
                      </motion.div>
                    )}
                    {terminalStep >= 1 && (
                      <motion.div
                        className="nb-loader__line text-xs opacity-75 ml-4"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
                      >
                        ↳ SYSTEM MEMORY CHECK: {memSize}MB / 1024MB OK
                      </motion.div>
                    )}
                    {terminalStep >= 2 && (
                      <motion.div
                        className="nb-loader__line nb-loader__line--success"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        ✔ HYDRATING CORE COMPONENT REGISTRY... DONE
                      </motion.div>
                    )}
                    {terminalStep >= 2 && (
                      <motion.div
                        className="nb-loader__line text-xs opacity-70 ml-4"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.05, ease: "easeOut" }}
                      >
                        ↳ [React v18.2.0, Framer Motion v11.0.0, Tailwind v4.0.0]
                      </motion.div>
                    )}
                    {terminalStep >= 3 && (
                      <motion.div
                        className="nb-loader__line nb-loader__line--success"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        ✔ SPINNING UP DATA LAYERS & PLAYGROUND SANDBOX... DONE
                      </motion.div>
                    )}
                    {terminalStep >= 4 && (
                      <motion.div
                        className="nb-loader__line nb-loader__line--success"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                      >
                        ✔ SPARKING NEURAL HANDSHAKE ACCELERATORS... DONE
                      </motion.div>
                    )}
                    {terminalStep >= 5 && (
                      <motion.div
                        className="nb-loader__line nb-loader__line--final w-full"
                        initial={{ opacity: 0, scale: 0.95, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                      >
                        [ SYSTEM ONLINE ] Boot sequence successful. Redirecting to portfolio...
                      </motion.div>
                    )}
                    {terminalStep < 5 && <span className="nb-loader__cursor" />}
                  </div>

                  {/* Progress fill */}
                  <div className="nb-loader__progress-track">
                    <div
                      className="nb-loader__progress-fill"
                      style={{ transform: `translateX(${terminalProgress - 100}%)`, willChange: "transform" }}
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Shutter Exit Transition Panels */}
          {phase === PHASES.EXIT && (
            <div className="fixed inset-0 z-99999 flex pointer-events-none">
              {Array.from({ length: 6 }).map((_, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={index}
                    className="page-loader__shutter"
                    style={{
                      left: `${(index / 6) * 100}%`,
                      width: "calc(100% / 6 + 1.5px)",
                    }}
                    initial={{ y: 0 }}
                    animate={{ y: isEven ? "-100%" : "100%" }}
                    transition={{
                      duration: 0.65,
                      ease: [0.76, 0, 0.24, 1],
                      delay: index * 0.05,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Global progress tracker */}
          <div className="page-loader__global-progress">
            <motion.div
              className="page-loader__global-progress-fill w-full origin-left"
              style={{ willChange: "transform" }}
              animate={{ scaleX: globalProgress / 100 }}
              transition={{ duration: 0.2 }}
            />
          </div>

          <button
            type="button"
            onClick={skipLoader}
            className="absolute right-4 top-4 z-30 border-2 border-outline bg-[var(--color-surface)] px-3 py-2 font-label-bold text-xs uppercase tracking-widest text-[var(--color-on-surface)] shadow-[3px_3px_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all cursor-none"
          >
            Skip
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default PageLoader;
