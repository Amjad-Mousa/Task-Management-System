import { useEffect, useState, useContext, useRef, useCallback } from "react";
import { DarkModeContext } from "../../Context/DarkModeContext";
import { DashboardLayout } from "../layout";
import TaskFormModal from "../TaskFormModal";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import { StatusBadge } from "../ui";
import {
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
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Reference for the virtualized list
  const listRef = useRef(null);

  // Column definitions for the table
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const columns = [
    { display: "Project", key: "project", width: "15%", align: "left" },
    { display: "Task", key: "taskName", width: "15%", align: "left" },
    { display: "Description", key: "description", width: "25%", align: "left" },
    {
      display: "Assigned To",
      key: "assignedStudent",
      width: "15%",
      align: "left",
    },
    { display: "Status", key: "status", width: "10%", align: "left" },
    { display: "Due Date", key: "dueDate", width: "10%", align: "left" },
    { display: "Actions", key: null, width: "10%", align: "left" },
  ];

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
        dueDate: "2023-04-22",
      },
      {
        id: 2,
        project: "Website Redesign",
        taskName: "Develop API",
        description: "Set up the backend API for the project.",
        assignedStudent: "Braz Aeesh",
        status: "Completed",
        dueDate: "2023-01-16",
      },
      {
        id: 3,
        project: "Mobile App Development",
        taskName: "Create Wireframes",
        description: "Design initial wireframes for the mobile app.",
        assignedStudent: "Ibn Al-Jawzee",
        status: "Not Started",
        dueDate: "2023-05-15",
      },
      {
        id: 4,
        project: "E-commerce Platform",
        taskName: "Database Design",
        description: "Create database schema for the e-commerce platform.",
        assignedStudent: "Ayman Oulom",
        status: "Pending",
        dueDate: "2023-03-30",
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

  const handleTaskSubmit = (taskData) => {
    let updatedTasks;
    let successMsg;

    if (taskToEdit) {
      // Update existing task
      updatedTasks = tasks.map((task) =>
        task.id === taskData.id ? taskData : task
      );
      successMsg = "Task updated successfully!";
    } else {
      // Add new task
      updatedTasks = [...tasks, taskData];
      successMsg = "Task added successfully!";
    }

    setTasks(updatedTasks);

    // Save to localStorage
    localStorage.setItem("tasks", JSON.stringify(updatedTasks));

    setSuccessMessage(successMsg);
    setIsTaskModalOpen(false);
    setTaskToEdit(null);
    setTimeout(() => setSuccessMessage(null), SUCCESS_MESSAGE_TIMEOUT);
  };

  // Get filtered tasks based on search query
  const getFilteredTasks = useCallback(() => {
    return tasks.filter((task) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      return (
        (task.project && task.project.toLowerCase().includes(query)) ||
        (task.taskName && task.taskName.toLowerCase().includes(query)) ||
        (task.assignedStudent &&
          task.assignedStudent.toLowerCase().includes(query))
      );
    });
  }, [tasks, searchQuery]);

  // Virtualized row component
  const Row = useCallback(
    ({ index, style }) => {
      const filteredTasks = getFilteredTasks();
      const task = filteredTasks[index];

      return (
        <div
          style={{
            ...style,
            display: "flex",
            alignItems: "center",
            width: "100%",
          }}
          className={`border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          } table-row-hover transition-colors duration-200 cursor-pointer ${
            index % 2 === 0
              ? isDarkMode
                ? "bg-gray-900"
                : "bg-white"
              : isDarkMode
              ? "bg-gray-800"
              : "bg-gray-50"
          }`}
          onClick={() => {
            setTaskToEdit(task);
            setIsTaskModalOpen(true);
          }}
        >
          <div
            style={{ width: columns[0].width }}
            className={`px-6 py-4 text-sm font-medium truncate text-${
              columns[0].align
            } ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            {task.project}
          </div>
          <div
            style={{ width: columns[1].width }}
            className={`px-6 py-4 text-sm truncate text-${columns[1].align} ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {task.taskName}
          </div>
          <div
            style={{ width: columns[2].width }}
            className={`px-6 py-4 text-sm truncate text-${columns[2].align} ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {task.description}
          </div>
          <div
            style={{ width: columns[3].width }}
            className={`px-6 py-4 text-sm truncate text-${columns[3].align} ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {task.assignedStudent}
          </div>
          <div
            style={{ width: columns[4].width }}
            className={`px-6 py-4 flex justify-${columns[4].align}`}
          >
            <StatusBadge status={task.status} />
          </div>
          <div
            style={{ width: columns[5].width }}
            className={`px-6 py-4 text-sm text-${columns[5].align} ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
          <div
            style={{ width: columns[6].width }}
            className={`px-6 py-4 text-sm flex justify-start`}
            onClick={(e) => e.stopPropagation()} // Prevent row click when clicking the button
          >
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent row click
                setTaskToRemove(task.id);
              }}
              className={`px-3 py-1 rounded tooltip ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-red-300/80"
                  : "bg-gray-200 hover:bg-gray-300 text-red-500/80"
              } btn-hover-effect`}
              data-tooltip="Remove this task"
            >
              Remove
            </button>
          </div>
        </div>
      );
    },
    [isDarkMode, getFilteredTasks, columns]
  );

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
            Click on a task to update it
          </p>
        </div>

        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 btn-hover-effect tooltip flex items-center gap-2"
          onClick={() => {
            setTaskToEdit(null); // Ensure we're in "add" mode
            setIsTaskModalOpen(true);
          }}
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
        {/* Table Header */}
        <div
          className={`flex ${
            isDarkMode
              ? "bg-gray-800 text-gray-300"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {columns.map((header) => (
            <div
              key={header.display}
              style={{ width: header.width }}
              className={`px-6 py-3 text-${
                header.align
              } text-xs font-medium uppercase tracking-wider ${
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
            </div>
          ))}
        </div>

        {/* Virtualized Table Body */}
        <div style={{ height: "calc(100vh - 280px)" }}>
          {(() => {
            const filteredTasks = getFilteredTasks();

            if (filteredTasks.length === 0) {
              return (
                <div
                  className={`px-6 py-8 text-center text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {searchQuery.trim()
                    ? `No tasks found matching "${searchQuery}"`
                    : "No tasks available."}
                </div>
              );
            }

            return (
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    ref={listRef}
                    height={height}
                    width={width}
                    itemCount={filteredTasks.length}
                    itemSize={64} // Height of each row
                    overscanCount={5} // Number of items to render outside of the visible area
                  >
                    {Row}
                  </List>
                )}
              </AutoSizer>
            );
          })()}
        </div>
      </div>

      {/* Confirm remove task modal */}
      {taskToRemove && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg w-full max-w-md ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
          >
            <h2
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
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
                    ? "bg-gray-700 hover:bg-gray-600 text-red-300/80"
                    : "bg-gray-200 hover:bg-gray-300 text-red-500/80"
                }`}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task Form Modal (Add/Edit) */}
      <TaskFormModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSubmit={handleTaskSubmit}
        task={taskToEdit}
      />
    </DashboardLayout>
  );
};

export default AdminTasks;
