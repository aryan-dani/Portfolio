import { useState, useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "portfolio_visited";
const PHASES = { GLITCH: 0, TERMINAL: 1, EXIT: 2, DONE: 3 };
const TARGET_TEXT = "ARYANDANI";
const GLITCH_CHARS = "01$#@%&*?!X█";

const PageLoader = memo(function PageLoader() {
  const hasVisited = sessionStorage.getItem(SESSION_KEY);
  const [isLoading, setIsLoading] = useState(!hasVisited);
  const [phase, setPhase] = useState(PHASES.GLITCH);
  const [isGlitchDone, setIsGlitchDone] = useState(false);
  const [terminalStep, setTerminalStep] = useState(0);
  const charsRef = useRef([]);

  useEffect(() => {
    if (!isLoading && !hasVisited) {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
  }, [isLoading, hasVisited]);

  // Phase 1: Glitch Scramble Animation (Zero React State Updates)
  useEffect(() => {
    if (hasVisited) {
      setPhase(PHASES.DONE);
      setIsLoading(false);
      return;
    }

    if (phase !== PHASES.GLITCH) return;

    let localResolved = 0;

    const scrambleInterval = setInterval(() => {
      for (let i = localResolved; i < TARGET_TEXT.length; i++) {
        if (Math.random() > 0.35 && charsRef.current[i]) {
          charsRef.current[i].textContent = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
      }
    }, 35);

    const resolveInterval = setInterval(() => {
      if (localResolved < TARGET_TEXT.length) {
        if (charsRef.current[localResolved]) {
          charsRef.current[localResolved].textContent = TARGET_TEXT[localResolved];
          charsRef.current[localResolved].className = "page-loader__glitch-char page-loader__glitch-char--resolved";
        }
        localResolved++;
      } else {
        clearInterval(scrambleInterval);
        clearInterval(resolveInterval);
        setIsGlitchDone(true);
        setTimeout(() => setPhase(PHASES.TERMINAL), 700);
      }
    }, 80);

    return () => {
      clearInterval(scrambleInterval);
      clearInterval(resolveInterval);
    };
  }, [phase, hasVisited]);

  // Phase 2: Terminal Booting Animation
  useEffect(() => {
    if (phase !== PHASES.TERMINAL) return;

    const timers = [
      setTimeout(() => setTerminalStep(1), 150), // Command line
      setTimeout(() => setTerminalStep(2), 400), // Loading skills
      setTimeout(() => setTerminalStep(3), 650), // Academic & credentials
      setTimeout(() => setTerminalStep(4), 900), // Database connection
      setTimeout(() => setTerminalStep(5), 1150), // Success block
      setTimeout(() => setPhase(PHASES.EXIT), 1800), // Begin door exit transition
    ];

    return () => timers.forEach(clearTimeout);
  }, [phase]);

  // Phase 3: Exit Split Door Animation
  useEffect(() => {
    if (phase !== PHASES.EXIT) return;
    const exitTimer = setTimeout(() => setIsLoading(false), 700);
    return () => clearTimeout(exitTimer);
  }, [phase]);

  const progress = phase === PHASES.GLITCH
    ? Math.round((isGlitchDone ? TARGET_TEXT.length : 0 / TARGET_TEXT.length) * 35)
    : phase === PHASES.TERMINAL
    ? 35 + Math.round((Math.min(terminalStep, 5) / 5) * 65)
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
                  <h1 className="page-loader__glitch-text font-headline-xl tracking-tighter uppercase leading-none font-bold text-center">
                    {TARGET_TEXT.split("").map((_, i) => (
                      <span
                        key={i}
                        ref={(el) => (charsRef.current[i] = el)}
                        className="page-loader__glitch-char page-loader__glitch-char--scrambling"
                      >
                        {GLITCH_CHARS[0]}
                      </span>
                    ))}
                  </h1>

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
                  className="nb-loader"
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
                      ARYAN_DANI // CLI
                    </span>
                    <span className="nb-loader__badge">
                      BOOTING
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="nb-loader__body text-left">
                    {terminalStep >= 1 && (
                      <div className="nb-loader__line nb-loader__line--command">
                        &gt; initialize_portfolio_boot_sequence
                      </div>
                    )}
                    {terminalStep >= 2 && (
                      <div className="nb-loader__line nb-loader__line--success">
                        ✔ Loading technical skills registry... OK
                      </div>
                    )}
                    {terminalStep >= 3 && (
                      <div className="nb-loader__line nb-loader__line--success">
                        ✔ Fetching academic & credentials records... OK
                      </div>
                    )}
                    {terminalStep >= 4 && (
                      <div className="nb-loader__line nb-loader__line--success">
                        ✔ Establishing database connection... OK
                      </div>
                    )}
                    {terminalStep >= 5 && (
                      <div className="nb-loader__line nb-loader__line--final">
                        [ SUCCESS ] Boot completed. Welcome.
                      </div>
                    )}
                    {terminalStep < 5 && <span className="nb-loader__cursor" />}
                  </div>

                  {/* Progress fill */}
                  <div className="nb-loader__progress-track">
                    <div
                      className="nb-loader__progress-fill"
                      style={{ transform: `translateX(${progress - 100}%)`, willChange: "transform" }}
                    />
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Exit doors split animation */}
          {phase === PHASES.EXIT && (
            <>
              <motion.div
                className="page-loader__split page-loader__split--left"
                initial={{ x: 0 }}
                animate={{ x: "-100%" }}
                transition={{ duration: 0.72, ease: [0.76, 0, 0.24, 1] }}
              />
              <motion.div
                className="page-loader__split page-loader__split--right"
                initial={{ x: 0 }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.72, ease: [0.76, 0, 0.24, 1] }}
              />
            </>
          )}

          {/* Global progress tracker */}
          <div className="page-loader__global-progress">
            <motion.div
              className="page-loader__global-progress-fill w-full origin-left"
              style={{ willChange: "transform" }}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default PageLoader;
