/**
 * @file useForm.js - Custom hook for form state management
 * @module src/hooks/useForm
 */

import { useState } from "react";

/**
 * Custom hook for handling form state and validation
 * Provides form state management, validation, and submission handling
 *
 * @param {Object} initialValues - Initial form values
 * @param {Function|null} validate - Validation function (optional)
 * @param {Function|null} onSubmit - Submit handler function (optional)
 * @returns {Object} Form state and handlers
 * @returns {Object} returns.values - Current form values
 * @returns {Object} returns.errors - Validation errors
 * @returns {boolean} returns.isSubmitting - Whether form is submitting
 * @returns {Function} returns.handleChange - Input change handler
 * @returns {Function} returns.handleSubmit - Form submission handler
 * @returns {Function} returns.resetForm - Reset form to initial values
 * @returns {Function} returns.setFieldValue - Set a single field value
 * @returns {Function} returns.setMultipleFields - Set multiple field values
 * @returns {Function} returns.setErrors - Set error messages
 */
const useForm = (initialValues = {}, validate = null, onSubmit = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle different input types
    const inputValue = type === "checkbox" ? checked : value;

    setValues({
      ...values,
      [name]: inputValue,
    });

    // Clear error for this field when it changes
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
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
      console.error("Form submission error:", error);
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
