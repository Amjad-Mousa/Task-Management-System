/**
 * @file DarkModeContext.jsx - Context for managing dark mode state
 * @module src/Context/DarkModeContext
 */

import { createContext, useState, useEffect, useMemo } from "react";

/**
 * Context for dark mode state and toggle function
 * @type {React.Context}
 */
export const DarkModeContext = createContext();

/**
 * Provider component for dark mode functionality
 * Manages dark mode state and provides toggle function
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 */
export const DarkModeProvider = ({ children }) => {
  /**
   * Dark mode state
   * @type {[boolean, Function]} State and setter for dark mode
   */
  const [isDarkMode, setIsDarkMode] = useState(false);

  /**
   * Load saved dark mode preference from localStorage on mount
   */
  useEffect(() => {
    const storedTheme = localStorage.getItem("darkMode");
    if (storedTheme !== null) {
      setIsDarkMode(storedTheme === "true");
    }
  }, []);

  /**
   * Apply dark mode classes to HTML and body elements when state changes
   */
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      document.body.classList.add("dark-mode");
    } else {
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("dark-mode");
    }

    document.body.style.transition =
      "background-color 0.3s ease, color 0.3s ease";

    console.log("Dark mode changed:", isDarkMode);
  }, [isDarkMode]);

  /**
   * Toggle dark mode state and save preference to localStorage
   */
  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", String(newMode));
      return newMode;
    });
  };
  /**
   * Memoized context value to prevent unnecessary re-renders
   * @type {Object} Context value with dark mode state and toggle function
   */
  const contextValue = useMemo(
    () => ({
      isDarkMode,
      toggleDarkMode,
    }),
    [isDarkMode]
  );

  return (
    <DarkModeContext.Provider value={contextValue}>
      {children}
    </DarkModeContext.Provider>
  );
};
