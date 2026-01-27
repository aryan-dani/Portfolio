import { useState, useEffect, useCallback, memo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, LayoutGroup } from "framer-motion";
import {
  FaHome,
  FaBriefcase,
  FaCode,
  FaCertificate,
  FaLaptopCode,
  FaUser,
  FaGithub,
} from "react-icons/fa";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import "./Header.scss";

// Desktop nav items
const navItems = [
  { path: "/experience", label: "Experience", icon: FaBriefcase, shortcut: "E" },
  { path: "/projects", label: "Projects", icon: FaCode, shortcut: "P" },
  { path: "/certifications", label: "Certs", icon: FaCertificate, shortcut: "C" },
  { path: "/skills", label: "Skills", icon: FaLaptopCode, shortcut: "S" },
  { path: "/about", label: "About", icon: FaUser, shortcut: "A" },
];

const mobileNavItems = [
  { path: "/", label: "Home", icon: FaHome, shortcut: "H" },
  ...navItems,
];

// Robust, smooth spring that doesn't oscillate
// This addresses the "jitter" - a critically damped spring
const coreTransition = {
  type: "spring",
  stiffness: 400,
  damping: 35, // High damping = no bounce/jitter
  mass: 0.8,
  restDelta: 0.001 // Prevents sub-pixel jitter at end of animation
};

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredPath, setHoveredPath] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => setIsMenuOpen(false), [location]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toUpperCase();
      const item = mobileNavItems.find((item) => item.shortcut === key);
      if (item) {
        e.preventDefault();
        navigate(item.path);
      } else if (e.key === "Escape") setIsMenuOpen(false);
    },
    [navigate]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // Animation variants for text elements
  // We keep them in DOM but shrink them to 0
  // This prevents the "slide from right" glitch caused by unmounting
  const textVariants = {
    collapsed: {
      width: 0,
      opacity: 0,
      marginLeft: 0,
      display: "none", // Hide from screen readers/tab order when collapsed
      transition: { ...coreTransition, display: { delay: 0.2 } } // Delay display:none to allow shrink
    },
    expanded: {
      width: "auto",
      opacity: 1,
      marginLeft: 8,
      display: "block",
      transition: coreTransition
    }
  };

  const brandVariants = {
    collapsed: {
      width: 0,
      opacity: 0,
      marginRight: 0,
      display: "none",
      transition: { ...coreTransition, display: { delay: 0.2 } }
    },
    expanded: {
      width: "auto",
      opacity: 1,
      marginRight: 20, // Increased spacing creates the "wider" look
      display: "block",
      transition: coreTransition
    }
  };

  return (
    <>
      <motion.header
        className={`floating-nav ${isExpanded ? "floating-nav--expanded" : ""}`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          setIsExpanded(false);
          setHoveredPath(null);
        }}
      >
        <LayoutGroup>
          {/* Container explicitly animates padding for extra "width" feel */}
          <motion.nav
            className="floating-nav__container"
            layout
            transition={coreTransition}
            style={{ borderRadius: 100 }} // Ensure huge radius for pill shape
          >
            {/* Brand Name - Collapses fully including padding */}
            <motion.div
              style={{ display: "flex", alignItems: "center", overflow: "hidden" }}
              initial="collapsed"
              animate={isExpanded ? "expanded" : "collapsed"}
              variants={{
                collapsed: {
                  width: 0,
                  opacity: 0,
                  marginRight: 0,
                  transition: { ...coreTransition, width: { delay: 0.1 } } // Delay collapse slightly
                },
                expanded: {
                  width: "auto",
                  opacity: 1,
                  marginRight: 20,
                  transition: coreTransition
                }
              }}
            >
              <NavLink
                to="/"
                className="floating-nav__brand-link"
                onMouseEnter={() => setHoveredPath(null)}
                style={{ display: "flex", alignItems: "center" }}
              >
                <span style={{ whiteSpace: "nowrap" }}>Aryan Dani</span>
              </NavLink>
            </motion.div>

            {/* Navigation Links */}
            <motion.ul className="floating-nav__list" layout transition={coreTransition}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                const isHovered = hoveredPath === item.path;

                return (
                  <motion.li
                    key={item.path}
                    className="floating-nav__item"
                    layout
                    transition={coreTransition}
                    onMouseEnter={() => setHoveredPath(item.path)}
                    onMouseLeave={() => setHoveredPath(null)}
                  >
                    <NavLink
                      to={item.path}
                      className={`floating-nav__link ${isActive ? "floating-nav__link--active" : ""}`}
                    >
                      {/* Hover highlight */}
                      <motion.span
                        className="floating-nav__link-bg"
                        initial={false}
                        animate={{
                          opacity: isExpanded && isHovered ? 1 : 0,
                          scale: isExpanded && isHovered ? 1 : 0.85,
                        }}
                        transition={{ duration: 0.2 }}
                      />
                      <span className="floating-nav__icon">
                        <Icon />
                      </span>

                      {/* Label - Always in DOM, animates width */}
                      <motion.span
                        className="floating-nav__label"
                        initial="collapsed"
                        animate={isExpanded ? "expanded" : "collapsed"}
                        variants={textVariants}
                        style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                      >
                        {item.label}
                      </motion.span>
                    </NavLink>
                  </motion.li>
                );
              })}
            </motion.ul>

            {/* GitHub Button - Persistent */}
            <motion.a
              href="https://github.com/Aryan-Dani"
              target="_blank"
              rel="noopener noreferrer"
              className="floating-nav__github"
              layout
              transition={coreTransition}
            >
              <FaGithub className="floating-nav__github-icon" />
              <motion.span
                className="floating-nav__github-text"
                initial="collapsed"
                animate={isExpanded ? "expanded" : "collapsed"}
                variants={textVariants}
                style={{ overflow: "hidden", whiteSpace: "nowrap" }}
              >
                GitHub
              </motion.span>
            </motion.a>
          </motion.nav>
        </LayoutGroup>
      </motion.header>

      {/* Mobile Menu Button & Overlay (Unchanged) */}
      <button
        className={`mobile-menu-btn ${isMenuOpen ? "mobile-menu-btn--open" : ""}`}
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
      >
        <span className="mobile-menu-btn__icon">
          {isMenuOpen ? <HiX /> : <HiMenuAlt3 />}
        </span>
      </button>

      <div
        className={`mobile-overlay ${isMenuOpen ? "mobile-overlay--visible" : ""}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      <nav className={`mobile-nav ${isMenuOpen ? "mobile-nav--visible" : ""}`}>
        <ul className="mobile-nav__list">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="mobile-nav__item">
                <NavLink
                  to={item.path}
                  className={`mobile-nav__link ${isActive ? "mobile-nav__link--active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mobile-nav__icon"><Icon /></span>
                  <span className="mobile-nav__label">{item.label}</span>
                  <span className="mobile-nav__shortcut">{item.shortcut}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export default memo(Header);
