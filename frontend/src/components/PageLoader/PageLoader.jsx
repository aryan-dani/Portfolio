import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./PageLoader.scss";

const terminalLines = [
  { type: "command", text: "> npx aryan-dani-portfolio@latest" },
  { type: "success", text: "✔ Initializing portfolio..." },
  { type: "success", text: "✔ Loading projects..." },
  { type: "success", text: "✔ Fetching certifications..." },
  { type: "success", text: "✔ Setting up experience timeline..." },
  { type: "info", text: "ℹ Built with React + Vite" },
  { type: "final", text: "Success! Welcome to my portfolio." },
];

function PageLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [displayedLines, setDisplayedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    if (currentLineIndex >= terminalLines.length) {
      // All lines displayed, wait a moment then fade out
      const exitTimer = setTimeout(() => {
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(exitTimer);
    }

    const currentLine = terminalLines[currentLineIndex];
    const isCommand = currentLine.type === "command";
    const typingSpeed = isCommand ? 40 : 20; // Slower for commands
    const lineDelay = isCommand ? 100 : 150; // Delay before next line

    if (isTyping && currentCharIndex < currentLine.text.length) {
      // Type next character
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
    } else if (isTyping) {
      // Line complete, move to next
      const nextLineTimer = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, lineDelay);
      return () => clearTimeout(nextLineTimer);
    }
  }, [currentLineIndex, currentCharIndex, isTyping]);

  const getLineClass = (type) => {
    switch (type) {
      case "command":
        return "terminal__line--command";
      case "success":
        return "terminal__line--success";
      case "info":
        return "terminal__line--info";
      case "final":
        return "terminal__line--final";
      default:
        return "";
    }
  };

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div
            className="terminal"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Terminal Header */}
            <div className="terminal__header">
              <div className="terminal__buttons">
                <span className="terminal__button terminal__button--close" />
                <span className="terminal__button terminal__button--minimize" />
                <span className="terminal__button terminal__button--maximize" />
              </div>
              <span className="terminal__title">aryan-dani — zsh</span>
              <div className="terminal__spacer" />
            </div>

            {/* Terminal Body */}
            <div className="terminal__body">
              {displayedLines.map((line, index) => (
                <motion.div
                  key={index}
                  className={`terminal__line ${getLineClass(line.type)}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="terminal__text">{line.displayText}</span>
                  {index === currentLineIndex - 1 ||
                    (index === displayedLines.length - 1 &&
                      currentCharIndex === terminalLines[currentLineIndex]?.text.length) ? null : null}
                </motion.div>
              ))}

              {/* Cursor */}
              {currentLineIndex < terminalLines.length && (
                <span className="terminal__cursor" />
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PageLoader;
