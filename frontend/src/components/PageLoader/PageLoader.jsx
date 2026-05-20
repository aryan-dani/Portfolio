import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./PageLoader.scss";

const SESSION_KEY = "portfolio_visited";
const GLITCH_CHARS = "!@#$%^&*()_+-=[]{}|;':\",./<>?`~ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const TARGET_TEXT = "ARYAN DANI";

const terminalLines = [
  { type: "command", text: "> initialize_portfolio_boot_sequence" },
  { type: "success", text: "✔ Loading technical skills registry... OK" },
  { type: "success", text: "✔ Fetching academic & credentials records... OK" },
  { type: "success", text: "✔ Establishing database connection... OK" },
  { type: "final", text: "[ SUCCESS ] Boot completed. Welcome." },
];

const PHASES = { GLITCH: 0, TERMINAL: 1, EXIT: 2, DONE: 3 };

function PageLoader() {
  const hasVisited = sessionStorage.getItem(SESSION_KEY);
  const [isLoading, setIsLoading] = useState(!hasVisited);
  const [phase, setPhase] = useState(PHASES.GLITCH);
  
  // Glitch state
  const [glitchText, setGlitchText] = useState(
    Array.from({ length: TARGET_TEXT.length }, () =>
      GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
    ).join("")
  );
  const [resolvedCount, setResolvedCount] = useState(0);

  // Terminal state
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Mark as visited
  useEffect(() => {
    if (!isLoading && !hasVisited) {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
  }, [isLoading, hasVisited]);

  // Phase 1: Big Name Glitch
  useEffect(() => {
    if (hasVisited || phase !== PHASES.GLITCH) return;

    if (resolvedCount >= TARGET_TEXT.length) {
      const nextPhaseTimer = setTimeout(() => {
        setPhase(PHASES.TERMINAL);
      }, 500);
      return () => clearTimeout(nextPhaseTimer);
    }

    const scrambleInterval = setInterval(() => {
      setGlitchText((prev) => {
        const chars = prev.split("");
        for (let i = resolvedCount; i < TARGET_TEXT.length; i++) {
          if (Math.random() > 0.3) {
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
    }, 85);

    return () => {
      clearInterval(scrambleInterval);
      clearTimeout(resolveTimer);
    };
  }, [phase, resolvedCount, hasVisited]);

  // Phase 2: Terminal Typing
  useEffect(() => {
    if (hasVisited || phase !== PHASES.TERMINAL) return;

    if (currentLineIndex >= terminalLines.length) {
      const exitTimer = setTimeout(() => {
        setPhase(PHASES.EXIT);
      }, 500);
      return () => clearTimeout(exitTimer);
    }

    const currentLine = terminalLines[currentLineIndex];
    const isCommand = currentLine.type === "command";
    const typingSpeed = isCommand ? 12 : 5;
    const lineDelay = isCommand ? 40 : 50;

    if (currentCharIndex < currentLine.text.length) {
      const charTimer = setTimeout(() => {
        setDisplayedLines((prev) => {
          const updated = [...prev];
          if (updated[currentLineIndex]) {
            updated[currentLineIndex] = {
              ...currentLine,
              displayText: currentLine.text.slice(0, currentCharIndex + 1),
            };
          } else {
            updated.push({
              ...currentLine,
              displayText: currentLine.text.slice(0, currentCharIndex + 1),
            });
          }
          return updated;
        });
        setCurrentCharIndex((prev) => prev + 1);
      }, typingSpeed);
      return () => clearTimeout(charTimer);
    } else {
      const nextLineTimer = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, lineDelay);
      return () => clearTimeout(nextLineTimer);
    }
  }, [phase, currentLineIndex, currentCharIndex, hasVisited]);

  // Phase 3: Exit Wipe
  useEffect(() => {
    if (phase !== PHASES.EXIT) return;
    const exitTimer = setTimeout(() => {
      setIsLoading(false);
    }, 850);
    return () => clearTimeout(exitTimer);
  }, [phase]);

  const getLineClass = (type) => {
    switch (type) {
      case "command": return "nb-loader__line--command";
      case "success": return "nb-loader__line--success";
      case "final": return "nb-loader__line--final";
      default: return "";
    }
  };

  const progress = phase === PHASES.GLITCH
    ? Math.round((resolvedCount / TARGET_TEXT.length) * 35)
    : phase === PHASES.TERMINAL
    ? 35 + Math.round((Math.min(currentLineIndex, terminalLines.length) / terminalLines.length) * 65)
    : 100;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className={`page-loader ${phase === PHASES.EXIT ? "page-loader--exit" : ""}`}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          {/* Subtle grid pattern overlay */}
          <div className="page-loader__grid" />
          
          <AnimatePresence mode="wait">
            {phase === PHASES.GLITCH ? (
              <motion.div
                key="glitch"
                className="page-loader__glitch-container"
                initial={{ opacity: 1, scale: 0.96 }}
                exit={{ opacity: 0, scale: 0.94, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <motion.h1
                  className="page-loader__glitch-text"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {glitchText.split("").map((char, i) => (
                    <span
                      key={i}
                      className={`page-loader__glitch-char ${
                        i < resolvedCount ? "page-loader__glitch-char--resolved" : "page-loader__glitch-char--scrambling"
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </motion.h1>
                <motion.div
                  className="page-loader__glitch-subtitle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  WEB DEVELOPER • AI ENGINEER
                </motion.div>
              </motion.div>
            ) : phase === PHASES.TERMINAL ? (
              <motion.div
                key="terminal"
                className="nb-loader"
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.97, opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {/* Header */}
                <div className="nb-loader__header">
                  <div className="nb-loader__header-dots">
                    <span className="nb-loader__header-dot" />
                    <span className="nb-loader__header-dot" />
                    <span className="nb-loader__header-dot" />
                  </div>
                  <span className="nb-loader__title">aryan_dani // cli</span>
                  <span className="nb-loader__badge">BOOTING</span>
                </div>

                {/* Body */}
                <div className="nb-loader__body">
                  {displayedLines.map((line, index) => (
                    <motion.div
                      key={index}
                      className={`nb-loader__line ${getLineClass(line.type)}`}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.12 }}
                    >
                      <span className="nb-loader__text">{line.displayText}</span>
                    </motion.div>
                  ))}

                  {/* Cursor */}
                  {currentLineIndex < terminalLines.length && (
                    <span className="nb-loader__cursor" />
                  )}
                </div>

                {/* Progress bar */}
                <div className="nb-loader__progress-track">
                  <div
                    className="nb-loader__progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* ── Exit Phase: split wipe doors ── */}
          {phase === PHASES.EXIT && (
            <>
              <motion.div
                className="page-loader__split page-loader__split--left"
                initial={{ x: 0 }}
                animate={{ x: "-100%" }}
                transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
              />
              <motion.div
                className="page-loader__split page-loader__split--right"
                initial={{ x: 0 }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
              />
            </>
          )}

          {/* Clean progress line at bottom */}
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
}

export default PageLoader;
