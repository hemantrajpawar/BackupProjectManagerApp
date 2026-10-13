import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext(null);
const THEME_STORAGE_KEY = "pma_theme";

export const ThemeProvider = ({ children }) => {
  // The client presentation is intentionally fixed to the approved light chroma theme.
  const [theme, setThemeState] = useState("light");

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    try { localStorage.setItem(THEME_STORAGE_KEY, "light"); } catch { /* storage is optional */ }
  }, []);

  const setTheme = () => setThemeState("light");
  const toggleTheme = () => setThemeState("light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: false }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
