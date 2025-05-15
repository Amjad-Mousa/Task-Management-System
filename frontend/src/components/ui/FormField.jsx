import React, { useContext } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../../Context/DarkModeContext";
import Input from "./Input";
import Select from "./Select";

/**
 * @file FormField.jsx - Wrapper component for form inputs with consistent styling
 * @module components/ui/FormField
 */

/**
 * Reusable FormField component for consistent form field styling and error handling
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.type='text'] - Input type or 'select' for dropdown
 * @param {string} [props.label] - Field label
 * @param {string} props.name - Field name attribute
 * @param {any} props.value - Field value
 * @param {Function} [props.onChange] - Change handler function
 * @param {string} [props.placeholder=''] - Placeholder text
 * @param {boolean} [props.required=false] - Whether the field is required
 * @param {string} [props.error=''] - Error message to display
 * @param {Array<Object>} [props.options=[]] - Options for select fields
 * @param {React.ReactNode} [props.children] - Custom field component
 * @param {string} [props.className=''] - Additional CSS classes
 * @returns {React.ReactElement} Rendered FormField component
 */
const FormField = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  placeholder = "",
  required = false,
  error = "",
  options = [],
  children,
  className = "",
  ...props
}) => {
  const { isDarkMode } = useContext(DarkModeContext);

  const isSelect = type === "select";
  const errorTextClass = "text-red-500 text-xs mt-1";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          className={`block text-sm font-medium ${
            required
              ? "after:content-['*'] after:ml-0.5 after:text-red-500"
              : ""
          }`}
        >
          {label}
        </label>
      )}

      {isSelect ? (
        <Select
          name={name}
          value={value}
          onChange={onChange}
          options={options}
          placeholder={placeholder}
          required={required}
          error={!!error}
          {...props}
        />
      ) : children ? (
        children
      ) : (
        <Input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          error={!!error}
          {...props}
        />
      )}

      {error && <p className={errorTextClass}>{error}</p>}
    </div>
  );
};

FormField.propTypes = {
  type: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.any,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.any.isRequired,
      label: PropTypes.string.isRequired,
    })
  ),
  children: PropTypes.node,
  className: PropTypes.string,
};

export default FormField;
