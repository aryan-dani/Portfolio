import { memo, useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { HiHome, HiCode, HiBriefcase, HiBadgeCheck, HiLightningBolt, HiUser, HiTerminal } from "react-icons/hi";

const navItems = [
  { path: "/", label: "Home", icon: HiHome },
  { path: "/projects", label: "Projects", icon: HiCode },
  { path: "/experience", label: "Experience", icon: HiBriefcase },
  { path: "/certifications", label: "Certifications", icon: HiBadgeCheck },
  { path: "/skills", label: "Skills", icon: HiLightningBolt },
  { path: "/about", label: "About", icon: HiUser },
  { path: "/playground", label: "Playground", icon: HiTerminal },
];

function FloatingDock() {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0, x: "-50%" }}
          animate={{ y: 0, opacity: 1, x: "-50%" }}
          exit={{ y: 100, opacity: 0, x: "-50%" }}
          transition={{ type: "spring", stiffness: 400, damping: 30, mass: 0.8 }}
          className="fixed bottom-4 sm:bottom-6 left-1/2 z-50 px-2 sm:px-4 w-full max-w-fit pointer-events-none flex justify-center"
        >
          <nav 
            className="pointer-events-auto flex items-center gap-1 sm:gap-2 p-1 bg-[var(--color-surface)] border-4 border-outline shadow-[4px_4px_0px_0px_var(--shadow-color)] sm:shadow-[6px_6px_0px_0px_var(--shadow-color)] overflow-x-auto sm:overflow-visible no-scrollbar max-w-full glass"
          >
            {navItems.map((item, index) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`relative flex items-center justify-center p-2 sm:p-3 transition-all duration-200 select-none group shrink-0 ${
                    isActive
                      ? "text-[var(--color-on-primary-container)]"
                      : "text-[var(--color-on-surface)] hover:text-[var(--color-primary)]"
                  }`}
                  aria-label={item.label}
                >
                  {isActive && (
                    <motion.div
                      layoutId="dockActiveNav"
                      className="absolute inset-0 bg-[var(--color-primary-container)] border-2 sm:border-[3px] border-outline shadow-[2px_2px_0_0_var(--shadow-color)] -z-10"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                  {!isActive && (
                    <div className="absolute inset-0 border-2 sm:border-[3px] border-transparent group-hover:border-outline group-hover:bg-[var(--color-surface-variant)] -z-10 transition-all duration-200" />
                  )}
                  
                  <Icon className="text-lg sm:text-xl relative z-10" />
                  
                  {/* Tooltip on hover for desktop */}
                  <span className={`absolute -top-12 scale-0 group-hover:scale-100 transition-transform bg-[var(--color-on-background)] text-[var(--color-background)] text-xs font-bold px-3 py-1.5 border-2 border-outline whitespace-nowrap pointer-events-none shadow-[2px_2px_0px_0px_var(--shadow-accent)] z-50 font-label-bold uppercase tracking-wider hidden sm:block ${index === navItems.length - 1 ? 'right-0 origin-bottom-right' : 'left-1/2 -translate-x-1/2 origin-bottom'}`}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default memo(FloatingDock);
