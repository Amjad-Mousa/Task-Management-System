import React, { useContext } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../../Context/DarkModeContext";

/**
 * Reusable Input component with consistent styling
 */
const Input = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  className = "",
  error = "",
  disabled = false,
  ...props
}) => {
  const { isDarkMode } = useContext(DarkModeContext);

  // Base input classes
  const inputClasses = `
    w-full px-3 py-2 border rounded transition-colors
    ${
      isDarkMode
        ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
        : "bg-gray-50 text-gray-800 border-gray-300 focus:border-blue-600"
    }
    ${error ? "border-red-500 dark:border-red-400" : ""}
    ${disabled ? "opacity-60 cursor-not-allowed" : ""}
    ${className}
  `;

  // Label classes
  const labelClasses = `
    block mb-1 text-sm font-medium
    ${isDarkMode ? "text-gray-300" : "text-gray-600"}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

Input.propTypes = {
  type: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Input;
