/**
 * @file StudentTask.jsx - Student task management component
 * @module components/student/StudentTask
 */

import {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { DashboardLayout } from "../layout";
import { StatusBadge } from "../ui";
import { DarkModeContext } from "../../Context/DarkModeContext";
import { useGraphQL } from "../../Context/GraphQLContext";
import { useAuth } from "../../hooks";
import StatusUpdateModal from "./StatusUpdateModal";
import { FixedSizeList as List } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  getSearchInputClasses,
  SUCCESS_MESSAGE_TIMEOUT,
  formatDate,
} from "../../utils/adminUtils";
import { GET_TASKS_QUERY, UPDATE_TASK_MUTATION } from "../../graphql/queries";

/**
 * Parse and validate a date value of any type
 * @param {any} dateValue - The date value to parse
 * @returns {Date|null} - A valid Date object or null if invalid
 */
const parseDate = (dateValue) => {
  if (!dateValue) return null;

  try {
    let dateObj;

    // Handle different date formats
    if (typeof dateValue === "string") {
      // Check if it's a timestamp in string form
      if (/^\d+$/.test(dateValue)) {
        dateObj = new Date(parseInt(dateValue, 10));
      } else {
        dateObj = new Date(dateValue);
      }
    } else if (typeof dateValue === "number") {
      dateObj = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      dateObj = dateValue;
    } else {
      return null;
    }

    // Check if date is valid
    return isNaN(dateObj.getTime()) ? null : dateObj;
  } catch {
    return null;
  }
};

/**
 * StudentTask component for student task management
 * Displays a virtualized list of tasks assigned to the student
 * Provides functionality to search, sort, and update task status
 *
 * @returns {React.ReactElement} Rendered StudentTask component
 */
