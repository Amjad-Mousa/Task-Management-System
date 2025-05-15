import {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
  useReducer,
  useMemo,
} from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../Context/DarkModeContext";
import { useGraphQL } from "../Context/GraphQLContext";
import { FixedSizeList as List } from "react-window";
import { GET_STUDENTS_QUERY } from "../graphql/queries";
import { Modal, Button, ErrorMessage, FormField } from "./ui";

/**
 * @file ProjectFormModal.jsx - Modal component for creating and editing projects
 * @module components/ProjectFormModal
 */

/**
 * Initial state for the form reducer
 * @type {Object}
 */
const initialFormState = {
  formData: {
    projectName: "",
    projectDescription: "",
    selectedStudents: [],
    projectCategory: "",
    startDate: "",
    endDate: "",
    projectStatus: "Pending",
  },
  studentSearchQuery: "",
  showStudentDropdown: false,
  isSubmitting: false,
  errors: {
    general: "",
    success: "",
    backend: null,
    date: { startDate: "", endDate: "" },
    fields: {},
  },
};

/**
 * Reducer function for managing form state
 * @param {Object} state - Current state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New state
 */
const formReducer = (state, action) => {
  switch (action.type) {
    case "INIT_FORM":
      return {
        ...initialFormState,
        formData: { ...initialFormState.formData, ...action.payload },
      };
    case "UPDATE_FIELD":
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
        // Clear field-specific error when updating a field
        errors: {
          ...state.errors,
          fields: {
            ...state.errors.fields,
            [action.field]: "",
          },
        },
      };
    case "TOGGLE_DROPDOWN":
      return { ...state, showStudentDropdown: !state.showStudentDropdown };
    case "TOGGLE_STUDENT": {
      const studentId = action.studentId;
      const isSelected = state.formData.selectedStudents.includes(studentId);
      return {
        ...state,
        formData: {
          ...state.formData,
          selectedStudents: isSelected
            ? state.formData.selectedStudents.filter((id) => id !== studentId)
            : [...state.formData.selectedStudents, studentId],
        },
      };
    }
    case "SET_ERROR":
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.errorType]: action.error,
        },
      };
    case "CLEAR_ERRORS":
      return {
        ...state,
        errors: {
          general: "",
          success: "",
          backend: null,
          date: { startDate: "", endDate: "" },
          fields: {},
        },
      };
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.isSubmitting };
    default:
      return state;
  }
};

/**
 * ProjectFormModal component for adding or editing projects
 * Optimized with useReducer for better state management
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Object} [props.project=null] - Project object for editing (null for creating new project)
 * @returns {React.ReactElement} Rendered ProjectFormModal component
 */
