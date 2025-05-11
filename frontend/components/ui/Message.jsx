import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";

/**
 * Message component for displaying alerts, notifications, and feedback
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

  // Auto-dismiss the message after duration
  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        if (onClose) onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Type-based styling
  const typeStyles = {
    success: "bg-green-600 text-white",
    error: "bg-red-600 text-white",
    warning: "bg-yellow-500 text-white",
    info: "bg-blue-600 text-white",
  };

  // Position classes
  const positionClasses = {
    top: "top-0 left-0 right-0",
    bottom: "bottom-0 left-0 right-0",
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  // Icons based on message type
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
