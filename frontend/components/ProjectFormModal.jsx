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

/**
 * Initial form state
 */
const initialFormState = {
  projectName: "",
  projectDescription: "",
  selectedStudents: [],
  projectCategory: "",
  startDate: "",
  endDate: "",
  projectStatus: "Pending",
  studentSearchQuery: "",
  showStudentDropdown: false,
  isSubmitting: false,
  errors: {
    general: "",
    backend: null,
    date: { startDate: "", endDate: "" },
    fields: {},
  },
};

/**
 * Form state reducer
 */
const formReducer = (state, action) => {
  switch (action.type) {
    case "INIT_FORM":
      return { ...initialFormState, ...action.payload };
    case "UPDATE_FIELD":
      return {
        ...state,
        [action.field]: action.value,
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
      const isSelected = state.selectedStudents.includes(studentId);
      return {
        ...state,
        selectedStudents: isSelected
          ? state.selectedStudents.filter((id) => id !== studentId)
          : [...state.selectedStudents, studentId],
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
 */
const ProjectFormModal = ({ isOpen, onClose, onSubmit, project = null }) => {
  const isEditMode = !!project;
  const { isDarkMode } = useContext(DarkModeContext);
  const { executeQuery } = useGraphQL();

  // Use reducer for form state management
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  // Destructure form state for easier access
  const {
    projectName,
    projectDescription,
    selectedStudents,
    projectCategory,
    startDate,
    endDate,
    projectStatus,
    studentSearchQuery,
    showStudentDropdown,
    isSubmitting,
    errors,
  } = formState;

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
    if (!startDate) {
      errors.startDate = "Start date is required";
      hasErrors = true;
    }

    if (!endDate) {
      errors.endDate = "End date is required";
      hasErrors = true;
    }

    // If dates are missing, don't proceed with other validations
    if (hasErrors) {
      dispatch({ type: "SET_ERROR", errorType: "date", error: errors });
      return false;
    }

    // Check if dates are in valid format
    if (!startDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      errors.startDate = "Invalid date format. Use YYYY-MM-DD";
      hasErrors = true;
    }

    if (!endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
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
      const start = new Date(startDate + "T00:00:00"); // Add time part to ensure consistent parsing
      const end = new Date(endDate + "T00:00:00");
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

          if (originalFormattedDate === startDate) {
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
  }, [startDate, endDate, isEditMode, project, formatDateForInput, dispatch]);

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
        // Add mode - reset form with today as default start date
        initialData = {
          projectName: "",
          projectDescription: "",
          selectedStudents: [],
          projectCategory: "",
          startDate: getTodayFormatted(),
          endDate: "",
          projectStatus: "Pending",
        };
      }

      // Initialize form with the prepared data
      dispatch({ type: "INIT_FORM", payload: initialData });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error messages
    dispatch({ type: "CLEAR_ERRORS" });

    // Check required fields
    if (
      !projectName ||
      !projectDescription ||
      !selectedStudents.length ||
      !projectCategory ||
      !startDate ||
      !endDate
    ) {
      dispatch({
        type: "SET_ERROR",
        errorType: "general",
        error: "Please fill out all required fields",
      });
      return;
    }

    // Validate dates
    if (!validateDates()) {
      // If there are date validation errors, show the general error message
      dispatch({
        type: "SET_ERROR",
        errorType: "general",
        error: "Please fix the date errors before submitting",
      });
      return;
    }

    // Set progress based on status
    let progressValue = 0;
    if (projectStatus === "Completed") {
      progressValue = 100; // Green progress bar
    } else if (projectStatus === "In_Progress") {
      progressValue = 60; // Yellow progress bar (> 50)
    } else if (projectStatus === "Pending") {
      progressValue = 25; // Gray progress bar (special case in Projects.jsx)
    }

    // Ensure dates are in the correct format for the backend
    let formattedStartDate = "";
    let formattedEndDate = "";

    try {
      if (startDate) {
        const startDateObj = new Date(startDate + "T00:00:00");
        if (!isNaN(startDateObj.getTime())) {
          formattedStartDate = startDateObj.toISOString();
        } else {
          throw new Error("Invalid start date format");
        }
      }

      if (endDate) {
        const endDateObj = new Date(endDate + "T00:00:00");
        if (!isNaN(endDateObj.getTime())) {
          formattedEndDate = endDateObj.toISOString();
        } else {
          throw new Error("Invalid end date format");
        }
      }
    } catch (err) {
      console.error("Error formatting dates for submission:", err);
      dispatch({
        type: "SET_ERROR",
        errorType: "general",
        error: "Error formatting dates. Please check date formats.",
      });
      return;
    }

    // Prepare input data for GraphQL mutation
    const projectInput = {
      projectName,
      projectDescription,
      projectCategory,
      studentsWorkingOn: selectedStudents,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      status: projectStatus,
      progress: progressValue,
    };

    // Set submitting state
    dispatch({ type: "SET_SUBMITTING", isSubmitting: true });

    try {
      if (isEditMode) {
        // Update existing project
        const data = {
          id: project.id,
          input: projectInput,
        };
        await onSubmit(data);
      } else {
        // Create new project
        const data = {
          input: projectInput,
        };
        await onSubmit(data);
      }
      // If we get here, the submission was successful
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
      } else if (
        error.message &&
        error.message.includes("Reference validation error")
      ) {
        try {
          // Try to parse the reference validation error message
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
                "Failed to save project. Please check your references.",
            });
          }
        } catch {
          dispatch({
            type: "SET_ERROR",
            errorType: "general",
            error:
              error.message ||
              "Failed to save project. Please check your references.",
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

  // Use CSS to control visibility instead of conditional rendering
  return (
    <div
      className={`fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div
        className={`w-full max-w-4xl p-8 rounded-lg shadow-xl relative transition-transform duration-300 ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        } ${isOpen ? "translate-y-0 scale-100" : "translate-y-4 scale-95"}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            {isEditMode ? "Edit Project" : "Add New Project"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* General error message */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-600 text-white rounded-md">
            {errors.general}
          </div>
        )}

        {/* Backend validation errors */}
        {errors.backend && Object.keys(errors.backend).length > 0 && (
          <div className="mb-4 p-3 bg-red-600 text-white rounded-md">
            <p className="font-bold mb-2">Please fix the following errors:</p>
            <ul className="list-disc pl-5">
              {Object.entries(errors.backend).map(([field, message]) => (
                <li key={field}>
                  <span className="font-semibold">{field}:</span> {message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 max-h-[75vh] overflow-y-auto pr-2"
        >
          {/* Project Title and Category in same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Project Title *
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "projectName",
                    value: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border rounded-md ${
                  errors.fields?.projectName
                    ? "border-red-500"
                    : isDarkMode
                    ? "border-gray-600"
                    : "border-gray-300"
                } ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-800"
                }`}
                placeholder="Enter project title"
              />
              {errors.fields?.projectName && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fields.projectName}
                </p>
              )}
            </div>

            {/* Project Category */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Project Category *
              </label>
              <select
                value={projectCategory}
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "projectCategory",
                    value: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border rounded-md ${
                  errors.fields?.projectCategory
                    ? "border-red-500"
                    : isDarkMode
                    ? "border-gray-600"
                    : "border-gray-300"
                } ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-800"
                }`}
              >
                <option value="">Select a category</option>
                <option value="Web Development">Web Development</option>
                <option value="Mobile Development">Mobile Development</option>
                <option value="Machine Learning">Machine Learning</option>
              </select>
              {errors.fields?.projectCategory && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.fields.projectCategory}
                </p>
              )}
            </div>
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Project Description *
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "projectDescription",
                  value: e.target.value,
                })
              }
              rows={4}
              className={`w-full px-4 py-2 border rounded-md resize-none ${
                errors.fields?.projectDescription
                  ? "border-red-500"
                  : isDarkMode
                  ? "border-gray-600"
                  : "border-gray-300"
              } ${
                isDarkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-50 text-gray-800"
              }`}
              placeholder="Enter project description"
            ></textarea>
            {errors.fields?.projectDescription && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fields.projectDescription}
              </p>
            )}
          </div>

          {/* Students List - Searchable Dropdown */}
          <div className="space-y-2 student-dropdown-container relative">
            <label className="block text-sm font-medium">
              Select Students * ({selectedStudents.length} selected)
            </label>
            {/* Selected Students Pills */}
            {selectedStudents.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedStudents.map((studentId) => {
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
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "studentSearchQuery",
                    value: e.target.value,
                  })
                }
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
                          selectedStudents.includes(student.id)
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
                          checked={selectedStudents.includes(student.id)}
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
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Project Status *
            </label>
            <select
              value={projectStatus}
              onChange={(e) =>
                dispatch({
                  type: "UPDATE_FIELD",
                  field: "projectStatus",
                  value: e.target.value,
                })
              }
              className={`w-full px-4 py-2 border rounded-md ${
                errors.fields?.projectStatus
                  ? "border-red-500"
                  : isDarkMode
                  ? "border-gray-600"
                  : "border-gray-300"
              } ${
                isDarkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-50 text-gray-800"
              }`}
            >
              <option value="Pending">Pending</option>
              <option value="In_Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
            {errors.fields?.projectStatus && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fields.projectStatus}
              </p>
            )}
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Start Date *</label>
              <input
                type="date"
                value={startDate || ""}
                min={!isEditMode ? getTodayFormatted() : undefined} // Only set min date for new projects
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "startDate",
                    value: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border rounded-md ${
                  errors.date?.startDate
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
              {errors.date?.startDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.date.startDate}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">End Date *</label>
              <input
                type="date"
                value={endDate || ""}
                min={startDate || getTodayFormatted()} // End date must be at least the start date
                onChange={(e) =>
                  dispatch({
                    type: "UPDATE_FIELD",
                    field: "endDate",
                    value: e.target.value,
                  })
                }
                className={`w-full px-4 py-2 border rounded-md ${
                  errors.date?.endDate
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
              {errors.date?.endDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.date.endDate}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-md transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 text-white font-medium rounded-md transition-colors flex items-center justify-center ${
                isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : isEditMode ? (
                "Update Project"
              ) : (
                "Add Project"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

ProjectFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  project: PropTypes.object,
};

export default ProjectFormModal;
