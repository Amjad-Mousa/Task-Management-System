import React, { useContext } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../../Context/DarkModeContext";
import Sidebar from "../Sidebar";
import Message from "../ui/Message";
import { PageHeader } from "../shared";

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

  return (
    <div
      className={`flex h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"
      }`}
    >
      {/* Sidebar */}
      <Sidebar role={role} />

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

        {/* Page Header with title/welcome message and dark mode toggle */}
        <PageHeader
          title={title}
          showWelcomeMessage={showWelcomeMessage}
          role={role}
        />

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
