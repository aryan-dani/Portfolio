import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "portfolio_visited";
const PHASES = { GLITCH: 0, TERMINAL: 1, EXIT: 2, DONE: 3 };
const TARGET_TEXT = "ARYANDANI";
const GLITCH_CHARS = "01$#@%&*?!X█";

const PageLoader = memo(function PageLoader() {
  const hasVisited = sessionStorage.getItem(SESSION_KEY);
  const [isLoading, setIsLoading] = useState(!hasVisited);
  const [phase, setPhase] = useState(PHASES.GLITCH);
  const [glitchText, setGlitchText] = useState(
    Array(TARGET_TEXT.length).fill(GLITCH_CHARS[0]).join("")
  );
  const [resolvedCount, setResolvedCount] = useState(0);
  const [terminalStep, setTerminalStep] = useState(0);

  useEffect(() => {
    if (!isLoading && !hasVisited) {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
  }, [isLoading, hasVisited]);

  // Phase 1: Glitch Scramble Animation
  useEffect(() => {
    if (hasVisited) {
      setPhase(PHASES.DONE);
      setIsLoading(false);
      return;
    }

    if (phase !== PHASES.GLITCH) return;

    if (resolvedCount >= TARGET_TEXT.length) {
      const nextPhaseTimer = setTimeout(() => {
        setPhase(PHASES.TERMINAL);
      }, 700); // Hold resolved name with subtitle tag before CLI transitions in
      return () => clearTimeout(nextPhaseTimer);
    }

    const scrambleInterval = setInterval(() => {
      setGlitchText((prev) => {
        const chars = prev.split("");
        for (let i = resolvedCount; i < TARGET_TEXT.length; i++) {
          if (Math.random() > 0.35) {
            chars[i] = GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
          }
        }
        return chars.join("");
      });
    }, 35);

    const resolveTimer = setTimeout(() => {
      setResolvedCount((prev) => prev + 1);
      setGlitchText((prev) => {
        const chars = prev.split("");
        chars[resolvedCount] = TARGET_TEXT[resolvedCount];
        return chars.join("");
      });
    }, 80);

    return () => {
      clearInterval(scrambleInterval);
      clearTimeout(resolveTimer);
    };
  }, [phase, resolvedCount, hasVisited]);

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
    ? Math.round((resolvedCount / TARGET_TEXT.length) * 35)
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
                    {glitchText.split("").map((char, i) => (
                      <span
                        key={i}
                        className={`page-loader__glitch-char ${
                          i < resolvedCount
                            ? "page-loader__glitch-char--resolved"
                            : "page-loader__glitch-char--scrambling"
                        }`}
                      >
                        {char}
                      </span>
                    ))}
                  </h1>

                  {resolvedCount >= TARGET_TEXT.length && (
                    <motion.div
                      className="page-loader__glitch-subtitle bg-[#f0ff00] text-black font-label-bold text-xs uppercase px-4 py-2 border-2 border-black shadow-[3px_3px_0px_#000000]"
                      initial={{ opacity: 0, scale: 0.8, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    >
                      WEB DEVELOPER • AI ENGINEER
                    </motion.div>
                  )}
                </motion.div>
              ) : phase === PHASES.TERMINAL ? (
                <motion.div
                  key="terminal"
                  className="nb-loader w-full max-w-[600px] border-4 border-black bg-white shadow-[10px_10px_0px_#f0ff00] overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.95, opacity: 0, y: -20, filter: "blur(2px)" }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  {/* Title Bar */}
                  <div className="nb-loader__header flex justify-between items-center bg-[#f0ff00] border-b-4 border-black px-5 py-3">
                    <div className="nb-loader__header-dots flex gap-1.5">
                      <span className="nb-loader__header-dot w-2.5 h-2.5 rounded-full border-2 border-black bg-[#ff5f56]" />
                      <span className="nb-loader__header-dot w-2.5 h-2.5 rounded-full border-2 border-black bg-[#ffbd2e]" />
                      <span className="nb-loader__header-dot w-2.5 h-2.5 rounded-full border-2 border-black bg-[#27c93f]" />
                    </div>
                    <span className="nb-loader__title font-headline-md text-xs uppercase tracking-wider font-bold">
                      ARYAN_DANI // CLI
                    </span>
                    <span className="nb-loader__badge text-[10px] bg-black text-white px-2 py-0.5 border border-black font-bold uppercase">
                      BOOTING
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="nb-loader__body text-left p-6 flex flex-col gap-3 min-h-[220px]">
                    {terminalStep >= 1 && (
                      <div className="nb-loader__line nb-loader__line--command text-[#0028c2] font-bold text-[14px]">
                        &gt; initialize_portfolio_boot_sequence
                      </div>
                    )}
                    {terminalStep >= 2 && (
                      <div className="nb-loader__line nb-loader__line--success text-black font-bold text-[14px]">
                        ✔ Loading technical skills registry... OK
                      </div>
                    )}
                    {terminalStep >= 3 && (
                      <div className="nb-loader__line nb-loader__line--success text-black font-bold text-[14px]">
                        ✔ Fetching academic & credentials records... OK
                      </div>
                    )}
                    {terminalStep >= 4 && (
                      <div className="nb-loader__line nb-loader__line--success text-black font-bold text-[14px]">
                        ✔ Establishing database connection... OK
                      </div>
                    )}
                    {terminalStep >= 5 && (
                      <div className="nb-loader__line nb-loader__line--final text-black font-bold text-[14px] bg-[#f0ff00] border-2 border-black px-3.5 py-2 inline-block shadow-[4px_4px_0px_#000000] self-start mt-2">
                        [ SUCCESS ] Boot completed. Welcome.
                      </div>
                    )}
                    {terminalStep < 5 && <span className="nb-loader__cursor w-2 h-4.5 bg-black animate-blink ml-1.5 inline-block align-middle" />}
                  </div>

                  {/* Progress fill */}
                  <div className="nb-loader__progress-track h-3 bg-white border-t-4 border-black w-full">
                    <div
                      className="nb-loader__progress-fill h-full bg-[#f0ff00] border-r-4 border-black"
                      style={{ width: `${progress}%` }}
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
                transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
              />
              <motion.div
                className="page-loader__split page-loader__split--right"
                initial={{ x: 0 }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
              />
            </>
          )}

          {/* Global progress tracker */}
          <div className="page-loader__global-progress">
            <motion.div
              className="page-loader__global-progress-fill"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default PageLoader;
