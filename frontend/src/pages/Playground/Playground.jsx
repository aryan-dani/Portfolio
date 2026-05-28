import { useState, useRef, useEffect, memo } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { skills } from "../../data/skills";
import { projects } from "../../data/projects";
import { certifications } from "../../data/certifications";
import { useTheme } from "../../context/ThemeContext";
import { useModalLock } from "../../hooks/useModalLock";
import "./Playground.scss";

function Playground() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [history, setHistory] = useState([
    { text: "ARYAN DANI [PORTFOLIO INTERACTIVE CLI v2.1]", type: "info" },
    { text: "Type 'help' to view all available commands.", type: "success" },
    { text: "", type: "spacing" },
  ]);
  const [inputVal, setInputVal] = useState("");
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);
  const terminalEndRef = useRef(null);
  const inputRef = useRef(null);

  const focusInput = (e) => {
    // Only focus if clicking directly in the terminal area, don't steal from scrollbars

    const selection = window.getSelection().toString();
    if (selection) return;
    if (inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
  };

  useModalLock(isExpanded, () => setIsExpanded(false));

  useEffect(() => {
    focusInput();
  }, [isExpanded]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      const trimmedVal = inputVal.trim();
      if (trimmedVal) {
        setCmdHistory((prev) => [...prev, trimmedVal]);
      }
      setHistoryIdx(-1);
      processCommand(trimmedVal);
      setInputVal("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx =
        historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(cmdHistory[nextIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      if (historyIdx === cmdHistory.length - 1) {
        setHistoryIdx(-1);
        setInputVal("");
      } else {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInputVal(cmdHistory[nextIdx]);
      }
    }
  };

  const processCommand = (rawCommand) => {
    const args = rawCommand.toLowerCase().split(" ");
    const command = args[0];

    // Echo the command typed
    setHistory((prev) => [
      ...prev,
      { text: `guest@aryan-dani.dev:~$ ${rawCommand}`, type: "command" },
    ]);

    if (!command) return;

    switch (command) {
      case "help":
        setHistory((prev) => [
          ...prev,
          { text: "Available commands:", type: "info" },
          {
            text: "  help           - Display this helper screen",
            type: "text",
          },
          {
            text: "  about          - View biography summary and redirect",
            type: "text",
          },
          {
            text: "  experience     - List career history milestones & stack",
            type: "text",
          },
          {
            text: "  projects       - List all engineering projects with index",
            type: "text",
          },
          {
            text: "  project [N]    - View details & redirect to project N (e.g. 'project 1')",
            type: "text",
          },
          {
            text: "  skills         - List core technical skills registry",
            type: "text",
          },
          {
            text: "  certifications - List all verified credentials and dates",
            type: "text",
          },
          {
            text: "  contact        - Print developer contact info & redirect",
            type: "text",
          },
          { text: "  socials        - List direct social links", type: "text" },
          {
            text: "  theme          - Toggle between light and dark modes",
            type: "text",
          },
          {
            text: "  clear          - Clear terminal log history",
            type: "text",
          },
        ]);
        break;

      case "clear":
        setHistory([
          { text: "ARYAN DANI [PORTFOLIO INTERACTIVE CLI v2.1]", type: "info" },
          {
            text: "Type 'help' to view all available commands.",
            type: "success",
          },
          { text: "", type: "spacing" },
        ]);
        break;

      case "theme":
        toggleTheme();
        setHistory((prev) => [
          ...prev,
          {
            text: `Theme successfully toggled. Current mode: ${theme === "light" ? "dark" : "light"}`,
            type: "success",
          },
        ]);
        break;

      case "skills":
        const allSkills = Object.values(skills)
          .flat()
          .map((s) => s.name)
          .join(", ");
        setHistory((prev) => [
          ...prev,
          { text: "Core Technical Skills Registry:", type: "info" },
          { text: allSkills, type: "text" },
        ]);
        break;

      case "projects":
        setHistory((prev) => [
          ...prev,
          { text: "Portfolio Projects Directory:", type: "info" },
          ...projects.map((p, idx) => ({
            text: `  [${idx + 1}] ${p.title} - ${p.category.toUpperCase()}`,
            type: "text",
          })),
        ]);
        break;

      case "project":
        const idx = parseInt(args[1], 10) - 1;
        if (isNaN(idx) || idx < 0 || idx >= projects.length) {
          setHistory((prev) => [
            ...prev,
            {
              text: "Error: Please specify a valid project index, e.g. 'project 1'",
              type: "error",
            },
          ]);
        } else {
          const proj = projects[idx];
          setHistory((prev) => [
            ...prev,
            { text: `Title: ${proj.title}`, type: "info" },
            { text: `Category: ${proj.category.toUpperCase()}`, type: "text" },
            { text: `Description: ${proj.description}`, type: "text" },
            { text: `Routing you to project section...`, type: "success" },
          ]);
          setTimeout(() => {
            navigate(`/projects?highlight=${proj.id}`);
          }, 1500);
        }
        break;

      case "certifications":
        setHistory((prev) => [
          ...prev,
          { text: "Credentials & Certifications:", type: "info" },
          ...certifications.map((c, idx) => ({
            text: `  [${idx + 1}] ${c.title} — Issued by ${c.issuer} (${c.date})`,
            type: "text",
          })),
        ]);
        break;

      case "about":
        setHistory((prev) => [
          ...prev,
          {
            text: "Aryan Dani — Full Stack Developer & AI Engineer",
            type: "info",
          },
          {
            text: "Specializes in building modern high-contrast neobrutalist platforms, fine-tuning large language models, setting up multimodal RAG architectures, and programming creative interfaces.",
            type: "text",
          },
          { text: "Redirecting you to the About section...", type: "success" },
        ]);
        setTimeout(() => navigate("/about"), 1500);
        break;

      case "experience":
        setHistory((prev) => [
          ...prev,
          { text: "Career Timeline Experiences:", type: "info" },
          {
            text: "  [1] Intern (AI Engineer) @ Artem HealthTech Pvt. Ltd. (Jan - May 2025)",
            type: "text",
          },
          {
            text: "      - Designed CNN/VLM diagnostic networks & WebSocket voice-to-text tools.",
            type: "text",
          },
          {
            text: "  [2] Autonomous Systems Lead @ MIT-WPU AI Capstone (June - Dec 2025)",
            type: "text",
          },
          {
            text: "      - Built Capstone YOLO v11 detector & LangGraph repository healer sandbox.",
            type: "text",
          },
          {
            text: "  [3] Lead Full-Stack Web Architect (July 2024 - Present)",
            type: "text",
          },
          {
            text: "      - Crafted Next.js applications (Fourth Clover) & high-contrast Neobrutalist layouts.",
            type: "text",
          },
        ]);
        break;

      case "contact":
        setHistory((prev) => [
          ...prev,
          { text: "Contact Details:", type: "info" },
          { text: "  Email: daniaryan212@gmail.com", type: "text" },
          { text: "  LinkedIn: linkedin.com/in/aryandani/", type: "text" },
          { text: "  GitHub: github.com/aryan-dani", type: "text" },
          { text: "Redirecting to contact page...", type: "success" },
        ]);
        setTimeout(() => navigate("/contact"), 1500);
        break;

      case "socials":
        setHistory((prev) => [
          ...prev,
          { text: "Social profiles:", type: "info" },
          { text: "  GitHub:    https://github.com/aryan-dani", type: "text" },
          {
            text: "  LinkedIn:  https://www.linkedin.com/in/aryandani/",
            type: "text",
          },
          {
            text: "  Instagram: https://www.instagram.com/aryandani_06/",
            type: "text",
          },
        ]);
        break;

      case "resume":
        setHistory((prev) => [
          ...prev,
          { text: "Opening resume details in About...", type: "success" },
        ]);
        setTimeout(() => navigate("/about"), 1000);
        break;

      default:
        setHistory((prev) => [
          ...prev,
          {
            text: `Command not found: '${command}'. Type 'help' to see list of valid commands.`,
            type: "error",
          },
        ]);
    }
  };

  const renderTerminalContent = () => (
    <>
      {/* Terminal Header / Title bar */}
      <div className="flex justify-between items-center border-b-2 border-dashed border-outline-variant pb-3 mb-4 select-none shrink-0">
        <div className="flex gap-2">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56] border border-[#e0443e] hover:opacity-85 transition-opacity" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e] border border-[#d89e24] hover:opacity-85 transition-opacity" />
          <span className="w-3 h-3 rounded-full bg-[#27c93f] border border-[#1a9c2b] hover:opacity-85 transition-opacity" />
        </div>
        <div className="text-xs font-bold font-mono text-on-surface-variant uppercase tracking-wider">
          guest@aryan-dani.dev: ~ {isExpanded ? "[EXPANDED]" : "[NORMAL]"}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="bg-(--color-primary-container) border-2 border-(--color-outline) text-(--color-on-primary-container) px-3 py-1 text-xs font-bold uppercase cursor-none hover:bg-(--color-accent-warm) transition-colors active:translate-y-0.5 active:translate-x-0.5 active:shadow-none shadow-[2px_2px_0px_0px_var(--shadow-color)]"
        >
          {isExpanded ? "Collapse ↙" : "Expand ⛶"}
        </button>
      </div>

      {/* Terminal logs list */}
      <div className="grow overflow-y-auto space-y-2 pr-2">
        {history.map((line, index) => {
          if (line.type === "spacing")
            return <div key={index} className="h-2" />;
          const colorClass =
            line.type === "command"
              ? "text-blue-600 dark:text-blue-400 font-bold"
              : line.type === "info"
                ? "text-amber-600 dark:text-amber-400 font-bold"
                : line.type === "success"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : line.type === "error"
                    ? "text-[var(--color-error)]"
                    : "text-[var(--color-on-surface)]";
          return (
            <div
              key={index}
              className={`text-sm md:text-base leading-relaxed ${colorClass} whitespace-pre-wrap`}
            >
              {line.text}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Input prompt line */}
      <div className="flex items-center gap-2 border-t-2 border-dashed border-outline-variant pt-4 mt-4 relative shrink-0">
        <span className="text-blue-600 dark:text-blue-400 font-bold text-sm md:text-base shrink-0">
          guest@aryan-dani.dev:~$
        </span>

        <div className="relative grow flex items-center h-6">
          {/* Real input, caret-invisible & text-transparent, captures typing */}
          <input
            ref={inputRef}
            type="text"
            className="absolute inset-0 bg-transparent border-none outline-none font-mono text-sm md:text-base focus:ring-0 p-0 w-full z-10 cursor-none select-none"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={60}
            autoFocus
            autoComplete="off"
            spellCheck="false"
            style={{ color: "transparent", caretColor: "transparent" }}
          />
          {/* Display overlay with typing text and custom blinking block cursor */}
          <div className="absolute left-0 top-0 bottom-0 right-0 flex items-center font-mono text-sm md:text-base text-(--color-on-surface) pointer-events-none select-none whitespace-pre">
            <span>{inputVal}</span>
            <span className="w-2.5 h-4.5 bg-(--color-primary-container) border border-(--color-outline) animate-blink ml-0.5 inline-block align-middle" />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <section className="flex flex-col gap-12 w-full mt-4">
      <header className="mb-4 border-b-8 border-(--color-outline) pb-8 flex flex-col justify-end items-start gap-6">
        <div className="bg-(--color-primary-container) border-4 border-(--color-outline) px-6 py-4 shadow-[8px_8px_0px_0px_var(--shadow-color)]">
          <h1 className="font-headline-xl text-5xl md:text-7xl lg:text-headline-xl text-(--color-on-primary-container) uppercase tracking-tighter">
            CLI PLAYGROUND
          </h1>
        </div>
        <p className="font-body-lg text-base md:text-lg lg:text-body-lg text-(--color-on-surface) mt-2 max-w-2xl bg-(--color-surface) border-4 border-(--color-outline) p-4 shadow-[4px_4px_0px_0px_var(--shadow-color)]">
          Use the keyboard command line interface to query projects, list
          skills, toggle themes, or navigate the site directly.
        </p>
      </header>

      {/* Render collapsed inline terminal */}
      {!isExpanded && (
        <div
          className="nb-cli-container border-4 border-(--color-outline) bg-(--color-surface) p-6 font-mono flex flex-col relative overflow-hidden transition-all duration-300 min-h-120 h-120 w-full shadow-[8px_8px_0px_0px_var(--shadow-color)]"
          onClick={focusInput}
        >
          {renderTerminalContent()}
        </div>
      )}

      {/* Render expanded terminal in a portal */}
      {isExpanded && createPortal(
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-190 cursor-none"
          />
          <div
            className="nb-cli-container border-4 border-(--color-outline) bg-(--color-surface) p-6 font-mono flex flex-col fixed top-4 md:top-8 bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 w-[calc(100%-32px)] md:w-[calc(100%-64px)] max-w-4xl z-200 h-[calc(100vh-32px)] md:h-[calc(100vh-64px)] shadow-[12px_12px_0px_0px_var(--shadow-color)] overflow-hidden"
            onClick={focusInput}
          >
            {renderTerminalContent()}
          </div>
        </>,
        document.body
      )}
    </section>
  );
}

export default memo(Playground);
