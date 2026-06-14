import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("portfolio_theme") || "light";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === "dark";

    root.classList.toggle("dark", isDark);
    root.classList.toggle("light", !isDark);
    root.style.colorScheme = isDark ? "dark" : "light";

    localStorage.setItem("portfolio_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    root.classList.add("theme-transitioning");

    // Let the browser paint transition rules before colors change
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
      });
    });

    setTimeout(() => {
      root.classList.remove("theme-transitioning");
    }, 550);
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
