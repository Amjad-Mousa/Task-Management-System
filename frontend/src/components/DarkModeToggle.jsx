/**
 * Dark Mode Toggle Component
 *
 * A button component that toggles between dark and light mode.
 * Uses the DarkModeContext to access and update the current theme state.
 *
 * @module components/DarkModeToggle
 */
import React, { useContext } from "react";
import { DarkModeContext } from "../Context/DarkModeContext";

/**
 * DarkModeToggle Component
 *
 * @returns {JSX.Element} A button that toggles between dark and light mode
 */
const DarkModeToggle = () => {
  /**
   * Access dark mode state and toggle function from context
   */
  const { isDarkMode, toggleDarkMode } = useContext(DarkModeContext);

  return (
    <button
      onClick={toggleDarkMode}
      className={`flex items-center justify-center p-2 rounded-md transition-all duration-200 btn-hover-effect tooltip focus:outline-none focus:ring-2 ${
        isDarkMode
          ? "bg-gray-700 hover:bg-gray-600 focus:ring-blue-400 focus:ring-offset-gray-800"
          : "bg-gray-200 hover:bg-gray-300 focus:ring-blue-500 focus:ring-offset-2"
      }`}
      data-tooltip={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-yellow-300"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-blue-700"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
    </button>
  );
};

export default DarkModeToggle;
