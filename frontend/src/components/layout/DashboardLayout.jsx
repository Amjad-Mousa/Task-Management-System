import React, { useContext } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../../Context/DarkModeContext";
import Sidebar from "../Sidebar";
import Message from "../ui/Message";
import { PageHeader } from "../shared";

/**
 * @file DashboardLayout.jsx - Layout component for dashboard pages
 * @module components/layout/DashboardLayout
 */

/**
 * DashboardLayout component for consistent layout across dashboard pages
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Page content
 * @param {string} [props.title] - Page title
 * @param {('admin'|'student')} [props.role='admin'] - User role
 * @param {boolean} [props.showWelcomeMessage=false] - Whether to show welcome message
 * @param {string} [props.successMessage=null] - Success message to display
 * @param {boolean} [props.isLoading=false] - Whether page is loading
 * @param {string} [props.errorMessage=null] - Error message to display
 * @returns {React.ReactElement} Rendered DashboardLayout component
 */
const DashboardLayout = ({
  children,
  title,
  role = "admin",
  showWelcomeMessage = false,
  successMessage = null,
  isLoading = false,
  errorMessage = null,
}) => {
  const { isDarkMode } = useContext(DarkModeContext);

  return (
    <div
      className={`flex h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"
      }`}
    >
      <Sidebar role={role} />

      <main
        className={`flex-1 p-6 relative overflow-y-auto ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        {successMessage && (
          <Message
            type="success"
            message={successMessage}
            position="bottom"
            isFixed={true}
          />
        )}

        {errorMessage && (
          <Message
            type="error"
            message={errorMessage}
            position="top"
            isFixed={true}
          />
        )}

        <PageHeader
          title={title}
          showWelcomeMessage={showWelcomeMessage}
          role={role}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm z-10">
            <div
              className={`p-4 rounded-lg ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } shadow-xl flex items-center space-x-3`}
            >
              <svg
                className="animate-spin h-6 w-6 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span className="font-medium">Loading...</span>
            </div>
          </div>
        )}

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
  isLoading: PropTypes.bool,
  errorMessage: PropTypes.string,
};

export default DashboardLayout;
