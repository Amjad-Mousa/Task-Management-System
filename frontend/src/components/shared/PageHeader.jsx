import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import DarkModeToggle from "../DarkModeToggle";

/**
 * @file PageHeader.jsx - Header component for dashboard pages
 * @module components/shared/PageHeader
 */

/**
 * PageHeader component for consistent header across all pages
 * Displays either a welcome message or a title, and the dark mode toggle
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.title] - Page title (displayed when showWelcomeMessage is false)
 * @param {boolean} [props.showWelcomeMessage=false] - Whether to show welcome message instead of title
 * @param {('admin'|'student')} [props.role='admin'] - User role for welcome message
 * @returns {React.ReactElement} Rendered PageHeader component
 */
const PageHeader = ({ title, showWelcomeMessage = false, role = "admin" }) => {
  const [username, setUsername] = useState("");
  const [datetime, setDatetime] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
    );
    if (storedUser?.username) {
      setUsername(storedUser.username);
    }
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      setDatetime(now.toLocaleDateString("en-US", options));
    };

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 60000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="mb-8">
      <div className="flex items-start justify-between w-full gap-4">
        <div className="flex flex-col">
          {showWelcomeMessage ? (
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              👋 Welcome,{" "}
              <span className="text-blue-600 dark:text-blue-400">
                {username || (role === "admin" ? "Admin" : "Student")}
              </span>
            </h1>
          ) : (
            <h1 className="text-2xl font-bold">{title}</h1>
          )}

          {showWelcomeMessage && (
            <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md shadow">
              <span className="text-xl">⏰</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                {datetime}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center">
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string,
  showWelcomeMessage: PropTypes.bool,
  role: PropTypes.oneOf(["admin", "student"]),
};

export default PageHeader;
