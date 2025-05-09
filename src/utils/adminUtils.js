/**
 * Shared utility functions for admin components
 */

/**
 * Get the appropriate color class for a status based on dark mode
 * @param {string} status - The status text
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 * @returns {string} The CSS class for the status
 */
export const getStatusColor = (status, isDarkMode) => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, "");

  switch (normalizedStatus) {
    case "completed":
      return isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-100 text-green-700"; // Green for Completed
    case "inprogress":
      return isDarkMode
        ? "bg-yellow-900/30 text-yellow-300"
        : "bg-yellow-100 text-yellow-700"; // Yellow for In Progress
    case "pending":
      return isDarkMode ? "bg-gray-700/30 text-gray-300" : "bg-gray-100 text-gray-700"; // Gray for Pending
    case "notstarted":
      return isDarkMode ? "bg-red-900/30 text-red-300" : "bg-red-100 text-red-700"; // Red for Not Started
    default:
      return isDarkMode ? "bg-gray-700/30 text-gray-300" : "bg-gray-100 text-gray-700";
  }
};

/**
 * Get the status text based on progress value
 * @param {number} progress - The progress value (0-100)
 * @param {string} status - Optional status override
 * @returns {string} The status text
 */
export const getStatusFromProgress = (progress, status) => {
  if (progress === 100) return "Completed";
  if (progress > 50) return "In Progress";
  if (status === "Pending") return "Pending";
  return "Not Started";
};

/**
 * Generic sort function for arrays of objects
 * @param {Array} items - The array to sort
 * @param {Object} sortConfig - The sort configuration { key, direction }
 * @returns {Array} The sorted array
 */
export const sortItems = (items, sortConfig) => {
  const { key, direction } = sortConfig;

  return [...items].sort((a, b) => {
    // Special handling for date sorting
    if (key === "dueDate") {
      const dateA = new Date(a[key]);
      const dateB = new Date(b[key]);

      const isValidDateA = !isNaN(dateA.getTime());
      const isValidDateB = !isNaN(dateB.getTime());

      if (isValidDateA && isValidDateB) {
        return direction === "asc" ? dateA - dateB : dateB - dateA;
      }
    }

    // Special handling for status sorting
    if (key === "status") {
      const statusOrder = ["Not Started", "Pending", "In Progress", "Completed"];
      const indexA = statusOrder.indexOf(a[key]);
      const indexB = statusOrder.indexOf(b[key]);

      if (indexA !== -1 && indexB !== -1) {
        return direction === "asc" ? indexA - indexB : indexB - indexA;
      }
    }

    // Special handling for progress sorting (numeric)
    if (key === "progress") {
      const aValue = a[key] || 0;
      const bValue = b[key] || 0;
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Default string comparison for other fields
    const aValue = a[key] || "";
    const bValue = b[key] || "";

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

/**
 * Standard search input styling
 * @param {boolean} isDarkMode - Whether dark mode is enabled
 * @returns {string} The CSS class string for search inputs
 */
export const getSearchInputClasses = (isDarkMode) => `
  w-full px-4 py-2 rounded-lg border
  ${isDarkMode
    ? "bg-gray-800 text-white border-gray-700 focus:border-blue-500"
    : "bg-white text-gray-800 border-gray-300 focus:border-blue-600"
  }
  focus:outline-none focus:ring-2 focus:ring-opacity-50
  ${isDarkMode ? "focus:ring-blue-500" : "focus:ring-blue-600"}
`.replace(/\s+/g, " ").trim();

/**
 * Standard success message timeout duration
 */
export const SUCCESS_MESSAGE_TIMEOUT = 3000;
