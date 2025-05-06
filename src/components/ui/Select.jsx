import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { DarkModeContext } from '../../Context/DarkModeContext';

/**
 * Reusable Select component with consistent styling
 */
const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  required = false,
  className = '',
  error = '',
  disabled = false,
  ...props
}) => {
  const { isDarkMode } = useContext(DarkModeContext);

  // Base select classes
  const selectClasses = `
    w-full px-3 py-2 border rounded transition-colors
    ${isDarkMode
      ? 'bg-gray-700 text-white border-gray-600 focus:border-blue-500'
      : 'bg-gray-50 text-gray-800 border-gray-300 focus:border-blue-600'
    }
    ${error ? 'border-red-500 dark:border-red-400' : ''}
    ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
    ${className}
  `;

  // Label classes
  const labelClasses = `
    block mb-1 text-sm font-medium
    ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}
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
        {options.map((option) => (
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
