import React, { useContext } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../../Context/DarkModeContext";

/**
 * @file StatusBadge.jsx - Component for displaying status indicators
 * @module components/ui/StatusBadge
 */

/**
 * StatusBadge component for displaying task and project statuses
 * with improved contrast in both light and dark modes
 * @component
 * @param {Object} props - Component props
 * @param {string} props.status - Status text to display (e.g., "Completed", "In Progress", "Pending")
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {('sm'|'md'|'lg')} [props.size='md'] - Badge size
 * @returns {React.ReactElement} Rendered StatusBadge component
 */
const StatusBadge = ({ status, className = "", size = "md" }) => {
  const { isDarkMode } = useContext(DarkModeContext);

  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "");

  const statusColors = {
    notstarted: isDarkMode
      ? "bg-red-900/30 text-red-300 border-red-800"
      : "bg-red-100 text-red-700 border-red-200",

    inprogress: isDarkMode
      ? "bg-yellow-800/40 text-yellow-300 border-yellow-700"
      : "bg-yellow-100/80 text-yellow-700 border-yellow-300",

    in_progress: isDarkMode
      ? "bg-yellow-800/40 text-yellow-300 border-yellow-700"
      : "bg-yellow-100/80 text-yellow-700 border-yellow-300",

    pending: isDarkMode
      ? "bg-gray-700/30 text-gray-300 border-gray-600"
      : "bg-gray-100 text-gray-700 border-gray-200",

    completed: isDarkMode
      ? "bg-green-900/30 text-green-300 border-green-800"
      : "bg-green-100 text-green-700 border-green-200",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-2.5 py-1",
    lg: "text-base px-3 py-1.5",
  };

  const colorClasses =
    statusColors[normalizedStatus] ||
    (isDarkMode
      ? "bg-gray-700/30 text-gray-300 border-gray-600"
      : "bg-gray-100 text-gray-700 border-gray-200");

  const formatStatus = (status) => {
    if (status === "In_Progress") {
      return "In Progress";
    }

    return status
      .replace(/([A-Z_])/g, " $1") // Add space before capitals and underscores
      .replace(/_/g, " ") // Replace underscores with spaces
      .trim()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <span
      className={`
      inline-flex items-center justify-center rounded-full border
      font-medium whitespace-nowrap min-w-[7rem] text-center
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
