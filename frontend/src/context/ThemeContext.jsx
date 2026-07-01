import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const transitionTimeoutRef = useRef(null);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("portfolio_theme") || "light";
  });

  useLayoutEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
    root.style.colorScheme = isDark ? "dark" : "light";

    localStorage.setItem("portfolio_theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const root = window.document.documentElement;
    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    root.classList.add("theme-transitioning");

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
      });
    });

    transitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
      transitionTimeoutRef.current = null;
    }, 280);
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
