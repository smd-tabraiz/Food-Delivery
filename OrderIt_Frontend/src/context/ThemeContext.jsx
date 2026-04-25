import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("orderit-theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.setAttribute("data-theme", "dark");
      localStorage.setItem("orderit-theme", "dark");
    } else {
      document.body.removeAttribute("data-theme");
      localStorage.setItem("orderit-theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
