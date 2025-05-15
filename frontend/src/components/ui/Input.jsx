import React, { useContext, useState } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../../Context/DarkModeContext";

/**
 * @file Input.jsx - Reusable form input component
 * @module components/ui/Input
 */

/**
 * Reusable Input component with consistent styling
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.type='text'] - Input type (text, password, email, etc.)
 * @param {string} [props.label] - Input label
 * @param {string} props.name - Input name attribute
 * @param {string|number} props.value - Input value
 * @param {Function} props.onChange - Change handler function
 * @param {string} [props.placeholder=''] - Input placeholder text
 * @param {boolean} [props.required=false] - Whether the input is required
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.error=''] - Error message to display
 * @param {boolean} [props.disabled=false] - Whether the input is disabled
 * @returns {React.ReactElement} Rendered Input component
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
  const [showPassword, setShowPassword] = useState(false);

  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  const inputClasses = `
    w-full px-3 py-2 border rounded transition-colors
    ${
      isDarkMode
        ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
        : "bg-gray-50 text-gray-800 border-gray-300 focus:border-blue-600"
    }
    ${error ? "border-red-500 dark:border-red-400" : ""}
    ${disabled ? "opacity-60 cursor-not-allowed" : ""}
    ${type === "password" ? "pr-10" : ""}
    ${className}
  `;

  const labelClasses = `
    block mb-1 text-sm font-medium
    ${isDarkMode ? "text-gray-300" : "text-gray-600"}
  `;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          type={inputType}
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
        {type === "password" && (
          <button
            type="button"
            className={`absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5 ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                  clipRule="evenodd"
                />
                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
              </svg>
            )}
          </button>
        )}
      </div>
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