const StudentTask = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const { executeQuery } = useGraphQL();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "dueDate",
    direction: "asc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Reference for the virtualized list
  const listRef = useRef(null);

  // Column definitions for the table
  const columns = useMemo(
    () => [
      { display: "Task", key: "title", width: "25%", align: "left" },
      {
        display: "Description",
        key: "description",
        width: "40%",
        align: "left",
      },
      { display: "Status", key: "status", width: "15%", align: "left" },
      { display: "Due Date", key: "dueDate", width: "20%", align: "left" },
    ],
    []
  );

  useEffect(() => {
    document.title = "Student Tasks | Task Manager";
  }, []);

  /**
   * Fetches tasks from API with optimized caching
   * Filters tasks to only include those assigned to the current student
   *
   * @returns {Promise<void>}
   */
  const fetchTasks = useCallback(async () => {
    if (!user || !user.id) {
      console.warn("No user ID available, cannot fetch tasks");
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Use a longer cache expiration (5 minutes) for better performance
      const data = await executeQuery(
        GET_TASKS_QUERY,
        {},
        true,
        true, // Always use cache when available
        5 * 60 * 1000 // 5 minutes cache
      );

      // Set tasks from the GraphQL response
      if (data && data.tasks) {
        // Filter tasks for the current student
        const studentTasks = data.tasks.filter(
          (task) =>
            task.assignedStudent && task.assignedStudent.user_id === user.id
        );

        // Process tasks to ensure dates are properly formatted
        const processedTasks = studentTasks.map((task) => ({
          ...task,
          dueDate: parseDate(task.dueDate),
        }));

        setTasks(processedTasks);
      } else {
        console.warn("No tasks found in response");
        setTasks([]);
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [executeQuery, user]);

  // Fetch tasks when component mounts
  // Using a ref to prevent infinite loops
  const initialFetchDone = useRef(false);
  useEffect(() => {
    if (user && user.id && !initialFetchDone.current) {
      fetchTasks();
      initialFetchDone.current = true;
    }
  }, [fetchTasks, user]);

  /**
   * Sorts tasks based on the selected column
   * Toggles sort direction if the same column is clicked twice
   *
   * @param {string} key - The column key to sort by
   */
  const sortTasks = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedTasks = useMemo(() => {
    // First filter tasks based on search query
    const filteredTasks = tasks.filter((task) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      return (
        (task.title && task.title.toLowerCase().includes(query)) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.status && task.status.toLowerCase().includes(query))
      );
    });

    // Then sort the filtered tasks
    const { key, direction } = sortConfig;
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      if (key === "dueDate") {
        // Handle missing dates
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return direction === "asc" ? 1 : -1;
        if (!b.dueDate) return direction === "asc" ? -1 : 1;

        // Compare dates
        return direction === "asc"
          ? a.dueDate - b.dueDate
          : b.dueDate - a.dueDate;
      } else if (key === "status") {
        const statusOrder = [
          "Not Started",
          "Pending",
          "In Progress",
          "Completed",
        ];
        return direction === "asc"
          ? statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
          : statusOrder.indexOf(b.status) - statusOrder.indexOf(a.status);
      } else if (key === "title") {
        if (!a.title) return direction === "asc" ? -1 : 1;
        if (!b.title) return direction === "asc" ? 1 : -1;
        return direction === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });
    return sortedTasks;
  }, [tasks, searchQuery, sortConfig]);

  /**
   * Handles task click to open status update modal
   *
   * @param {string} taskId - The ID of the clicked task
   */
  const handleTaskClick = useCallback(
    (taskId) => {
      const task = tasks.find((task) => task.id === taskId);
      setSelectedTask(task);
      setIsStatusModalOpen(true);
    },
    [tasks]
  );

  /**
   * Updates task status via GraphQL mutation
   *
   * @param {string} taskId - The ID of the task to update
   * @param {string} newStatus - The new status value
   * @returns {Promise<void>}
   */
  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      // Close the modal first to prevent UI issues
      setIsStatusModalOpen(false);

      // Find the current task to preserve all its properties
      const currentTask = tasks.find((task) => task.id === taskId);
      if (!currentTask) {
        throw new Error("Task not found");
      }

      // Update task status via GraphQL mutation
      // Include all required fields to avoid validation errors
      const response = await executeQuery(
        UPDATE_TASK_MUTATION,
        {
          id: taskId,
          input: {
            title: currentTask.title,
            description: currentTask.description,
            status: newStatus,
            dueDate:
              currentTask.dueDate instanceof Date
                ? currentTask.dueDate.toISOString()
                : currentTask.dueDate,
          },
        },
        true,
        false // Don't use cache for mutations
      );

      if (response && response.updateTask) {
        // Update the task in the local state instead of refetching
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: newStatus } : task
          )
        );

        // Show success message
        setSuccessMessage("Task status updated successfully!");
        setTimeout(() => setSuccessMessage(null), SUCCESS_MESSAGE_TIMEOUT);
      }
    } catch (err) {
      console.error("Error updating task status:", err);
      setError("Failed to update task status. Please try again.");
      setTimeout(() => setError(null), SUCCESS_MESSAGE_TIMEOUT);
    }
  };

  /**
   * Virtualized row component for efficient rendering of task list
   *
   * @param {Object} props - Component props
   * @param {number} props.index - Row index
   * @param {Object} props.style - Style object from react-window
   * @returns {React.ReactElement} Rendered row component
   */
  const Row = useCallback(
    ({ index, style }) => {
      const task = getSortedTasks[index];

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
          onClick={() => handleTaskClick(task.id)}
        >
          <div
            style={{ width: columns[0].width }}
            className={`px-6 py-4 text-sm font-medium truncate text-left ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            {task.title}
          </div>
          <div
            style={{ width: columns[1].width }}
            className={`px-6 py-4 text-sm truncate text-left ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {task.description && task.description.length > 50
              ? `${task.description.substring(0, 50)}...`
              : task.description || "No description"}
          </div>
          <div
            style={{ width: columns[2].width }}
            className="px-6 py-4 flex justify-start"
          >
            <StatusBadge status={task.status} />
          </div>
          <div
            style={{ width: columns[3].width }}
            className={`px-6 py-4 text-sm text-left ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {task.dueDate ? formatDate(task.dueDate) : "Not set"}
          </div>
        </div>
      );
    },
    [isDarkMode, getSortedTasks, columns, handleTaskClick]
  );

  return (
    <DashboardLayout
      role="student"
      title="Your Tasks"
      successMessage={successMessage}
      errorMessage={error}
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-96">
            <input
              type="text"
              placeholder="Search by task title, description, or status..."
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
            Click on a task to update its status
          </p>
        </div>
      </div>

      {/* Tasks Table with Virtualization */}
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
            {getSortedTasks.length === 0 ? (
              <div
                className={`px-6 py-8 text-center text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {searchQuery.trim()
                  ? `No tasks found matching "${searchQuery}"`
                  : "No tasks available."}
              </div>
            ) : (
              <AutoSizer>
                {({ height, width }) => (
                  <List
                    key={`task-list-${getSortedTasks.length}`} // Force re-render when tasks change
                    ref={listRef}
                    height={height}
                    width={width}
                    itemCount={getSortedTasks.length}
                    itemSize={64} // Height of each row
                    overscanCount={5} // Number of items to render outside of the visible area
                  >
                    {Row}
                  </List>
                )}
              </AutoSizer>
            )}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        task={selectedTask}
        onUpdateStatus={handleUpdateStatus}
      />
    </DashboardLayout>
  );
};

export default StudentTask;
