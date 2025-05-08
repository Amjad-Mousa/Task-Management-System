import { useState, useEffect, useContext } from "react";
import { DarkModeContext } from "../Context/DarkModeContext";

const AddTaskModal = ({ isOpen, onClose, onAddTask }) => {
  const { isDarkMode } = useContext(DarkModeContext);

  // Format date to YYYY-MM-DD for input type="date"
  const formatDateForInput = (date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
  };

  // Get today's date formatted for input
  const getTodayFormatted = () => {
    return formatDateForInput(new Date());
  };

  // Validate due date is today or in the future
  const validateDueDate = (dateString) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for fair comparison

    return dueDate >= today;
  };
  const [projects] = useState([
    "Website Redesign",
    "Mobile App Development",
    "E-commerce Platform",
  ]);
  const [students] = useState([
    "All Yaseen",
    "Braz Aeesh",
    "Ibn Al-Jawzee",
    "Ibn Malik",
    "Ayman Oulom",
  ]);
  const [formData, setFormData] = useState({
    project: "",
    taskName: "",
    description: "",
    assignedStudent: "",
    status: "notStarted", // Default to Not Started
    dueDate: "",
  });

  const [message, setMessage] = useState({ text: "", color: "red" });

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setFormData({
        project: "",
        taskName: "",
        description: "",
        assignedStudent: "",
        status: "notStarted", // Default to Not Started
        dueDate: getTodayFormatted(), // Set today as default due date
      });
      setMessage({ text: "", color: "red" });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset message
    setMessage({ text: "", color: "red" });

    // Check required fields
    if (
      !formData.project ||
      !formData.taskName ||
      !formData.assignedStudent ||
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

    const formattedStatus = formData.status
      .replace(/([A-Z])/g, " $1")
      .trim()
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

    const newTask = {
      id: Date.now(),
      ...formData,
      status: formattedStatus,
      lastUpdated: new Date().toISOString(),
    };

    onAddTask(newTask);

    setTimeout(() => {
      onClose();
    }, 0);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
            Create New Task
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Project Title *</label>
            <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-100 border-gray-300 text-gray-800"
              }`}
              required
            >
              <option value="">Select a project</option>
              {projects.map((project) => (
                <option key={project} value={project}>
                  {project}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Task Name *</label>
            <input
              type="text"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              placeholder="Enter task name"
              className={`w-full p-2 border rounded-md ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-100 border-gray-300 text-gray-800"
              }`}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter task description"
              className={`w-full p-2 border rounded-md ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-100 border-gray-300 text-gray-800"
              }`}
              rows="3"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Assigned Student *
            </label>
            <select
              name="assignedStudent"
              value={formData.assignedStudent}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-100 border-gray-300 text-gray-800"
              }`}
              required
            >
              <option value="">Select a student</option>
              {students.map((student) => (
                <option key={student} value={student}>
                  {student}
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
              required
            >
              <option value="">Select status</option>
              <option value="notStarted">Not Started</option>
              <option value="inProgress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Due Date *</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              min={getTodayFormatted()} // Set minimum date to today
              onChange={(e) => {
                handleChange(e);
                // Clear error message when user changes the date
                if (message.text.includes("due date")) {
                  setMessage({ text: "", color: "red" });
                }
              }}
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
              required
            />
          </div>

          {message.text && (
            <div
              className={`p-2 rounded-md text-center text-white bg-${message.color}-600`}
            >
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
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskModal;
