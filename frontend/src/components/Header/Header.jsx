import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaHome,
  FaBriefcase,
  FaCode,
  FaCertificate,
  FaLaptopCode,
  FaUser,
} from "react-icons/fa";
import "./Header.scss";

const navItems = [
  { path: "/", label: "Home", icon: FaHome, shortcut: "h" },
  {
    path: "/experience",
    label: "Experience",
    icon: FaBriefcase,
    shortcut: "e",
  },
  { path: "/projects", label: "Projects", icon: FaCode, shortcut: "p" },
  {
    path: "/certifications",
    label: "Certifications",
    icon: FaCertificate,
    shortcut: "c",
  },
  { path: "/skills", label: "Skills", icon: FaLaptopCode, shortcut: "s" },
  { path: "/about", label: "About", icon: FaUser, shortcut: "a" },
];

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    // Close menu on route change
    setIsMenuOpen(false);
  }, [location]);

  useEffect(() => {
    // Keyboard navigation with Alt shortcuts
    const handleKeyDown = (e) => {
      if (e.altKey) {
        const key = e.key.toLowerCase();

        // Toggle menu with Alt+M
        if (key === "m") {
          e.preventDefault();
          setIsMenuOpen((prev) => !prev);
          return;
        }

        // Navigate to pages with shortcuts
        const navItem = navItems.find((item) => item.shortcut === key);
        if (navItem) {
          e.preventDefault();
          navigate(navItem.path);
          setIsMenuOpen(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  useEffect(() => {
    // Prevent body scroll when menu is open
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const menuVariants = {
    closed: {
      opacity: 0,
      x: "100%",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const navItemVariants = {
    closed: { opacity: 0, x: 50 },
    open: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  return (
    <header className={`header ${isScrolled ? "header--scrolled" : ""}`}>
      <button
        className={`menu-btn ${isMenuOpen ? "menu-btn--open" : ""}`}
        onClick={toggleMenu}
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        aria-expanded={isMenuOpen}
      >
        <span className="menu-btn__burger"></span>
        <span className="menu-btn__shortcut">Alt+M</span>
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            className="nav"
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
          >
            <ul className="nav__list">
              {navItems.map((item, index) => (
                <motion.li
                  key={item.path}
                  className="nav__item"
                  custom={index}
                  variants={navItemVariants}
                >
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `nav__link ${isActive ? "nav__link--active" : ""}`
                    }
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <item.icon className="nav__icon" />
                    <span>{item.label}</span>
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>

      {isMenuOpen && (
        <div className="nav-overlay" onClick={() => setIsMenuOpen(false)} />
      )}
    </header>
  );
}

export default Header;
