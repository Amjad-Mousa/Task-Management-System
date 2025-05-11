import React, { useContext } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../../Context/DarkModeContext";
import Input from "./Input";
import Select from "./Select";

/**
 * Reusable FormField component for consistent form field styling and error handling
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

  // Determine if this is a select field
  const isSelect = type === "select";

  // Error text styling
  const errorTextClass = "text-red-500 text-xs mt-1";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className={`block text-sm font-medium ${required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}`}>
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
