import { useState, useEffect, useCallback, memo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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

// Desktop nav items - defined outside component to avoid recreation
const navItems = [
  { path: "/", label: "Home", icon: FaHome, shortcut: "H" },
  {
    path: "/experience",
    label: "Experience",
    icon: FaBriefcase,
    shortcut: "E",
  },
  { path: "/projects", label: "Projects", icon: FaCode, shortcut: "P" },
  {
    path: "/certifications",
    label: "Certifications",
    icon: FaCertificate,
    shortcut: "C",
  },
  { path: "/skills", label: "Skills", icon: FaLaptopCode, shortcut: "S" },
  { path: "/about", label: "About", icon: FaUser, shortcut: "A" },
];

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Initial mount animation trigger
  useEffect(() => {
    const timer = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  // Close menu on location change
  useEffect(() => setIsMenuOpen(false), [location]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")
        return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const key = e.key.toUpperCase();
      const item = navItems.find((item) => item.shortcut === key);
      if (item) {
        e.preventDefault();
        navigate(item.path);
      } else if (e.key === "Escape") setIsMenuOpen(false);
    },
    [navigate],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Body scroll lock when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  return (
    <>
      <header
        className={`floating-nav ${isMounted ? "floating-nav--mounted" : ""}`}
      >
        <nav className="floating-nav__container">
          {/* Navigation Links */}
          <ul className="floating-nav__list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path} className="floating-nav__item">
                  <NavLink
                    to={item.path}
                    className={`floating-nav__link ${isActive ? "floating-nav__link--active" : ""}`}
                    title={item.label}
                  >
                    <span className="floating-nav__icon">
                      <Icon />
                    </span>
                    <span className="floating-nav__tooltip">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* Divider */}
          <span className="floating-nav__divider" />

          {/* GitHub Button */}
          <a
            href="https://github.com/Aryan-Dani"
            target="_blank"
            rel="noopener noreferrer"
            className="floating-nav__link floating-nav__github"
            title="GitHub"
          >
            <span className="floating-nav__icon">
              <FaGithub />
            </span>
            <span className="floating-nav__tooltip">GitHub</span>
          </a>
        </nav>
      </header>

      {/* Mobile Menu Button & Overlay */}
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
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="mobile-nav__item">
                <NavLink
                  to={item.path}
                  className={`mobile-nav__link ${isActive ? "mobile-nav__link--active" : ""}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="mobile-nav__icon">
                    <Icon />
                  </span>
                  <span className="mobile-nav__label">{item.label}</span>
                  <span className="mobile-nav__shortcut">{item.shortcut}</span>
                </NavLink>
              </li>
            );
          })}
          {/* GitHub link in mobile menu */}
          <li className="mobile-nav__item">
            <a
              href="https://github.com/Aryan-Dani"
              target="_blank"
              rel="noopener noreferrer"
              className="mobile-nav__link"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="mobile-nav__icon">
                <FaGithub />
              </span>
              <span className="mobile-nav__label">GitHub</span>
              <span className="mobile-nav__shortcut">G</span>
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

export default memo(Header);
