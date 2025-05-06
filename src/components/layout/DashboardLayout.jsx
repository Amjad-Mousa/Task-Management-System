import React, { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../../Context/DarkModeContext";
import Sidebar from "../Sidebar";
import DarkModeToggle from "../DarkModeToggle";
import Message from "../ui/Message";

/**
 * DashboardLayout component for consistent layout across dashboard pages
 */
const DashboardLayout = ({
  children,
  title,
  role = "admin",
  showWelcomeMessage = false,
  successMessage = null,
}) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [username, setUsername] = useState("");
  const [datetime, setDatetime] = useState("");

  // Get user info from localStorage
  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
    );
    if (storedUser?.username) {
      setUsername(storedUser.username);
    }
  }, []);

  // Update datetime
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
    <div
      className={`flex h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Sidebar */}
      <Sidebar role={role} username={username} />

      {/* Main Content */}
      <main
        className={`flex-1 p-6 relative overflow-y-auto ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        {/* Success Message */}
        {successMessage && (
          <Message
            type="success"
            message={successMessage}
            position="bottom"
            isFixed={true}
          />
        )}

        {/* Header with title and actions */}
        <header className="mb-8">
          <div className="flex items-start justify-between w-full gap-4">
            {/* Left side: Welcome message */}
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

              {/* Timer under the Welcome message */}
              {showWelcomeMessage && (
                <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md shadow">
                  <span className="text-xl">⏰</span>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                    {datetime}
                  </span>
                </div>
              )}
            </div>

            {/* Right side: Dark Mode Toggle */}
            <div className="flex items-center">
              <DarkModeToggle />
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
};

DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  role: PropTypes.oneOf(["admin", "student"]),
  showWelcomeMessage: PropTypes.bool,
  actions: PropTypes.node,
  successMessage: PropTypes.string,
};

export default DashboardLayout;
