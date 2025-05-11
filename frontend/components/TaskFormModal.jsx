import { useState, useEffect, useContext, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../Context/DarkModeContext";
import { useGraphQL } from "../Context/GraphQLContext";
import {
  GET_PROJECTS_QUERY,
  GET_STUDENTS_QUERY,
  GET_ADMINS_QUERY,
} from "../graphql/queries";

/**
 * TaskFormModal component for adding or editing tasks
 * Optimized with GraphQL context for better caching and performance
 */
const TaskFormModal = ({ isOpen, onClose, onSubmit, task = null }) => {
  const isEditMode = !!task;
  const { isDarkMode } = useContext(DarkModeContext);
  const { executeQuery, loading: graphqlLoading } = useGraphQL();
  const [message, setMessage] = useState({ text: "", color: "red" });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedStudentId: "",
    assignedAdminId: "",
    assignedProjectId: "",
    status: "Not Started",
    dueDate: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
  const validateDueDate = (date) => {
    if (!date) return false;

    try {
      // Parse the date string to a Date object
      const dueDate = new Date(date);
      const today = new Date();

      // Reset time to compare dates only
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);

      // Check if date is valid
      if (isNaN(dueDate.getTime())) {
        return false;
      }

      // For existing tasks, allow past dates if they haven't been changed
      if (isEditMode && task && task.dueDate) {
        const originalFormattedDate = formatDateForInput(task.dueDate);
        if (originalFormattedDate === formData.dueDate) {
          return true;
        }
      }

      return dueDate >= today;
    } catch (err) {
      console.error("Error validating due date:", err);
      return false;
    }
  };

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
      if (isEditMode && task) {
        // Edit mode - fill form with task data
        setFormData({
          title: task.title || "",
          description: task.description || "",
          assignedStudentId: task.assignedStudent?.id || "",
          assignedAdminId: task.assignedAdmin?.id || "",
          assignedProjectId: task.assignedProject || "",
          status: task.status || "Not Started",
          dueDate: formatDateForInput(task.dueDate) || "",
        });
      } else {
        // Add mode - reset form
        const currentAdminId = localStorage.getItem("adminId");
        setFormData({
          title: "",
          description: "",
          assignedStudentId: "",
          assignedAdminId: currentAdminId || "",
          assignedProjectId: "",
          status: "Not Started",
          dueDate: getTodayFormatted(),
        });
      }
      setMessage({ text: "", color: "red" });
    }
  }, [isOpen, task, isEditMode, formatDateForInput, getTodayFormatted]);

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
    const errors = {};

    // Validate title
    if (!formData.title.trim()) {
      errors.title = "Task title is required";
    } else if (formData.title.trim().length < 3) {
      errors.title = "Task title must be at least 3 characters";
    }

    // Validate project
    if (!formData.assignedProjectId) {
      errors.assignedProjectId = "Project is required";
    }

    // Validate admin
    if (!formData.assignedAdminId) {
      errors.assignedAdminId = "Admin is required";
    }

    // Validate student
    if (!formData.assignedStudentId) {
      errors.assignedStudentId = "Student is required";
    }

    // Validate status
    if (!formData.status) {
      errors.status = "Status is required";
    }

    // Validate due date
    if (!formData.dueDate) {
      errors.dueDate = "Due date is required";
    } else if (!validateDueDate(formData.dueDate)) {
      errors.dueDate = "Due date must be today or in the future";
    }

    return errors;
  }, [formData, validateDueDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset message and set submitting state
    setMessage({ text: "", color: "red" });
    setSubmitting(true);

    // Validate form
    const errors = validateForm();
    setFormErrors(errors);

    // If there are errors, show message and return
    if (Object.keys(errors).length > 0) {
      setMessage({
        text: "Please correct the errors in the form",
        color: "red",
      });
      setSubmitting(false);
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

        // Show success message
        setMessage({ text: "Task updated successfully!", color: "green" });
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

        // Show success message
        setMessage({ text: "Task added successfully!", color: "green" });
      }

      // Call the onSubmit callback
      await onSubmit(taskData);

      // Close the modal after a short delay to show the success message
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error submitting task:", error);
      setMessage({
        text: error.message || "Failed to save task. Please try again.",
        color: "red",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear specific field error when user changes that field
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }

    // Clear general error message
    if (message.text) {
      setMessage({ text: "", color: "red" });
    }
  };

  // Get field error class based on whether the field has an error
  const getFieldErrorClass = (fieldName) => {
    return formErrors[fieldName]
      ? `border-red-500 ${isDarkMode ? "bg-red-900/20" : "bg-red-50"}`
      : isDarkMode
      ? "border-gray-600 bg-gray-700"
      : "border-gray-300 bg-gray-100";
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-2xl p-8 rounded-lg shadow-xl ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            {isEditMode ? "Edit Task" : "Create New Task"}
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

        {message.text && (
          <div
            className={`mb-4 p-3 rounded-md ${
              message.color === "red"
                ? "bg-red-600 text-white"
                : "bg-green-600 text-white"
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Project *</label>
                <select
                  name="assignedProjectId"
                  value={formData.assignedProjectId}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${getFieldErrorClass(
                    "assignedProjectId"
                  )} ${isDarkMode ? "text-white" : "text-gray-800"}`}
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
                {formErrors.assignedProjectId && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.assignedProjectId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Task Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter task title"
                  className={`w-full p-2 border rounded-md ${getFieldErrorClass(
                    "title"
                  )} ${isDarkMode ? "text-white" : "text-gray-800"}`}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.title}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Description</label>
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Assigned Admin *
                </label>
                <select
                  name="assignedAdminId"
                  value={formData.assignedAdminId}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${getFieldErrorClass(
                    "assignedAdminId"
                  )} ${isDarkMode ? "text-white" : "text-gray-800"}`}
                >
                  <option value="">Select an admin</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.user ? admin.user.name : `Admin ${admin.id}`}
                    </option>
                  ))}
                </select>
                {formErrors.assignedAdminId && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.assignedAdminId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Assigned Student *
                </label>
                <select
                  name="assignedStudentId"
                  value={formData.assignedStudentId}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${getFieldErrorClass(
                    "assignedStudentId"
                  )} ${isDarkMode ? "text-white" : "text-gray-800"}`}
                >
                  <option value="">Select a student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.user
                        ? student.user.name
                        : `Student ${student.id}`}
                    </option>
                  ))}
                </select>
                {formErrors.assignedStudentId && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.assignedStudentId}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${getFieldErrorClass(
                    "status"
                  )} ${isDarkMode ? "text-white" : "text-gray-800"}`}
                >
                  <option value="Not Started">Not Started</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
                {formErrors.status && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.status}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">Due Date *</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  min={!isEditMode ? getTodayFormatted() : undefined} // Only set min date for new tasks
                  onChange={handleChange}
                  className={`w-full p-2 border rounded-md ${getFieldErrorClass(
                    "dueDate"
                  )} ${isDarkMode ? "text-white" : "text-gray-800"}`}
                />
                {formErrors.dueDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.dueDate}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
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
                disabled={submitting || loading}
                className={`flex-1 py-3 px-4 text-white font-medium rounded-md transition-colors ${
                  submitting || loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {submitting
                  ? "Saving..."
                  : loading
                  ? "Loading..."
                  : isEditMode
                  ? "Update Task"
                  : "Add Task"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

TaskFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  task: PropTypes.object,
};

export default TaskFormModal;
