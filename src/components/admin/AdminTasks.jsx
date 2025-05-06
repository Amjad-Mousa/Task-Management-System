import { useEffect, useState, useContext } from "react";
import { DarkModeContext } from "../../Context/DarkModeContext";
import { DashboardLayout } from "../layout";
import AddTaskModal from "../AddTaskModal";

const AdminTasks = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [tasks, setTasks] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "project",
    direction: "asc",
  });
  const [sortBy, setSortBy] = useState("project");
  const [taskToRemove, setTaskToRemove] = useState(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    document.title = "Tasks Management | Task Manager";
  }, []);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const defaultTasks = [
      {
        id: 1,
        project: "Website Redesign",
        taskName: "Design Homepage",
        description: "Create a responsive design for the homepage.",
        assignedStudent: "All Yaseen",
        status: "In Progress",
        dueDate: "4/22/2023",
      },
      {
        id: 2,
        project: "Website Redesign",
        taskName: "Develop API",
        description: "Set up the backend API for the project.",
        assignedStudent: "Braz Aeesh",
        status: "Completed",
        dueDate: "1/16/2023",
      },
      {
        id: 3,
        project: "Mobile App Development",
        taskName: "Create Wireframes",
        description: "Design initial wireframes for the mobile app.",
        assignedStudent: "Ibn Al-Jawzee",
        status: "Not Started",
        dueDate: "5/15/2023",
      },
      {
        id: 4,
        project: "E-commerce Platform",
        taskName: "Database Design",
        description: "Create database schema for the e-commerce platform.",
        assignedStudent: "Ayman Oulom",
        status: "Pending",
        dueDate: "3/30/2023",
      },
    ];

    setTasks([...defaultTasks, ...storedTasks]);
  }, []);

  const getStatusColor = (status) => {
    const normalizedStatus = status.toLowerCase().replace(" ", "");
    const { isDarkMode } = useContext(DarkModeContext);

    switch (normalizedStatus) {
      case "completed":
        return isDarkMode ? "bg-green-900/30 text-green-300" : "bg-green-600"; // Green for Completed
      case "inprogress":
        return isDarkMode
          ? "bg-yellow-900/30 text-yellow-300"
          : "bg-yellow-500"; // Yellow for In Progress
      case "pending":
        return isDarkMode ? "bg-gray-700/30 text-gray-300" : "bg-gray-500"; // Gray for Pending
      case "notstarted":
        return isDarkMode ? "bg-red-900/30 text-red-300" : "bg-red-600"; // Red for Not Started
      default:
        return isDarkMode ? "bg-gray-700/30 text-gray-300" : "bg-gray-500";
    }
  };

  const sortTasks = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    const sortedTasks = [...tasks].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
    setTasks(sortedTasks);
  };

  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
    sortTasks(event.target.value);
  };

  const removeTask = () => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== taskToRemove)
    );
    setTaskToRemove(null);
    setSuccessMessage("Task removed successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleAddTask = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);

    // Also save to localStorage
    const existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    localStorage.setItem("tasks", JSON.stringify([...existingTasks, newTask]));

    setSuccessMessage("Task added successfully!");
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <DashboardLayout
      role="admin"
      title="Tasks Overview"
      successMessage={successMessage}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <label
            htmlFor="sortBy"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Sort By:
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={handleSortByChange}
            className="ml-2 p-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded border border-gray-300 dark:border-gray-600 input-focus-effect cursor-pointer"
          >
            <option value="project">Project</option>
            <option value="taskName">Task</option>
            <option value="assignedStudent">Assigned To</option>
            <option value="status">Status</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 btn-hover-effect tooltip flex items-center gap-2"
          onClick={() => setIsAddTaskModalOpen(true)}
          data-tooltip="Create a new task"
        >
          <span>➕</span>
          <span className="font-medium">Add Task</span>
        </button>
      </div>

      <div
        className={`w-full overflow-x-auto rounded-lg border ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        <table
          className={`min-w-full divide-y ${
            isDarkMode ? "divide-gray-700" : "divide-gray-200"
          }`}
        >
          <thead
            className={
              isDarkMode
                ? "bg-gray-800 text-gray-300"
                : "bg-gray-100 text-gray-700"
            }
          >
            <tr>
              {[
                "Project",
                "Task",
                "Description",
                "Assigned To",
                "Status",
                "Due Date",
                "Actions",
              ].map((header) => (
                <th
                  key={header}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors duration-150 tooltip ${
                    isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                  }`}
                  onClick={() =>
                    sortTasks(header.toLowerCase().replace(" ", ""))
                  }
                  data-tooltip={`Sort by ${header}`}
                >
                  <div className="flex items-center gap-1">
                    {header}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                      />
                    </svg>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody
            className={`divide-y ${
              isDarkMode
                ? "bg-gray-900 divide-gray-700"
                : "bg-white divide-gray-200"
            }`}
          >
            {tasks.map((task) => (
              <tr
                key={task.id}
                className="table-row-hover transition-colors duration-150"
              >
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {task.project}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {task.taskName}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {task.description}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {task.assignedStudent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-block px-3 py-1 text-sm font-semibold rounded-full w-28 text-center ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {task.dueDate}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  <button
                    onClick={() => setTaskToRemove(task.id)}
                    className={`px-3 py-1 rounded tooltip ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-red-300"
                        : "bg-gray-200 hover:bg-gray-300 text-red-600"
                    } btn-hover-effect`}
                    data-tooltip="Remove this task"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirm remove task modal */}
      {taskToRemove && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex justify-center items-center z-50">
          <div
            className={`p-6 rounded-lg shadow-lg text-center ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
          >
            <p className="text-lg">
              Are you sure you want to remove this task?
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={() => setTaskToRemove(null)}
                className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-600 btn-hover-effect font-medium"
              >
                Cancel
              </button>
              <button
                onClick={removeTask}
                className={`px-4 py-2 rounded btn-hover-effect font-medium ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-red-300"
                    : "bg-gray-200 hover:bg-gray-300 text-red-600"
                }`}
              >
                Yes, Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isAddTaskModalOpen}
        onClose={() => setIsAddTaskModalOpen(false)}
        onAddTask={handleAddTask}
      />
    </DashboardLayout>
  );
};

export default AdminTasks;
