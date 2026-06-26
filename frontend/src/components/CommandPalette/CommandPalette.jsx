import { useState, useEffect, useRef, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineSearch, HiArrowRight } from "react-icons/hi";
import { useTheme } from "../../context/ThemeContext";
import { useModalLock } from "../../hooks/useModalLock";
import { staticNavCommands } from "../../utils/commandPaletteStatic";
import { aboutInfo } from "../../data/experience";

function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const inputRef = useRef(null);
  useModalLock(isOpen, () => setIsOpen(false));

  const [searchIndex, setSearchIndex] = useState(staticNavCommands);
  const indexBuiltRef = useRef(false);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return searchIndex;
    const q = query.toLowerCase();
    const qNoSpace = q.replace(/\s+/g, "");
    return searchIndex
      .map((cmd) => {
      const labelLower = cmd.label.toLowerCase();
      const labelNoSpace = labelLower.replace(/\s+/g, "");
      const keywordsLower = (cmd.keywords || "").toLowerCase();
      const keywordsNoSpace = keywordsLower.replace(/\s+/g, "");
        let score = 0;
        if (labelLower === q) score += 100;
        if (labelLower.startsWith(q)) score += 60;
        if (labelLower.includes(q)) score += 30;
        if (labelNoSpace.includes(qNoSpace)) score += 20;
        if (keywordsLower.includes(q)) score += 12;
        if (keywordsNoSpace.includes(qNoSpace)) score += 8;
        return { ...cmd, score };
      })
      .filter((cmd) => cmd.score > 0)
      .sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));
  }, [query, searchIndex]);

  const groupedCommands = useMemo(() => {
    const order = ["action", "nav", "project", "skill", "experience", "document", "link"];
    return order
      .map((type) => ({
        type,
        items: filteredCommands.filter((cmd) => cmd.type === type),
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredCommands]);

  useEffect(() => {
    if (!isOpen || indexBuiltRef.current) return undefined;

    let cancelled = false;
    import("../../utils/buildCommandSearchIndex").then(({ buildCommandSearchIndex }) => {
      if (cancelled) return;
      setSearchIndex(buildCommandSearchIndex());
      indexBuiltRef.current = true;
    });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global keydown listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey || e.altKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle keys inside palette
  useEffect(() => {
    if (!isOpen) return;
    
    // Focus input on open
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    const handlePaletteKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const selectedCmd = filteredCommands[selectedIndex];
        if (selectedCmd) {
          executeCommand(selectedCmd);
        }
      }
    };

    window.addEventListener("keydown", handlePaletteKeyDown);
    return () => window.removeEventListener("keydown", handlePaletteKeyDown);
  }, [isOpen, filteredCommands, selectedIndex]);

  const executeCommand = (cmd) => {
    if (cmd.action === "TOGGLE_THEME") {
      toggleTheme();
    } else if (cmd.action === "COPY_EMAIL") {
      navigator.clipboard?.writeText(aboutInfo.email);
    } else if (cmd.isExternal) {
      window.open(cmd.action, "_blank");
    } else {
      navigate(cmd.action);
    }
    setIsOpen(false);
    setQuery("");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
            className="fixed inset-0 z-[100] bg-black/55 gpu-layer"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] sm:pt-[12vh] pointer-events-none px-4 gpu-layer">
            <motion.div
              initial={{ opacity: 0, y: -10, clipPath: "inset(0 0 100% 0)" }}
              animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0)" }}
              exit={{ opacity: 0, y: -8, clipPath: "inset(0 0 100% 0)" }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl bg-[var(--color-surface)] border-4 border-outline shadow-[16px_16px_0px_0px_var(--shadow-color)] pointer-events-auto flex flex-col overflow-hidden paint-isolate"
              role="dialog"
              aria-modal="true"
              aria-labelledby="command-palette-title"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 id="command-palette-title" className="sr-only">
                Command palette
              </h2>
              {/* Search Input */}
              <div className="flex items-center border-b-4 border-outline px-4 py-3 sm:py-5 bg-[var(--color-surface-variant)]">
                <HiOutlineSearch className="text-2xl text-[var(--color-on-surface-variant)] mr-4 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  aria-label="Search commands, projects, skills, and pages"
                  aria-controls="command-palette-results"
                  aria-activedescendant={filteredCommands[selectedIndex]?.id ? `command-${filteredCommands[selectedIndex].id}` : undefined}
                  placeholder="Search projects, skills, or navigate..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none border-none font-headline-md text-lg sm:text-2xl text-[var(--color-on-surface)] cursor-none placeholder:text-[var(--color-text-muted)]"
                />
                <div className="hidden sm:block text-xs font-bold bg-[var(--color-surface)] border-2 border-outline px-2 py-1 shadow-[2px_2px_0px_0px_var(--shadow-color)] ml-4 shrink-0 uppercase tracking-widest text-[var(--color-on-surface)]">
                  ESC
                </div>
              </div>

              {/* Results List */}
              <div
                id="command-palette-results"
                role="listbox"
                aria-label="Command palette results"
                className="max-h-[55vh] overflow-y-auto overscroll-contain no-scrollbar py-2 content-visibility-auto"
                data-lenis-prevent
              >
                {filteredCommands.length > 0 ? (
                  groupedCommands.map((group) => (
                    <div key={group.type}>
                      <div className="px-4 sm:px-6 py-2 font-label-bold text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-muted)] bg-[var(--color-surface)]">
                        {group.type}
                      </div>
                      {group.items.map((cmd) => {
                        const index = filteredCommands.findIndex((item) => item.id === cmd.id);
                        const Icon = cmd.icon;
                        return (
                          <div
                            key={cmd.id}
                            id={`command-${cmd.id}`}
                            role="option"
                            aria-selected={index === selectedIndex}
                            className={`flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 cursor-pointer transition-colors border-l-4 ${
                              index === selectedIndex
                                ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-outline"
                                : "border-transparent hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)]"
                            }`}
                            onClick={() => executeCommand(cmd)}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <Icon className={`text-xl sm:text-2xl shrink-0 ${index === selectedIndex ? "text-[var(--color-on-primary-container)]" : "text-[var(--color-text-muted)]"}`} />
                              <span className="font-headline-md text-base sm:text-xl truncate text-ellipsis w-full max-w-[200px] sm:max-w-[350px]">
                                {cmd.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className={`hidden sm:block px-2 py-1 border-2 text-[10px] sm:text-xs font-label-bold uppercase tracking-widest ${
                                index === selectedIndex
                                  ? "border-outline bg-[var(--color-on-primary-container)] text-[var(--color-primary-container)]"
                                  : "border-[var(--color-outline-variant)] text-[var(--color-text-muted)]"
                              }`}>
                                {cmd.type}
                              </span>
                              {index === selectedIndex && (
                                <HiArrowRight className="text-xl opacity-80 shrink-0" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-12 flex flex-col items-center text-[var(--color-text-muted)]">
                     <HiOutlineSearch className="text-4xl mb-4 opacity-50" />
                     <span className="font-headline-md text-xl">No results found.</span>
                     <span className="font-body-md text-sm mt-1">Try a different search term.</span>
                  </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="border-t-4 border-outline p-3 sm:p-4 bg-[var(--color-surface-variant)] flex items-center justify-between text-xs sm:text-sm font-label-bold text-[var(--color-on-surface-variant)] uppercase tracking-wider">
                <div className="flex gap-4">
                  <span className="flex items-center gap-2">
                    <kbd className="font-sans border-2 border-outline px-1.5 py-0.5 shadow-[1px_1px_0px_0px_var(--shadow-color)] bg-[var(--color-surface)] text-[var(--color-on-surface)]">↑</kbd>
                    <kbd className="font-sans border-2 border-outline px-1.5 py-0.5 shadow-[1px_1px_0px_0px_var(--shadow-color)] bg-[var(--color-surface)] text-[var(--color-on-surface)]">↓</kbd>
                    Navigate
                  </span>
                  <span className="flex items-center gap-2">
                    <kbd className="font-sans border-2 border-outline px-1.5 py-0.5 shadow-[1px_1px_0px_0px_var(--shadow-color)] bg-[var(--color-surface)] text-[var(--color-on-surface)]">Enter</kbd>
                    Select
                  </span>
                  <span className="hidden md:flex items-center gap-2">
                    <kbd className="font-sans border-2 border-outline px-1.5 py-0.5 shadow-[1px_1px_0px_0px_var(--shadow-color)] bg-[var(--color-surface)] text-[var(--color-on-surface)]">Alt</kbd>
                    <kbd className="font-sans border-2 border-outline px-1.5 py-0.5 shadow-[1px_1px_0px_0px_var(--shadow-color)] bg-[var(--color-surface)] text-[var(--color-on-surface)]">1-8</kbd>
                    Navigate
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default memo(CommandPalette);
