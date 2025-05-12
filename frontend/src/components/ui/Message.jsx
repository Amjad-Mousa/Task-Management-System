import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

/**
 * @file Message.jsx - Component for displaying notifications and alerts
 * @module components/ui/Message
 */

/**
 * Message component for displaying alerts, notifications, and feedback
 * @component
 * @param {Object} props - Component props
 * @param {('success'|'error'|'warning'|'info')} [props.type='info'] - Message type
 * @param {string} props.message - Message content
 * @param {number} [props.duration=3000] - Auto-dismiss duration in milliseconds (0 for no auto-dismiss)
 * @param {('top'|'bottom'|'top-right'|'top-left'|'bottom-right'|'bottom-left')} [props.position='bottom'] - Message position
 * @param {Function} [props.onClose] - Callback function when message closes
 * @param {boolean} [props.showIcon=true] - Whether to show type icon
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {boolean} [props.isFixed=false] - Whether to use fixed positioning
 * @returns {React.ReactElement|null} Rendered Message component or null if not visible
 */
const Message = ({
  type = "info",
  message,
  duration = 3000,
  position = "bottom",
  onClose,
  showIcon = true,
  className = "",
  isFixed = false,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-600 text-white",
  };

  const positionClasses = {
    top: "top-0 left-0 right-0",
    bottom: "bottom-0 left-0 right-0",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  };

  if (!isVisible || !message) return null;

  const messageClasses = `
    ${typeStyles[type]}
    ${positionClasses[position]}
    ${isFixed ? "fixed" : "absolute"}
    py-2 px-4 text-center z-[60] success-message
    ${className}
  `;

  return (
    <div className={messageClasses}>
      <div className="flex items-center justify-center gap-2">
        {showIcon && <span>{icons[type]}</span>}
        <span>{message}</span>
      </div>
    </div>
  );
};

Message.propTypes = {
  type: PropTypes.oneOf(["success", "error", "warning", "info"]),
  message: PropTypes.string.isRequired,
  duration: PropTypes.number,
  position: PropTypes.oneOf([
    "top",
    "bottom",
    "top-right",
    "top-left",
    "bottom-right",
    "bottom-left",
  ]),
  onClose: PropTypes.func,
  showIcon: PropTypes.bool,
  className: PropTypes.string,
  isFixed: PropTypes.bool,
};

export default Message;
