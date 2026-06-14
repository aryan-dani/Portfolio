import { useState, useEffect, useRef, memo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import { FaSun, FaMoon } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../context/ThemeContext";
import { defaultSpring, snappySpring, motionEase } from "../../utils/motionVariants";

const navItems = [
  { path: "/projects",       label: "Projects" },
  { path: "/experience",     label: "Experience" },
  { path: "/certifications", label: "Certifications" },
  { path: "/skills",         label: "Skills" },
  { path: "/about",          label: "About" },
  { path: "/playground",     label: "Playground" },
];

const menuVariants = {
  hidden: { opacity: 0, y: -10, pointerEvents: "none" },
  visible: {
    opacity: 1,
    y: 0,
    pointerEvents: "auto",
    transition: { ...defaultSpring, staggerChildren: 0.06, delayChildren: 0.04 },
  },
  exit: {
    opacity: 0,
    y: -10,
    pointerEvents: "none",
    transition: { duration: 0.26, ease: motionEase.in, staggerChildren: 0.03, staggerDirection: -1 },
  },
};

const menuItemVariants = {
  hidden:  { opacity: 0, x: -24, rotate: -3 },
  visible: { opacity: 1, x: 0, rotate: 0, transition: defaultSpring },
  exit:    { opacity: 0, x: -16, rotate: 2, transition: { duration: 0.2, ease: motionEase.in } },
};

function Header() {
  const [isMenuOpen, setIsMenuOpen]   = useState(false);
  const [isScrolled, setIsScrolled]   = useState(false);
  const [isThemeAnim, setIsThemeAnim] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Detect scroll for header shrink effect
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 40;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleTheme = () => {
    setIsThemeAnim(true);
    toggleTheme();
    setTimeout(() => setIsThemeAnim(false), 700);
  };

  return (
    <>
      <nav
        className={`sticky top-0 w-full border-b-4 z-50 transition-all duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isScrolled
            ? "border-[var(--color-outline)] shadow-[0_5px_0_0_var(--shadow-color)]"
            : "border-[var(--color-outline)] shadow-[0_8px_0_0_var(--shadow-color)]"
        } glass`}
        style={{ backgroundColor: "color-mix(in srgb, var(--color-surface) 78%, transparent)" }}
      >
        <div
          className="flex justify-between items-center px-4 md:px-8 w-full h-16 md:h-20"
        >
          {/* Logo */}
          <div>
            <NavLink
              to="/"
              className="block text-2xl font-black tracking-tighter text-[var(--color-on-primary-container)] border-4 border-[var(--color-outline)] px-4 py-2 bg-[var(--color-primary-container)] shadow-[4px_4px_0_0_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0_0_var(--shadow-color)] transition-all duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] select-none"
            >
              ARYAN DANI
            </NavLink>
          </div>

          <div className="hidden md:flex gap-1 lg:gap-2 items-center font-headline-md uppercase tracking-tighter font-bold text-sm lg:text-base relative">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative font-bold px-3 py-2 border-4 border-transparent transition-all duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] select-none ${
                    isActive
                      ? "text-[var(--color-on-primary-container)]"
                      : "text-[var(--color-on-surface)] hover:border-[var(--color-outline)] hover:bg-[var(--color-surface-variant)]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute -inset-[4px] bg-[var(--color-primary-container)] border-4 border-[var(--color-outline)] shadow-[2px_2px_0_0_var(--shadow-color)] -z-10 overflow-hidden"
                      transition={defaultSpring}
                    >
                      <div className="absolute inset-0 animate-shimmer opacity-35" />
                    </motion.div>
                  )}
                  {item.label}
                </NavLink>
              );
            })}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            <NavLink
              to="/contact"
              className="font-headline-md text-sm lg:text-base uppercase tracking-widest font-black text-[var(--color-on-primary-container)] bg-[var(--color-primary-container)] border-4 border-[var(--color-outline)] px-5 py-3 shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_var(--shadow-color)] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] flex items-center justify-center whitespace-nowrap"
            >
              Work with me
            </NavLink>

            {/* Theme Toggle */}
            <motion.button
              onClick={handleToggleTheme}
              className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-[var(--color-outline)] w-12 h-12 flex items-center justify-center text-lg shadow-[4px_4px_0_0_var(--shadow-color)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] transition-all duration-[220ms] ease-[cubic-bezier(0.22,1,0.36,1)] cursor-none overflow-hidden"
              aria-label="Toggle theme"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                  transition={snappySpring}
                >
                  {theme === "dark" ? (
                    <FaSun className="text-xl" />
                  ) : (
                    <FaMoon className="text-xl" />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>

          {/* Mobile actions */}
          <div className="flex md:hidden items-center gap-2">
            <motion.button
              onClick={handleToggleTheme}
              className="bg-[var(--color-surface)] text-[var(--color-on-surface)] border-4 border-[var(--color-outline)] w-10 h-10 flex items-center justify-center text-base shadow-[2px_2px_0_0_var(--shadow-color)] hover:shadow-none transition-all cursor-none overflow-hidden"
              aria-label="Toggle theme"
              whileTap={{ scale: 0.9 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.28, ease: motionEase.out }}
                >
                  {theme === "dark" ? <FaSun /> : <FaMoon />}
                </motion.span>
              </AnimatePresence>
            </motion.button>

            <button
              className="text-[var(--color-on-surface)] p-2"
              onClick={() => setIsMenuOpen((p) => !p)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isMenuOpen ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.28, ease: motionEase.out }}
                >
                  {isMenuOpen ? <HiX size={28} /> : <HiMenuAlt3 size={28} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-40 top-[64px] flex flex-col items-center pt-8 pb-8 border-t-4 border-[var(--color-outline)] font-headline-md uppercase font-bold text-xl gap-4 overflow-y-auto"
            style={{ backgroundColor: "color-mix(in srgb, var(--color-surface) 95%, transparent)", backdropFilter: "blur(16px)" }}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Home item */}
            <motion.div variants={menuItemVariants} className="w-[80%]">
              <NavLink
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block w-full text-center py-3 px-4 border-4 transition-all text-[var(--color-on-surface)] ${
                    isActive
                      ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-[var(--color-outline)] shadow-[4px_4px_0_0_var(--shadow-color)]"
                      : "border-transparent hover:border-[var(--color-outline)] hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)]"
                  }`
                }
              >
                Home
              </NavLink>
            </motion.div>

            {navItems.map((item) => (
              <motion.div key={item.path} variants={menuItemVariants} className="w-[80%]">
                <NavLink
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block w-full text-center py-3 px-4 border-4 transition-all text-[var(--color-on-surface)] ${
                      isActive
                        ? "bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-[var(--color-outline)] shadow-[4px_4px_0_0_var(--shadow-color)]"
                        : "border-transparent hover:border-[var(--color-outline)] hover:bg-[var(--color-primary-container)] hover:text-[var(--color-on-primary-container)]"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </motion.div>
            ))}

            <motion.div variants={menuItemVariants} className="w-[80%] mt-2">
              <NavLink
                to="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex justify-center items-center font-headline-md text-lg uppercase tracking-widest font-black text-[var(--color-on-primary-container)] bg-[var(--color-primary-container)] border-4 border-[var(--color-outline)] px-4 py-3 shadow-[6px_6px_0px_0px_var(--shadow-color)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                Work with me
              </NavLink>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default memo(Header);
