import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./PageLoader.scss";

const terminalLines = [
  { type: "command", text: "> npx aryan-dani-portfolio@latest" },
  { type: "success", text: "✔ Initializing portfolio..." },
  { type: "success", text: "✔ Loading projects..." },
  { type: "success", text: "✔ Fetching certifications..." },
  { type: "success", text: "✔ Setting up experience timeline..." },
  { type: "final", text: "[ READY ] Welcome to my portfolio." },
];

const SESSION_KEY = "portfolio_visited";

function PageLoader() {
  const hasVisited = sessionStorage.getItem(SESSION_KEY);
  const [isLoading, setIsLoading] = useState(!hasVisited);
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  // Mark as visited when loader completes
  useEffect(() => {
    if (!isLoading && !hasVisited) {
      sessionStorage.setItem(SESSION_KEY, "true");
    }
  }, [isLoading, hasVisited]);

  useEffect(() => {
    if (hasVisited) return;

    if (currentLineIndex >= terminalLines.length) {
      const exitTimer = setTimeout(() => {
        setIsLoading(false);
      }, 600);
      return () => clearTimeout(exitTimer);
    }

    const currentLine = terminalLines[currentLineIndex];
    const isCommand = currentLine.type === "command";
    const typingSpeed = isCommand ? 25 : 12;
    const lineDelay = isCommand ? 80 : 100;

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
  }, [currentLineIndex, currentCharIndex, hasVisited]);

  const getLineClass = (type) => {
    switch (type) {
      case "command":
        return "nb-loader__line--command";
      case "success":
        return "nb-loader__line--success";
      case "info":
        return "nb-loader__line--info";
      case "final":
        return "nb-loader__line--final";
      default:
        return "";
    }
  };

  // Progress: 0–100 based on lines completed
  const progress = Math.round(
    (Math.min(currentLineIndex, terminalLines.length) / terminalLines.length) *
      100
  );

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeIn" }}
        >
          <motion.div
            className="nb-loader"
            initial={{ scale: 0.93, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="nb-loader__header">
              <span className="nb-loader__title">aryan-dani — zsh</span>
              <span className="nb-loader__badge">LOADING</span>
            </div>

            {/* Body */}
            <div className="nb-loader__body">
              {displayedLines.map((line, index) => (
                <motion.div
                  key={index}
                  className={`nb-loader__line ${getLineClass(line.type)}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <span className="nb-loader__text">{line.displayText}</span>
                </motion.div>
              ))}

              {/* Cursor */}
              {currentLineIndex < terminalLines.length && (
                <span className="nb-loader__cursor" />
              )}
            </div>

            {/* Progress strip */}
            <div className="nb-loader__progress-track">
              <div
                className="nb-loader__progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PageLoader;
