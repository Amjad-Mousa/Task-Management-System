import {
  useState,
  useEffect,
  useContext,
  useCallback,
  useReducer,
} from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../Context/DarkModeContext";
import { useGraphQL } from "../Context/GraphQLContext";
import {
  GET_PROJECTS_QUERY,
  GET_STUDENTS_QUERY,
  GET_ADMINS_QUERY,
} from "../graphql/queries";
import { Modal, Button, ErrorMessage, FormField } from "./ui";

/**
 * @file TaskFormModal.jsx - Modal component for creating and editing tasks
 * @module components/TaskFormModal
 */

/**
 * Initial state for the form reducer
 * @type {Object}
 */
const initialFormState = {
  formData: {
    title: "",
    description: "",
    assignedStudentId: "",
    assignedAdminId: "",
    assignedProjectId: "",
    status: "Not Started",
    dueDate: "",
  },
  isSubmitting: false,
  errors: {
    general: "",
    success: "",
    backend: null,
    date: { dueDate: "" },
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
          date: { dueDate: "" },
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
 * TaskFormModal component for adding or editing tasks
 * Optimized with GraphQL context for better caching and performance
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Function to call when modal is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Object} [props.task=null] - Task object for editing (null for creating new task)
 * @returns {React.ReactElement} Rendered TaskFormModal component
 */
const TaskFormModal = ({ isOpen, onClose, onSubmit, task = null }) => {
  const isEditMode = !!task;
  const { isDarkMode } = useContext(DarkModeContext);
  const { executeQuery } = useGraphQL();

  // Use reducer for form state management
  const [formState, dispatch] = useReducer(formReducer, initialFormState);

  // Destructure form state for easier access
  const { formData, isSubmitting, errors } = formState;

  // State for projects, students, and admins
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format date to YYYY-MM-DD for input type="date"
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
        // Try to parse MM/DD/YYYY format
        else if (date.includes("/")) {
          const parts = date.split("/");
          if (parts.length === 3) {
            const month = parts[0].padStart(2, "0");
            const day = parts[1].padStart(2, "0");
            const year = parts[2];
            return `${year}-${month}-${day}`;
          }
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
        return "";
      }

      // Check if date is valid
      if (!d || isNaN(d.getTime())) {
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

  // Validate due date is today or in the future
  const validateDueDate = useCallback(() => {
    const date = formData.dueDate;
    if (!date) {
      dispatch({
        type: "SET_ERROR",
        errorType: "date",
        error: { dueDate: "Due date is required" },
      });
      return false;
    }

    try {
      // Parse the date string to a Date object
      const dueDate = new Date(date);
      const today = new Date();

      // Reset time to compare dates only
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      // Check if date is valid
      if (isNaN(dueDate.getTime())) {
        dispatch({
          type: "SET_ERROR",
          errorType: "date",
          error: { dueDate: "Invalid date format" },
        });
        return false;
      }

      // For existing tasks, allow past dates if they haven't been changed
      if (isEditMode && task && task.dueDate) {
        const originalFormattedDate = formatDateForInput(task.dueDate);
        if (originalFormattedDate === date) {
          return true;
        }
      }

      if (dueDate < today) {
        dispatch({
          type: "SET_ERROR",
          errorType: "date",
          error: { dueDate: "Due date must be today or in the future" },
        });
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error validating due date:", err);
      dispatch({
        type: "SET_ERROR",
        errorType: "date",
        error: { dueDate: "Error validating date" },
      });
      return false;
    }
  }, [formData.dueDate, isEditMode, task, formatDateForInput, dispatch]);

  // Fetch projects, students, and admins when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        setLoading(true);
        try {
          // Fetch all data in parallel for better performance
          const [projectsData, studentsData, adminsData] = await Promise.all([
            executeQuery(GET_PROJECTS_QUERY, {}, true, true), // Use caching
            executeQuery(GET_STUDENTS_QUERY, {}, true, true), // Use caching
            executeQuery(GET_ADMINS_QUERY, {}, true, true), // Use caching
          ]);

          // Set projects data
          if (projectsData && projectsData.projects) {
            setProjects(projectsData.projects);
          } else {
            console.warn("No projects found in response");
          }

          // Set students data
          if (studentsData && studentsData.students) {
            setStudents(studentsData.students);
          } else {
            console.warn("No students found in response");
          }

          // Set admins data
          if (adminsData && adminsData.admins) {
            setAdmins(adminsData.admins);
          } else {
            console.warn("No admins found in response");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setMessage({
            text: "Failed to load data. Please try again.",
            color: "red",
          });
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [isOpen, executeQuery]);

  // Initialize form with task data when modal opens
  useEffect(() => {
    if (isOpen) {
      let initialData = {};

      if (isEditMode && task) {
        // Edit mode - fill form with task data
        initialData = {
          title: task.title || "",
          description: task.description || "",
          assignedStudentId: task.assignedStudent?.id || "",
          assignedAdminId: task.assignedAdmin?.id || "",
          assignedProjectId: task.assignedProject || "",
          status: task.status || "Not Started",
          dueDate: formatDateForInput(task.dueDate) || "",
        };
      } else {
        // Add mode - reset form with default values
        const currentAdminId = localStorage.getItem("adminId");

        // Set default values for admin, project, and student
        // Use the first available option for each if available
        const defaultAdminId =
          currentAdminId || (admins.length > 0 ? admins[0].id : "");
        const defaultProjectId = projects.length > 0 ? projects[0].id : "";
        const defaultStudentId = students.length > 0 ? students[0].id : "";

        initialData = {
          title: "",
          description: "",
          assignedStudentId: defaultStudentId, // Default to first student
          assignedAdminId: defaultAdminId, // Default to current admin or first admin
          assignedProjectId: defaultProjectId, // Default to first project
          status: "Not Started",
          dueDate: getTodayFormatted(),
        };
      }

      // Initialize form with the prepared data
      dispatch({ type: "INIT_FORM", payload: initialData });

      // Clear any previous errors
      dispatch({ type: "CLEAR_ERRORS" });
    }
  }, [
    isOpen,
    task,
    isEditMode,
    formatDateForInput,
    getTodayFormatted,
    dispatch,
  ]);

  // Format the date for GraphQL (ISO string)
  const formatDateForGraphQL = useCallback((dateString) => {
    try {
      // Add time part to ensure consistent parsing
      const date = new Date(dateString + "T00:00:00");
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date format");
      }
      return date.toISOString();
    } catch (err) {
      console.error("Error formatting date for GraphQL:", err);
      throw err;
    }
  }, []);

  // Validate form fields
  const validateForm = useCallback(() => {
    // Clear previous errors
    dispatch({ type: "CLEAR_ERRORS" });

    const fieldErrors = {};
    let hasErrors = false;

    // Validate title
    if (!formData.title.trim()) {
      fieldErrors.title = "Task title is required";
      hasErrors = true;
    } else if (formData.title.trim().length < 3) {
      fieldErrors.title = "Task title must be at least 3 characters";
      hasErrors = true;
    }

    // Validate description
    if (!formData.description.trim()) {
      fieldErrors.description = "Task description is required";
      hasErrors = true;
    }

    // Validate project
    if (!formData.assignedProjectId) {
      fieldErrors.assignedProjectId = "Project is required";
      hasErrors = true;
    }

    // Validate admin
    if (!formData.assignedAdminId) {
      fieldErrors.assignedAdminId = "Admin is required";
      hasErrors = true;
    }

    // Validate student
    if (!formData.assignedStudentId) {
      fieldErrors.assignedStudentId = "Student is required";
      hasErrors = true;
    }

    // Validate status
    if (!formData.status) {
      fieldErrors.status = "Status is required";
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

    // Validate due date separately
    const isDateValid = validateDueDate();

    return !hasErrors && isDateValid;
  }, [formData, validateDueDate, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    dispatch({ type: "CLEAR_ERRORS" });

    // Set submitting state
    dispatch({ type: "SET_SUBMITTING", isSubmitting: true });

    // Validate form
    const isValid = validateForm();

    // If there are errors, show general error message and return
    if (!isValid) {
      dispatch({
        type: "SET_ERROR",
        errorType: "general",
        error: "Please fill out all required fields",
      });
      dispatch({ type: "SET_SUBMITTING", isSubmitting: false });
      return;
    }

    try {
      let taskData;

      if (isEditMode) {
        // Update existing task
        taskData = {
          id: task.id,
          input: {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            dueDate: formatDateForGraphQL(formData.dueDate),
            assignedAdminId: formData.assignedAdminId,
            assignedStudentId: formData.assignedStudentId,
            assignedProjectId: formData.assignedProjectId,
          },
        };
      } else {
        // Create new task
        taskData = {
          input: {
            title: formData.title,
            description: formData.description,
            status: formData.status,
            dueDate: formatDateForGraphQL(formData.dueDate),
            assignedAdminId: formData.assignedAdminId,
            assignedStudentId: formData.assignedStudentId,
            assignedProjectId: formData.assignedProjectId,
            createdByAdminId:
              localStorage.getItem("adminId") || formData.assignedAdminId,
          },
        };
      }

      // Call the onSubmit callback and wait for it to complete
      // If it throws an error, it will be caught in the catch block
      await onSubmit(taskData);

      // If we get here, the submission was successful (no error was thrown)

      // Only show success message and close modal if we get here (no errors thrown)
      const successMessage = isEditMode
        ? "Task updated successfully!"
        : "Task added successfully!";

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
      }, 500);
    } catch (error) {
      console.error("Error submitting task:", error);

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
                "Failed to save task. Please check your inputs.",
            });
          }
        } catch {
          dispatch({
            type: "SET_ERROR",
            errorType: "general",
            error:
              error.message || "Failed to save task. Please check your inputs.",
          });
        }
      } else {
        // Generic error message for other types of errors
        dispatch({
          type: "SET_ERROR",
          errorType: "general",
          error: error.message || "An error occurred while saving the task.",
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
      title={isEditMode ? "Edit Task" : "Create New Task"}
      size="lg"
    >
      {/* General error message */}
      <ErrorMessage type="general" message={errors.general} />

      {/* Success message */}
      <ErrorMessage type="success" message={errors.success} />

      {/* Backend validation errors */}
      <ErrorMessage type="backend" errors={errors.backend} />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              type="select"
              label="Project"
              name="assignedProjectId"
              value={formData.assignedProjectId}
              onChange={handleChange}
              required
              error={errors.fields.assignedProjectId}
              placeholder="Select a project"
              options={[
                ...projects.map((project) => ({
                  value: project.id,
                  label: project.projectName,
                })),
              ]}
            />

            <FormField
              type="text"
              label="Task Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              required
              error={errors.fields.title}
            />
          </div>

          <FormField
            label="Description"
            name="description"
            className="w-full"
            required
            error={errors.fields.description}
          >
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows={3}
              className={`w-full p-2 border rounded-md resize-none ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-100 border-gray-300 text-gray-800"
              }`}
            ></textarea>
          </FormField>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              type="select"
              label="Assigned Admin"
              name="assignedAdminId"
              value={formData.assignedAdminId}
              onChange={handleChange}
              required
              error={errors.fields.assignedAdminId}
              placeholder="Select an admin"
              options={[
                ...admins.map((admin) => ({
                  value: admin.id,
                  label: admin.user ? admin.user.name : `Admin ${admin.id}`,
                })),
              ]}
            />

            <FormField
              type="select"
              label="Assigned Student"
              name="assignedStudentId"
              value={formData.assignedStudentId}
              onChange={handleChange}
              required
              error={errors.fields.assignedStudentId}
              placeholder="Select a student"
              options={[
                ...students.map((student) => ({
                  value: student.id,
                  label: student.user
                    ? student.user.name
                    : `Student ${student.id}`,
                })),
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              type="select"
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              error={errors.fields.status}
              placeholder="Select a status"
              options={[
                { value: "Not Started", label: "Not Started" },
                { value: "In Progress", label: "In Progress" },
                { value: "Pending", label: "Pending" },
                { value: "Completed", label: "Completed" },
              ]}
            />

            <FormField
              type="date"
              label="Due Date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              error={errors.date.dueDate}
              min={!isEditMode ? getTodayFormatted() : undefined} // Only set min date for new tasks
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting || loading}
              fullWidth
            >
              {isSubmitting
                ? "Saving..."
                : loading
                ? "Loading..."
                : isEditMode
                ? "Update Task"
                : "Add Task"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

TaskFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  task: PropTypes.object,
};

export default TaskFormModal;
