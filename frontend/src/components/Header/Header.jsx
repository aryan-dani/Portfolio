import { useState, useEffect, useCallback } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaBriefcase,
  FaCode,
  FaCertificate,
  FaLaptopCode,
  FaUser,
} from "react-icons/fa";
import { HiMenuAlt3, HiX } from "react-icons/hi";
import "./Header.scss";

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
    label: "Certs",
    icon: FaCertificate,
    shortcut: "C",
  },
  { path: "/skills", label: "Skills", icon: FaLaptopCode, shortcut: "S" },
  { path: "/about", label: "About", icon: FaUser, shortcut: "A" },
];

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Show navbar when mouse is near the top of the viewport (desktop only)
  useEffect(() => {
    const handleMouseMove = (e) => {
      const triggerZone = 50;
      if (e.clientY <= triggerZone) {
        setIsNavVisible(true);
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Handle navigation
  const handleNavigation = useCallback(
    (path) => {
      navigate(path);
      setIsMenuOpen(false);
    },
    [navigate],
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.altKey) {
        const key = e.key.toLowerCase();
        if (key === "m") {
          e.preventDefault();
          setIsMenuOpen((prev) => !prev);
          return;
        }
        const navItem = navItems.find(
          (item) => item.shortcut.toLowerCase() === key,
        );
        if (navItem) {
          e.preventDefault();
          handleNavigation(navItem.path);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNavigation]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleNavMouseLeave = () => {
    setIsNavVisible(false);
  };

  return (
    <>
      {/* Invisible trigger zone at top */}
      <div
        className="nav-trigger-zone"
        onMouseEnter={() => setIsNavVisible(true)}
      />

      {/* Desktop Floating Navbar */}
      <header
        className={`floating-nav ${isNavVisible ? "floating-nav--visible" : ""}`}
        onMouseLeave={handleNavMouseLeave}
      >
        <nav className="floating-nav__container">
          <ul className="floating-nav__list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path} className="floating-nav__item">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `floating-nav__link ${isActive ? "floating-nav__link--active" : ""}`
                    }
                  >
                    <span className="floating-nav__icon">
                      <Icon />
                    </span>
                    <span className="floating-nav__label">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* Mobile Menu Button - Always visible on mobile */}
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

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-overlay ${isMenuOpen ? "mobile-overlay--visible" : ""}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <nav className={`mobile-nav ${isMenuOpen ? "mobile-nav--visible" : ""}`}>
        <ul className="mobile-nav__list">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path} className="mobile-nav__item">
                <button
                  className={`mobile-nav__link ${isActive ? "mobile-nav__link--active" : ""}`}
                  onClick={() => handleNavigation(item.path)}
                  type="button"
                >
                  <span className="mobile-nav__icon">
                    <Icon />
                  </span>
                  <span className="mobile-nav__label">{item.label}</span>
                  <span className="mobile-nav__shortcut">
                    Alt+{item.shortcut}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

export default Header;
