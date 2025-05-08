import { useEffect, useState, useContext } from "react";
import { DarkModeContext } from "../../Context/DarkModeContext";
import { DashboardLayout } from "../layout";
import AddTaskModal from "../AddTaskModal";
import {
  getStatusColor,
  sortItems,
  getSearchInputClasses,
  SUCCESS_MESSAGE_TIMEOUT,
} from "../../utils/adminUtils";

const AdminTasks = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [tasks, setTasks] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "project",
    direction: "asc",
  });
  const [searchQuery, setSearchQuery] = useState("");
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

  // Using the shared utility function for status colors

  const sortTasks = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });

    // Use the shared utility function for sorting
    const sortedTasks = sortItems(tasks, { key, direction });
    setTasks(sortedTasks);
  };

  const removeTask = () => {
    setTasks((prevTasks) =>
      prevTasks.filter((task) => task.id !== taskToRemove)
    );
    setTaskToRemove(null);
    setSuccessMessage("Task removed successfully!");
    setTimeout(() => setSuccessMessage(null), SUCCESS_MESSAGE_TIMEOUT);
  };

  const handleAddTask = (newTask) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);

    // Also save to localStorage
    const existingTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    localStorage.setItem("tasks", JSON.stringify([...existingTasks, newTask]));

    setSuccessMessage("Task added successfully!");
    setTimeout(() => setSuccessMessage(null), SUCCESS_MESSAGE_TIMEOUT);
  };

  return (
    <DashboardLayout
      role="admin"
      title="Tasks Overview"
      successMessage={successMessage}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="Search by task, project, or assigned student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={getSearchInputClasses(isDarkMode)}
            />
          </div>

          <p
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <span className="mr-1">💡</span>
            Click on table headers to sort tasks
          </p>
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
                { display: "Project", key: "project" },
                { display: "Task", key: "taskName" },
                { display: "Description", key: "description" },
                { display: "Assigned To", key: "assignedStudent" },
                { display: "Status", key: "status" },
                { display: "Due Date", key: "dueDate" },
                { display: "Actions", key: null },
              ].map((header) => (
                <th
                  key={header.display}
                  className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                    header.key ? "cursor-pointer" : ""
                  } transition-colors duration-150 tooltip ${
                    isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                  }`}
                  onClick={() => header.key && sortTasks(header.key)}
                  data-tooltip={header.key ? `Sort by ${header.display}` : ""}
                >
                  <div className="flex items-center gap-1">
                    {header.display}
                    {header.key && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-4 w-4 ${
                          sortConfig.key === header.key
                            ? "opacity-100"
                            : "opacity-50"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d={
                            sortConfig.key === header.key &&
                            sortConfig.direction === "desc"
                              ? "M7 16V4m0 0L3 8m4-4l4 4"
                              : sortConfig.key === header.key &&
                                sortConfig.direction === "asc"
                              ? "M7 4v12m0 0l4-4m-4 4l-4-4"
                              : "M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                          }
                        />
                      </svg>
                    )}
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
            {(() => {
              const filteredTasks = tasks.filter((task) => {
                if (!searchQuery.trim()) return true;

                const query = searchQuery.toLowerCase().trim();
                return (
                  (task.project &&
                    task.project.toLowerCase().includes(query)) ||
                  (task.taskName &&
                    task.taskName.toLowerCase().includes(query)) ||
                  (task.assignedStudent &&
                    task.assignedStudent.toLowerCase().includes(query))
                );
              });

              if (filteredTasks.length === 0) {
                return (
                  <tr>
                    <td
                      colSpan="7"
                      className={`px-6 py-8 text-center text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      No tasks found matching "{searchQuery}"
                    </td>
                  </tr>
                );
              }

              return filteredTasks.map((task) => (
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
                        task.status,
                        isDarkMode
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
              ));
            })()}
          </tbody>
        </table>
      </div>

      {/* Confirm remove task modal */}
      {taskToRemove && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg w-full max-w-md ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
          >
            <h2 className="text-xl font-bold mb-4 text-red-500">
              Confirm Deletion
            </h2>
            <p
              className={`mb-6 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to delete this task?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setTaskToRemove(null)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={removeTask}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-red-300"
                    : "bg-gray-200 hover:bg-gray-300 text-red-600"
                }`}
              >
                Confirm Delete
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
