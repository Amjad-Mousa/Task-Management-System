import { useState } from 'react';

/**
 * Custom hook for handling form state and validation
 * 
 * @param {Object} initialValues - Initial form values
 * @param {Function} validate - Validation function (optional)
 * @param {Function} onSubmit - Submit handler function
 * @returns {Object} Form state and handlers
 */
const useForm = (initialValues = {}, validate = null, onSubmit = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const inputValue = type === 'checkbox' ? checked : value;
    
    setValues({
      ...values,
      [name]: inputValue,
    });
    
    // Clear error for this field when it changes
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form if validation function is provided
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      // If there are validation errors, don't proceed
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial values
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
  };

  // Set a specific field value
  const setFieldValue = (field, value) => {
    setValues({
      ...values,
      [field]: value,
    });
  };

  // Set multiple field values at once
  const setMultipleFields = (newValues) => {
    setValues({
      ...values,
      ...newValues,
    });
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    setMultipleFields,
    setErrors,
  };
};

export default useForm;
