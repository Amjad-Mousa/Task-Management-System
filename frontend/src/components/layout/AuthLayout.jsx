import React, { useContext } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../../Context/DarkModeContext";
import Card from "../ui/Card";
import DarkModeToggle from "../DarkModeToggle";

/**
 * @file AuthLayout.jsx - Layout component for authentication pages
 * @module components/layout/AuthLayout
 */

/**
 * AuthLayout component for sign-in and sign-up pages
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Form content
 * @param {string} props.title - Page title
 * @param {string} [props.message=null] - Optional message to display
 * @param {('success'|'error')} [props.messageType='success'] - Message type
 * @returns {React.ReactElement} Rendered AuthLayout component
 */
const AuthLayout = ({
  children,
  title,
  message = null,
  messageType = "success",
}) => {
  const { isDarkMode } = useContext(DarkModeContext);

  return (
    <div
      className={`flex items-center justify-center h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
      }`}
    >
      <Card className="w-80 text-center relative">
        <div className="absolute top-3 right-3">
          <DarkModeToggle />
        </div>

        <h1 className="text-2xl mb-5 font-bold">{title}</h1>

        {children}

        {message && (
          <div
            className={`mt-3 text-sm ${
              messageType === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </div>
        )}
      </Card>
    </div>
  );
};

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  message: PropTypes.string,
  messageType: PropTypes.oneOf(["success", "error"]),
};

export default AuthLayout;
