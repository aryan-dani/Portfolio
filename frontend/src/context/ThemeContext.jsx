import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";

const ThemeContext = createContext();

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

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (transitionTimeoutRef.current) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    root.classList.add("theme-transitioning");

    // Let the browser paint transition rules before colors change
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
      });
    });

    transitionTimeoutRef.current = window.setTimeout(() => {
      root.classList.remove("theme-transitioning");
      transitionTimeoutRef.current = null;
    }, 420);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
