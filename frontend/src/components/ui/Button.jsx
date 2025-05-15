import React from "react";
import PropTypes from "prop-types";

/**
 * @file Button.jsx - Reusable button component with various styling options
 * @module components/ui/Button
 */

/**
 * Button component with consistent styling and variants
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Button content
 * @param {('primary'|'secondary'|'danger'|'success'|'outline')} [props.variant='primary'] - Button style variant
 * @param {('sm'|'md'|'lg')} [props.size='md'] - Button size
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ReactNode} [props.icon=null] - Optional icon to display before text
 * @param {Function} [props.onClick] - Click handler function
 * @param {('button'|'submit'|'reset')} [props.type='button'] - HTML button type
 * @param {boolean} [props.disabled=false] - Whether the button is disabled
 * @param {boolean} [props.fullWidth=false] - Whether the button should take full width
 * @returns {React.ReactElement} Rendered Button component
 */
const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  icon = null,
  onClick,
  type = "button",
  disabled = false,
  fullWidth = false,
  ...props
}) => {
  const baseClasses =
    "rounded font-medium transition-all duration-200 btn-hover-effect";

  const sizeClasses = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const variantClasses = {
    primary:
      "bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600",
    secondary:
      "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white",
    danger:
      "bg-red-600 hover:bg-red-700 text-white dark:bg-red-500 dark:hover:bg-red-600",
    success:
      "bg-green-600 hover:bg-green-700 text-white dark:bg-green-500 dark:hover:bg-green-600",
    outline:
      "bg-transparent border border-gray-300 hover:bg-gray-100 text-gray-800 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white",
  };

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  const widthClasses = fullWidth ? "w-full" : "";

  const buttonClasses = `
    ${baseClasses}
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${disabledClasses}
    ${widthClasses}
    ${className}
  `;

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      <div className="flex items-center justify-center gap-2">
        {icon && <span>{icon}</span>}
        {children}
      </div>
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf([
    "primary",
    "secondary",
    "danger",
    "success",
    "outline",
  ]),
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  className: PropTypes.string,
  icon: PropTypes.node,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(["button", "submit", "reset"]),
  disabled: PropTypes.bool,
  fullWidth: PropTypes.bool,
};

export default Button;
