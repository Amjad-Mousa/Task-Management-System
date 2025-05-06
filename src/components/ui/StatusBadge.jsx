import React from 'react';
import PropTypes from 'prop-types';

/**
 * StatusBadge component for displaying task and project statuses
 */
const StatusBadge = ({ status, className = '', size = 'md' }) => {
  // Normalize status to handle different formats
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '');
  
  // Status color mapping
  const statusColors = {
    notstarted: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
    inprogress: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    pending: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
    completed: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  // Get color classes based on status
  const colorClasses = statusColors[normalizedStatus] || 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';

  // Format status for display
  const formatStatus = (status) => {
    return status
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <span className={`
      inline-flex items-center rounded-full border 
      font-medium whitespace-nowrap
      ${colorClasses}
      ${sizeClasses[size]}
      ${className}
    `}>
      {formatStatus(status)}
    </span>
  );
};

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default StatusBadge;
