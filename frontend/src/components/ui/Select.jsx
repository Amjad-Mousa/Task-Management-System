import React, { useContext } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../../Context/DarkModeContext";

/**
 * @file Select.jsx - Reusable dropdown select component
 * @module components/ui/Select
 */

/**
 * Reusable Select component with consistent styling
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.label] - Select label
 * @param {string} props.name - Select name attribute
 * @param {string} props.value - Selected value
 * @param {Function} props.onChange - Change handler function
 * @param {Array<string|Object>} [props.options=[]] - Array of options (strings or {value, label} objects)
 * @param {string} [props.placeholder='Select an option'] - Placeholder text
 * @param {boolean} [props.required=false] - Whether the select is required
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {string} [props.error=''] - Error message to display
 * @param {boolean} [props.disabled=false] - Whether the select is disabled
 * @returns {React.ReactElement} Rendered Select component
 */
const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "Select an option",
  required = false,
  className = "",
  error = "",
  disabled = false,
  ...props
}) => {
  const { isDarkMode } = useContext(DarkModeContext);

  const selectClasses = `
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={selectClasses}
        {...props}
      >
        <option value="">{placeholder}</option>

        {options
          .filter((option) => (option.value || option) !== "")
          .map((option) => (
            <option key={option.value || option} value={option.value || option}>
              {option.label || option}
            </option>
          ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
      }),
    ])
  ),
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  className: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Select;
