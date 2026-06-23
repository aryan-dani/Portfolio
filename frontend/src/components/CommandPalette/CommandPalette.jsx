import { useState, useEffect, useRef, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiOutlineSearch, HiArrowRight, HiOutlineFolderOpen, HiOutlineCode, HiOutlineBriefcase, HiOutlineLink, HiOutlineDocumentText, HiOutlineMap, HiOutlineColorSwatch } from "react-icons/hi";
import { useTheme } from "../../context/ThemeContext";

import { projects } from "../../data/projects";
import { getAllSkills } from "../../data/skills";
import { experiences, socialLinks, aboutInfo } from "../../data/experience";

const staticNavCommands = [
  { id: "nav-home", label: "Home", action: "/", type: "nav", icon: HiOutlineMap },
  { id: "nav-projects", label: "Projects", action: "/projects", type: "nav", icon: HiOutlineMap },
  { id: "nav-experience", label: "Experience", action: "/experience", type: "nav", icon: HiOutlineMap },
  { id: "nav-certifications", label: "Certifications", action: "/certifications", type: "nav", icon: HiOutlineMap },
  { id: "nav-skills", label: "Skills", action: "/skills", type: "nav", icon: HiOutlineMap },
  { id: "nav-about", label: "About", action: "/about", type: "nav", icon: HiOutlineMap },
  { id: "nav-playground", label: "Playground", action: "/playground", type: "nav", icon: HiOutlineMap },
  { id: "nav-contact", label: "Contact", action: "/contact", type: "nav", icon: HiOutlineMap },
  { id: "action-theme", label: "Toggle Theme", action: "TOGGLE_THEME", type: "action", icon: HiOutlineColorSwatch },
];

function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  // Build the unified search index once
  const searchIndex = useMemo(() => {
    const index = [...staticNavCommands];

    // Projects
    projects.forEach(p => {
      index.push({
        id: `project-${p.id}`,
        label: p.title,
        action: `/projects?highlight=${p.id}`,
        type: "project",
        icon: HiOutlineFolderOpen,
        keywords: (p.tags || []).join(" ") + " " + (p.description || "")
      });
    });

    // Skills
    getAllSkills().forEach(s => {
      index.push({
        id: `skill-${s.id}`,
        label: s.name,
        action: `/skills?skill=${s.id}`,
        type: "skill",
        icon: HiOutlineCode,
        keywords: s.description || ""
      });
    });

    // Experience
    experiences.forEach(e => {
      index.push({
        id: `exp-${e.id}`,
        label: `${e.position} at ${e.company}`,
        action: `/experience`,
        type: "experience",
        icon: HiOutlineBriefcase,
        keywords: (e.technologies || []).join(" ") + " " + (e.responsibilities || []).join(" ")
      });
    });

    // Socials
    socialLinks.forEach(s => {
      index.push({
        id: `social-${s.name}`,
        label: s.name,
        action: s.url,
        type: "link",
        icon: HiOutlineLink,
        isExternal: true
      });
    });

    // Resume
    if (aboutInfo.resumeUrl) {
      index.push({
        id: `doc-resume`,
        label: "Resume",
        action: aboutInfo.resumeUrl,
        type: "document",
        icon: HiOutlineDocumentText,
        isExternal: true
      });
    }

    return index;
  }, []);

  // Filter commands
  const filteredCommands = useMemo(() => {
    if (!query.trim()) return searchIndex;
    const q = query.toLowerCase();
    const qNoSpace = q.replace(/\s+/g, "");
    return searchIndex.filter((cmd) => {
      const labelLower = cmd.label.toLowerCase();
      const labelNoSpace = labelLower.replace(/\s+/g, "");
      const keywordsLower = (cmd.keywords || "").toLowerCase();
      const keywordsNoSpace = keywordsLower.replace(/\s+/g, "");
      return (
        labelLower.includes(q) ||
        labelNoSpace.includes(qNoSpace) ||
        keywordsLower.includes(q) ||
        keywordsNoSpace.includes(qNoSpace)
      );
    });
  }, [query, searchIndex]);

  // Reset selected index when query changes
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
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] sm:pt-[15vh] pointer-events-none px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-2xl bg-[var(--color-surface)] border-4 border-outline shadow-[16px_16px_0px_0px_var(--shadow-color)] pointer-events-auto flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center border-b-4 border-outline px-4 py-3 sm:py-5 bg-[var(--color-surface-variant)]">
                <HiOutlineSearch className="text-2xl text-[var(--color-on-surface-variant)] mr-4 shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
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
              <div className="max-h-[55vh] overflow-y-auto no-scrollbar py-2">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, index) => {
                    const Icon = cmd.icon;
                    return (
                      <div
                        key={cmd.id}
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
                  })
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
