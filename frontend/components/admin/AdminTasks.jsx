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
import {
  GET_TASKS_QUERY,
  CREATE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
} from "../../graphql/queries";
import { executeGraphQL } from "../../utils/graphqlClient";

const AdminTasks = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
    { display: "Project", key: "assignedProject", width: "15%", align: "left" },
    { display: "Task", key: "title", width: "15%", align: "left" },
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

  // Fetch tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const data = await executeGraphQL(GET_TASKS_QUERY);

      // Set tasks from the GraphQL response
      if (data && data.tasks) {
        setTasks(data.tasks);
      } else {
        console.warn("No tasks found in response:", data);
        setTasks([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

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

  const removeTask = async () => {
    try {
      const response = await executeGraphQL(DELETE_TASK_MUTATION, {
        id: taskToRemove,
      });

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== taskToRemove)
      );

      setTaskToRemove(null);
      setSuccessMessage("Task removed successfully!");
      setTimeout(() => setSuccessMessage(null), SUCCESS_MESSAGE_TIMEOUT);
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task. Please try again.");
      setTimeout(() => setError(null), SUCCESS_MESSAGE_TIMEOUT);
    }
  };

  const handleTaskSubmit = async (taskData) => {
    try {
      let response;
      let successMsg;

      if (taskToEdit) {
        // Update existing task - taskData already has the correct format from TaskFormModal
        response = await executeGraphQL(UPDATE_TASK_MUTATION, {
          id: taskData.id,
          input: taskData.input,
        });

        successMsg = "Task updated successfully!";
      } else {
        // Add new task - taskData already has the correct format from TaskFormModal
        response = await executeGraphQL(CREATE_TASK_MUTATION, {
          input: taskData.input,
        });

        successMsg = "Task added successfully!";
      }

      if (response.errors) {
        throw new Error(response.errors[0].message);
      }

      // Refresh tasks after successful operation
      await fetchTasks();

      setSuccessMessage(successMsg);
      setIsTaskModalOpen(false);
      setTaskToEdit(null);
      setTimeout(() => setSuccessMessage(null), SUCCESS_MESSAGE_TIMEOUT);
    } catch (err) {
      console.error("Error saving task:", err);
      setError("Failed to save task. Please try again.");
      setTimeout(() => setError(null), SUCCESS_MESSAGE_TIMEOUT);
    }
  };

  // Get filtered tasks based on search query
  const getFilteredTasks = useCallback(() => {
    return tasks.filter((task) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      return (
        (task.assignedProject?.title &&
          task.assignedProject.title.toLowerCase().includes(query)) ||
        (task.title && task.title.toLowerCase().includes(query)) ||
        (task.assignedStudent?.user?.name &&
          task.assignedStudent.user.name.toLowerCase().includes(query))
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
            {task.assignedProject?.title || "Unassigned"}
          </div>
          <div
            style={{ width: columns[1].width }}
            className={`px-6 py-4 text-sm truncate text-${columns[1].align} ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {task.title}
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
            {task.assignedStudent?.user?.name || "Unassigned"}
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
            {task.dueDate
              ? new Date(task.dueDate).toLocaleDateString()
              : "No date"}
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
                  : "bg-red-100 hover:bg-red-200 text-red-700 border border-red-200"
              }`}
              data-tooltip="Delete task"
            >
              🗑️
            </button>
          </div>
        </div>
      );
    },
    [columns, getFilteredTasks, isDarkMode]
  );

  return (
    <DashboardLayout
      role="admin"
      title="Tasks Overview"
      successMessage={successMessage}
      errorMessage={error}
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
        className={`rounded-lg overflow-hidden border ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}
      >
        {/* Table Header */}
        <div
          className={`flex items-center border-b ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-gray-50 border-gray-200"
          }`}
        >
          {columns.map((column) => (
            <div
              key={column.key || "actions"}
              style={{ width: column.width }}
              className={`px-6 py-3 text-left text-xs font-medium ${
                isDarkMode ? "text-gray-300" : "text-gray-500"
              } uppercase tracking-wider cursor-pointer ${
                isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
              } transition-colors duration-200`}
              onClick={() => column.key && sortTasks(column.key)}
            >
              <div className="flex items-center">
                {column.display}
                {column.key && sortConfig.key === column.key && (
                  <span className="ml-1">
                    {sortConfig.direction === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div
            className={`px-6 py-8 text-center ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Loading tasks...
          </div>
        )}

        {/* Error State */}
        {!loading && error && !successMessage && (
          <div className={`px-6 py-8 text-center text-red-500`}>{error}</div>
        )}

        {/* Virtualized Table Body */}
        {!loading && !error && (
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
        )}
      </div>

      {/* Confirmation Dialog */}
      {taskToRemove && (
        <div
          className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50`}
        >
          <div
            className={`rounded-lg p-6 max-w-sm w-full ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <h3
              className={`text-lg font-medium mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Confirm Deletion
            </h3>
            <p
              className={`mb-6 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setTaskToRemove(null)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-300"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={removeTask}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-red-300/80"
                    : "bg-red-100 hover:bg-red-200 text-red-700 border border-red-200"
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