const ProjectFormModal = ({ isOpen, onClose, onSubmit, project = null }) => {
  const isEditMode = !!project;
  const { isDarkMode } = useContext(DarkModeContext);
  const { executeQuery } = useGraphQL();

  // Use reducer for form state management
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  // Destructure form state for easier access
  const {
    formData,
    studentSearchQuery,
    showStudentDropdown,
    isSubmitting,
    errors,
  } = formState;

  // We'll use formData directly instead of destructuring to avoid unused variable warnings

  // Student data state
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Fetch students from API - only once when component mounts
  useEffect(() => {
    const fetchStudents = async () => {
      if (!students.length) {
        setLoadingStudents(true);
        try {
          const data = await executeQuery(GET_STUDENTS_QUERY, {}, true, true); // Use caching
          if (data && data.students) {
            setStudents(data.students);
          }
        } catch (err) {
          console.error("Error fetching students:", err);
          dispatch({
            type: "SET_ERROR",
            errorType: "general",
            error: "Failed to load students. Please try again.",
          });
        } finally {
          setLoadingStudents(false);
        }
      }
    };

    fetchStudents();
  }, [executeQuery, students.length, dispatch]);

  // Reference to the dropdown container for measuring
  const dropdownRef = useRef(null);

  // Format date to YYYY-MM-DD for input type="date" and get today's date
  const formatDateForInput = useCallback((date) => {
    if (!date) return "";

    try {
      // Handle different date formats
      let d;

      if (typeof date === "string") {
        // Check if it's a timestamp in string form
        if (/^\d+$/.test(date)) {
          d = new Date(parseInt(date, 10));
        }
        // Check if already in YYYY-MM-DD format
        else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return date;
        }
        // Otherwise try to parse as date string
        else {
          d = new Date(date);
        }
      }
      // Handle numeric timestamp (milliseconds since epoch)
      else if (typeof date === "number") {
        d = new Date(date);
      }
      // Handle Date object
      else if (date instanceof Date) {
        d = date;
      }
      // Unknown type
      else {
        console.error("Invalid date type:", typeof date);
        return "";
      }

      // Check if date is valid
      if (isNaN(d.getTime())) {
        return "";
      }

      // Format the date as YYYY-MM-DD
      let month = "" + (d.getMonth() + 1);
      let day = "" + d.getDate();
      const year = d.getFullYear();

      if (month.length < 2) month = "0" + month;
      if (day.length < 2) day = "0" + day;

      return [year, month, day].join("-");
    } catch (err) {
      console.error("Error formatting date:", err);
      return "";
    }
  }, []);

  // Get today's date formatted for input
  const getTodayFormatted = useCallback(() => {
    return formatDateForInput(new Date());
  }, [formatDateForInput]);

  // Validate dates
  const validateDates = useCallback(() => {
    const errors = { startDate: "", endDate: "" };
    let hasErrors = false;

    // Check if dates are provided
    if (!formData.startDate) {
      errors.startDate = "Start date is required";
      hasErrors = true;
    }

    if (!formData.endDate) {
      errors.endDate = "End date is required";
      hasErrors = true;
    }

    // If dates are missing, don't proceed with other validations
    if (hasErrors) {
      dispatch({ type: "SET_ERROR", errorType: "date", error: errors });
      return false;
    }

    // Check if dates are in valid format
    if (!formData.startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      errors.startDate = "Invalid date format. Use YYYY-MM-DD";
      hasErrors = true;
    }

    if (!formData.endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      errors.endDate = "Invalid date format. Use YYYY-MM-DD";
      hasErrors = true;
    }

    // If format is invalid, don't proceed with other validations
    if (hasErrors) {
      dispatch({ type: "SET_ERROR", errorType: "date", error: errors });
      return false;
    }

    try {
      // Convert string dates to Date objects for comparison
      const start = new Date(formData.startDate + "T00:00:00"); // Add time part to ensure consistent parsing
      const end = new Date(formData.endDate + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to beginning of day for fair comparison

      // Check if date objects are valid
      if (isNaN(start.getTime())) {
        errors.startDate = "Invalid start date";
        hasErrors = true;
      }

      if (isNaN(end.getTime())) {
        errors.endDate = "Invalid end date";
        hasErrors = true;
      }

      // If date objects are invalid, don't proceed with other validations
      if (hasErrors) {
        dispatch({ type: "SET_ERROR", errorType: "date", error: errors });
        return false;
      }

      // Validate start date is today or in the future for new projects
      if (start < today) {
        // For existing projects, allow past dates if they haven't been changed
        if (isEditMode && project && project.startDate) {
          // Try to format the original project start date for comparison
          const originalFormattedDate = formatDateForInput(project.startDate);

          if (originalFormattedDate === formData.startDate) {
            // This is fine - using the original date from the project
          } else {
            errors.startDate = "Start date must be today or in the future";
            hasErrors = true;
          }
        } else {
          errors.startDate = "Start date must be today or in the future";
          hasErrors = true;
        }
      }

      // Validate end date is after start date
      if (end <= start) {
        errors.endDate = "End date must be after start date";
        hasErrors = true;
      }
    } catch (err) {
      console.error("Error validating dates:", err);
      errors.startDate = "Error validating dates";
      hasErrors = true;
    }

    dispatch({ type: "SET_ERROR", errorType: "date", error: errors });
    return !hasErrors;
  }, [
    formData.startDate,
    formData.endDate,
    isEditMode,
    project,
    formatDateForInput,
    dispatch,
  ]);

  // Initialize form with project data when modal opens
  useEffect(() => {
    if (isOpen) {
      let initialData = {};

      if (isEditMode && project) {
        // Edit mode - fill form with project data
        initialData = {
          projectName: project.projectName || "",
          projectDescription: project.projectDescription || "",
          selectedStudents:
            project.studentsWorkingOn?.map((student) => student.id) || [],
          projectCategory: project.projectCategory || "",
          startDate: project.startDate
            ? formatDateForInput(project.startDate)
            : "",
          endDate: project.endDate ? formatDateForInput(project.endDate) : "",
          projectStatus: project.status || "Pending",
        };
      } else {
        // Add mode - reset form with today as default start date and default values
        // Set specific default values as requested

        initialData = {
          projectName: "",
          projectDescription: "",
          selectedStudents: [],
          projectCategory: "", // Default to "Select a category" placeholder
          startDate: getTodayFormatted(),
          endDate: "",
          projectStatus: "Pending", // Default to Pending status
        };
      }

      // Initialize form with the prepared data
      dispatch({ type: "INIT_FORM", payload: initialData });

      // Clear any previous errors
      dispatch({ type: "CLEAR_ERRORS" });
    }
  }, [
    isOpen,
    project,
    isEditMode,
    getTodayFormatted,
    formatDateForInput,
    dispatch,
  ]);

  // Handle student selection
  const handleStudentSelect = useCallback(
    (student) => {
      dispatch({
        type: "TOGGLE_STUDENT",
        studentId: student.id,
      });
    },
    [dispatch]
  );

  // Filter students based on search query - memoized for performance
  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        student.user &&
        student.user.name &&
        student.user.name
          .toLowerCase()
          .includes(studentSearchQuery.toLowerCase())
    );
  }, [students, studentSearchQuery]);

  // Toggle the dropdown
  const toggleStudentDropdown = useCallback(() => {
    dispatch({ type: "TOGGLE_DROPDOWN" });
  }, [dispatch]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showStudentDropdown &&
        !event.target.closest(".student-dropdown-container")
      ) {
        dispatch({ type: "TOGGLE_DROPDOWN" });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStudentDropdown, dispatch]);

  // Validate form fields
  const validateForm = useCallback(() => {
    // Clear previous errors
    dispatch({ type: "CLEAR_ERRORS" });

    const fieldErrors = {};
    let hasErrors = false;

    // Validate project name
    if (!formData.projectName.trim()) {
      fieldErrors.projectName = "Project name is required";
      hasErrors = true;
    }

    // Validate project description
    if (!formData.projectDescription.trim()) {
      fieldErrors.projectDescription = "Project description is required";
      hasErrors = true;
    }

    // Validate project category
    if (!formData.projectCategory) {
      fieldErrors.projectCategory = "Project category is required";
      hasErrors = true;
    }

    // Validate selected students
    if (!formData.selectedStudents.length) {
      fieldErrors.selectedStudents = "At least one student must be selected";
      hasErrors = true;
    }

    // Set field errors if any
    if (Object.keys(fieldErrors).length > 0) {
      dispatch({
        type: "SET_ERROR",
        errorType: "fields",
        error: fieldErrors,
      });
    }

    return !hasErrors;
  }, [
    formData.projectName,
    formData.projectDescription,
    formData.projectCategory,
    formData.selectedStudents,
    dispatch,
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    dispatch({ type: "CLEAR_ERRORS" });

    // Set submitting state
    dispatch({ type: "SET_SUBMITTING", isSubmitting: true });

    // Validate form
    const isFieldsValid = validateForm();
    const isDatesValid = validateDates();

    // If there are validation errors, show general error message and return
    if (!isFieldsValid || !isDatesValid) {
      dispatch({
        type: "SET_ERROR",
        errorType: "general",
        error: "Please fill out all required fields",
      });
      dispatch({ type: "SET_SUBMITTING", isSubmitting: false });
      return;
    }

    // Set progress based on status
    let progressValue = 0;
    if (formData.projectStatus === "Completed") {
      progressValue = 100; // Green progress bar
    } else if (formData.projectStatus === "In_Progress") {
      progressValue = 60; // Yellow progress bar (> 50)
    } else if (formData.projectStatus === "Pending") {
      progressValue = 25; // Gray progress bar (special case in Projects.jsx)
    }

    // Format dates for GraphQL
    let formattedStartDate = "";
    let formattedEndDate = "";

    try {
      if (formData.startDate) {
        formattedStartDate = new Date(
          formData.startDate + "T00:00:00"
        ).toISOString();
      }

      if (formData.endDate) {
        formattedEndDate = new Date(
          formData.endDate + "T00:00:00"
        ).toISOString();
      }
    } catch (err) {
      console.error("Error formatting dates for submission:", err);
      dispatch({
        type: "SET_ERROR",
        errorType: "general",
        error: "Error formatting dates. Please check date formats.",
      });
      dispatch({ type: "SET_SUBMITTING", isSubmitting: false });
      return;
    }

    // Prepare input data for GraphQL mutation
    const projectInput = {
      projectName: formData.projectName,
      projectDescription: formData.projectDescription,
      projectCategory: formData.projectCategory,
      studentsWorkingOn: formData.selectedStudents,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      status: formData.projectStatus,
      progress: progressValue,
    };

    try {
      let taskData;

      if (isEditMode) {
        // Update existing project
        taskData = {
          id: project.id,
          input: projectInput,
        };
      } else {
        // Create new project
        taskData = {
          input: projectInput,
        };
      }

      // Call the onSubmit callback and wait for it to complete
      await onSubmit(taskData);

      // If we get here, the submission was successful
      const successMessage = isEditMode
        ? "Project updated successfully!"
        : "Project added successfully!";

      // Create a success message with a different class to style it as green
      dispatch({
        type: "SET_ERROR",
        errorType: "success",
        error: successMessage,
      });

      // Only close the modal after a successful submission
      // Close the modal after a short delay to show the success message
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error submitting project:", error);

      // Handle different types of errors
      if (error.message && error.message.includes("Validation error")) {
        try {
          // Try to parse the validation error message
          const errorStart = error.message.indexOf("{");
          const errorEnd = error.message.lastIndexOf("}") + 1;
          if (errorStart > 0 && errorEnd > errorStart) {
            const errorJson = error.message.substring(errorStart, errorEnd);
            const parsedErrors = JSON.parse(errorJson);
            dispatch({
              type: "SET_ERROR",
              errorType: "backend",
              error: parsedErrors,
            });
          } else {
            dispatch({
              type: "SET_ERROR",
              errorType: "general",
              error:
                error.message ||
                "Failed to save project. Please check your inputs.",
            });
          }
        } catch {
          dispatch({
            type: "SET_ERROR",
            errorType: "general",
            error:
              error.message ||
              "Failed to save project. Please check your inputs.",
          });
        }
      } else {
        // Generic error message for other types of errors
        dispatch({
          type: "SET_ERROR",
          errorType: "general",
          error: error.message || "An error occurred while saving the project.",
        });
      }
    } finally {
      dispatch({ type: "SET_SUBMITTING", isSubmitting: false });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Update field value
    dispatch({
      type: "UPDATE_FIELD",
      field: name,
      value: value,
    });

    // Clear general error and success messages when user changes any field
    if (errors.general || errors.success) {
      dispatch({
        type: "SET_ERROR",
        errorType: "general",
        error: "",
      });

      dispatch({
        type: "SET_ERROR",
        errorType: "success",
        error: "",
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Project" : "Add New Project"}
      size="xl"
    >
      {/* General error message */}
      <ErrorMessage type="general" message={errors.general} />

      {/* Success message */}
      <ErrorMessage type="success" message={errors.success} />

      {/* Backend validation errors */}
      <ErrorMessage type="backend" errors={errors.backend} />

      <form
        onSubmit={handleSubmit}
        className="space-y-8 max-h-[75vh] overflow-y-auto pr-2"
      >
        {/* Project Title and Category in same row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            type="text"
            label="Project Title"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            placeholder="Enter project title"
            required
            error={errors.fields?.projectName}
          />

          <FormField
            type="select"
            label="Project Category"
            name="projectCategory"
            value={formData.projectCategory}
            onChange={handleChange}
            required
            error={errors.fields?.projectCategory}
            placeholder="Select a category"
            options={[
              { value: "Web Development", label: "Web Development" },
              { value: "Mobile Development", label: "Mobile Development" },
              { value: "Machine Learning", label: "Machine Learning" },
            ]}
          />
        </div>

        {/* Project Description */}
        <FormField
          label="Project Description"
          name="projectDescription"
          className="w-full"
          required
          error={errors.fields?.projectDescription}
        >
          <textarea
            name="projectDescription"
            value={formData.projectDescription}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-2 border rounded-md resize-none ${
              isDarkMode ? "bg-gray-700 text-white" : "bg-gray-50 text-gray-800"
            }`}
            placeholder="Enter project description"
          ></textarea>
        </FormField>

        {/* Students List - Searchable Dropdown */}
        <div className="space-y-2 student-dropdown-container relative">
          <label className="block text-sm font-medium after:content-['*'] after:ml-0.5 after:text-red-500">
            Select Students ({formData.selectedStudents.length} selected)
          </label>
          {/* Selected Students Pills */}
          {formData.selectedStudents.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.selectedStudents.map((studentId) => {
                const student = students.find((s) => s.id === studentId);
                if (!student || !student.user) return null;

                return (
                  <div
                    key={studentId}
                    className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${
                      isDarkMode
                        ? "bg-blue-800 text-white"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <span>{student.user.name}</span>
                    <button
                      type="button"
                      onClick={() => handleStudentSelect(student)}
                      className="text-xs font-bold hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search students..."
              value={studentSearchQuery}
              onChange={(e) => {
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "studentSearchQuery",
                  value: e.target.value,
                });
              }}
              onClick={() => dispatch({ type: "TOGGLE_DROPDOWN" })}
              className={`w-full px-4 py-2 border rounded-md ${
                errors.fields?.selectedStudents
                  ? "border-red-500"
                  : isDarkMode
                  ? "border-gray-600"
                  : "border-gray-300"
              } ${
                isDarkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-50 text-gray-800"
              }`}
            />
            <button
              type="button"
              onClick={toggleStudentDropdown}
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              {showStudentDropdown ? "▲" : "▼"}
            </button>
          </div>
          {errors.fields?.selectedStudents && (
            <p className="text-red-500 text-xs mt-1">
              {errors.fields.selectedStudents}
            </p>
          )}
          {/* Dropdown List with Virtualization - always render but control visibility with CSS */}
          <div
            ref={dropdownRef}
            className={`absolute z-10 w-full mt-1 rounded-md shadow-lg transition-all duration-200 ${
              isDarkMode
                ? "bg-gray-800 border border-gray-700"
                : "bg-white border border-gray-200"
            } ${
              showStudentDropdown
                ? "opacity-100 visible"
                : "opacity-0 invisible h-0 overflow-hidden"
            }`}
          >
            {loadingStudents ? (
              <div className="flex items-center justify-center py-4">
                <svg
                  className="animate-spin h-5 w-5 text-blue-500 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Loading students...</span>
              </div>
            ) : filteredStudents.length > 0 ? (
              <List
                height={240} // Fixed height for the virtualized list
                width="100%"
                itemCount={filteredStudents.length}
                itemSize={40} // Height of each item in pixels
                overscanCount={5} // Number of items to render outside of the visible area
              >
                {({ index, style }) => {
                  const student = filteredStudents[index];
                  return (
                    <div
                      style={style} // Important: This positions the item correctly
                      onClick={() => handleStudentSelect(student)}
                      className={`px-4 py-2 cursor-pointer flex items-center ${
                        formData.selectedStudents.includes(student.id)
                          ? isDarkMode
                            ? "bg-blue-900"
                            : "bg-blue-100"
                          : isDarkMode
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.selectedStudents.includes(student.id)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      <span>{student.user.name}</span>
                    </div>
                  );
                }}
              </List>
            ) : (
              <div className="px-4 py-2 text-gray-500">No students found</div>
            )}
          </div>
        </div>

        {/* Project Status */}
        <FormField
          type="select"
          label="Project Status"
          name="projectStatus"
          value={formData.projectStatus}
          onChange={handleChange}
          required
          error={errors.fields?.projectStatus}
          placeholder="Select a status"
          options={[
            { value: "Pending", label: "Pending" },
            { value: "In_Progress", label: "In Progress" },
            { value: "Completed", label: "Completed" },
          ]}
        />

        {/* Date Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            type="date"
            label="Start Date"
            name="startDate"
            value={formData.startDate || ""}
            onChange={handleChange}
            required
            error={errors.date?.startDate}
            min={!isEditMode ? getTodayFormatted() : undefined} // Only set min date for new projects
          />

          <FormField
            type="date"
            label="End Date"
            name="endDate"
            value={formData.endDate || ""}
            onChange={handleChange}
            required
            error={errors.date?.endDate}
            min={formData.startDate || getTodayFormatted()} // End date must be at least the start date
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            fullWidth
            icon={
              isSubmitting ? (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : null
            }
          >
            {isSubmitting
              ? "Saving..."
              : isEditMode
              ? "Update Project"
              : "Add Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

ProjectFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  project: PropTypes.object,
};

export default ProjectFormModal;
