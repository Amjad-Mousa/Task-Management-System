import React, { useContext } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../../Context/DarkModeContext";

/**
 * StatusBadge component for displaying task and project statuses
 * with improved contrast in both light and dark modes
 */
const StatusBadge = ({ status, className = "", size = "md" }) => {
  const { isDarkMode } = useContext(DarkModeContext);

  // Normalize status to handle different formats
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "");

  // Status color mapping with better contrast for light mode
  const statusColors = {
    // Light mode : Dark mode
    notstarted: isDarkMode
      ? "bg-red-900/30 text-red-300 border-red-800"
      : "bg-red-600 text-white border-red-700",

    inprogress: isDarkMode
      ? "bg-yellow-900/30 text-yellow-300 border-yellow-800"
      : "bg-yellow-500 text-white border-yellow-600",

    pending: isDarkMode
      ? "bg-gray-700 text-gray-300 border-gray-600"
      : "bg-gray-500 text-white border-gray-600",

    completed: isDarkMode
      ? "bg-green-900/30 text-green-300 border-green-800"
      : "bg-green-600 text-white border-green-700",
  };

  // Size classes
  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  // Get color classes based on status
  const colorClasses =
    statusColors[normalizedStatus] ||
    (isDarkMode
      ? "bg-gray-700 text-gray-300 border-gray-600"
      : "bg-gray-500 text-white border-gray-600");

  // Format status for display
  const formatStatus = (status) => {
    return status
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <span
      className={`
      inline-flex items-center rounded-full border
      font-medium whitespace-nowrap
      ${colorClasses}
      ${sizeClasses[size]}
      ${className}
    `}
    >
      {formatStatus(status)}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
};

export default StatusBadge;
