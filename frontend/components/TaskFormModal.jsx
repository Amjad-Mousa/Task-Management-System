import { useState, useEffect, useContext, useCallback } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../Context/DarkModeContext";
import { executeGraphQL } from "../utils/graphqlClient";
import {
  GET_PROJECTS_QUERY,
  GET_STUDENTS_QUERY,
  GET_ADMINS_QUERY,
} from "../graphql/queries";

/**
 * TaskFormModal component for adding or editing tasks
 */
const TaskFormModal = ({ isOpen, onClose, onSubmit, task = null }) => {
  const isEditMode = !!task;
  const { isDarkMode } = useContext(DarkModeContext);
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

  // State for projects, students, and admins
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format date to YYYY-MM-DD for input type="date"
  const formatDateForInput = useCallback((date) => {
    if (!date) return "";

    const d = new Date(date);
    // Check if date is valid
    if (isNaN(d.getTime())) {
      // Try to parse MM/DD/YYYY format
      const parts = date.split("/");
      if (parts.length === 3) {
        const month = parts[0].padStart(2, "0");
        const day = parts[1].padStart(2, "0");
        const year = parts[2];
        return `${year}-${month}-${day}`;
      }
      return "";
    }

    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  }, []);

  // Get today's date formatted for input
  const getTodayFormatted = useCallback(() => {
    return formatDateForInput(new Date());
  }, [formatDateForInput]);

  // Validate due date is today or in the future
  const validateDueDate = (date) => {
    if (!date) return false;

    const dueDate = new Date(date);
    const today = new Date();

    // Reset time to compare dates only
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    // For existing tasks, allow past dates if they haven't been changed
    if (isEditMode && task && task.dueDate === formData.dueDate) {
      return true;
    }

    return dueDate >= today;
  };

  // Fetch projects, students, and admins when modal opens
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        setLoading(true);
        try {
          // Fetch projects
          const projectsData = await executeGraphQL(GET_PROJECTS_QUERY);
          if (projectsData && projectsData.projects) {
            setProjects(projectsData.projects);
          }

          // Fetch students
          const studentsData = await executeGraphQL(GET_STUDENTS_QUERY);
          if (studentsData && studentsData.students) {
            setStudents(studentsData.students);
          }

          // Fetch admins
          const adminsData = await executeGraphQL(GET_ADMINS_QUERY);
          if (adminsData && adminsData.admins) {
            setAdmins(adminsData.admins);
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
  }, [isOpen]);

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
          assignedProjectId: task.assignedProject?.id || "",
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset message
    setMessage({ text: "", color: "red" });

    // Check required fields
    if (
      !formData.title ||
      !formData.assignedStudentId ||
      !formData.assignedAdminId ||
      !formData.assignedProjectId ||
      !formData.status ||
      !formData.dueDate
    ) {
      setMessage({ text: "Please fill out all required fields", color: "red" });
      return;
    }

    // Validate due date is today or in the future
    if (!validateDueDate(formData.dueDate)) {
      setMessage({
        text: "Due date must be today or in the future",
        color: "red",
      });
      return;
    }

    // Format the date for GraphQL (ISO string)
    const formatDateForGraphQL = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString();
    };

    if (isEditMode) {
      // Update existing task
      const updatedTask = {
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

      // Call the onSubmit callback
      onSubmit(updatedTask);
    } else {
      // Create new task
      const newTask = {
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

      // Call the onSubmit callback
      onSubmit(newTask);
    }

    // Close the modal after a short delay to show the success message
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // Clear error message when user changes a field
    if (message.text) {
      setMessage({ text: "", color: "red" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-xl p-8 rounded-lg shadow-xl ${
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

        {message.text && message.color === "red" && (
          <div className="mb-4 p-3 bg-red-600 text-white rounded-md">
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Project *</label>
              <select
                name="assignedProjectId"
                value={formData.assignedProjectId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-100 border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Task Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter task title"
                className={`w-full p-2 border rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-100 border-gray-300 text-gray-800"
                }`}
              />
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

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Assigned Admin *
              </label>
              <select
                name="assignedAdminId"
                value={formData.assignedAdminId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-100 border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Select an admin</option>
                {admins.map((admin) => (
                  <option key={admin.id} value={admin.id}>
                    {admin.user ? admin.user.name : `Admin ${admin.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">
                Assigned Student *
              </label>
              <select
                name="assignedStudentId"
                value={formData.assignedStudentId}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-100 border-gray-300 text-gray-800"
                }`}
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.user ? student.user.name : `Student ${student.id}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-100 border-gray-300 text-gray-800"
                }`}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                min={!isEditMode ? getTodayFormatted() : undefined} // Only set min date for new tasks
                onChange={handleChange}
                className={`w-full p-2 border rounded-md ${
                  message.text.includes("due date")
                    ? "border-red-500"
                    : isDarkMode
                    ? "border-gray-600"
                    : "border-gray-300"
                } ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              />
            </div>

            {message.text && message.color === "green" && (
              <div className="mb-4 p-3 bg-green-600 text-white rounded-md">
                {message.text}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2 px-4 text-white font-medium rounded-md transition-colors ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading
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
