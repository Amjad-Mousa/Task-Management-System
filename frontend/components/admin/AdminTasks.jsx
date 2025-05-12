import {
  useEffect,
  useState,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { DarkModeContext } from "../../Context/DarkModeContext";
import { useGraphQL } from "../../Context/GraphQLContext";
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
  GET_PROJECTS_QUERY,
} from "../../graphql/queries";

const AdminTasks = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const { executeQuery } = useGraphQL();

  const [tasks, setTasks] = useState([]);
  const [projectsMap, setProjectsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "dueDate",
    direction: "asc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [taskToRemove, setTaskToRemove] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Format date for display, handling various date formats including timestamps
  const formatDate = useCallback((dateValue) => {
    if (!dateValue) return "Not set";

    try {
      let dateObj;

      // Handle timestamp as string
      if (typeof dateValue === "string" && /^\d+$/.test(dateValue)) {
        dateObj = new Date(parseInt(dateValue, 10));
      }
      // Handle timestamp as number
      else if (typeof dateValue === "number") {
        dateObj = new Date(dateValue);
      }
      // Handle date string
      else {
        dateObj = new Date(dateValue);
      }

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return "Invalid date";
      }

      // Format date as locale string
      return dateObj.toLocaleDateString();
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Invalid date";
    }
  }, []);

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

  // Fetch tasks from API with enhanced caching
  const fetchTasks = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);

        // Use a shorter cache expiration for tasks (2 minutes)
        const TASKS_CACHE_EXPIRATION = 2 * 60 * 1000;

        const data = await executeQuery(
          GET_TASKS_QUERY,
          {},
          true,
          !forceRefresh, // Use cache unless force refresh is requested
          TASKS_CACHE_EXPIRATION // Custom cache expiration time
        );

        // Set tasks from the GraphQL response
        if (data && data.tasks) {
          setTasks(data.tasks);
          console.log(
            `Loaded ${data.tasks.length} tasks ${
              forceRefresh ? "from server" : "with cache"
            }`
          );
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
    },
    [executeQuery]
  );

  // Fetch projects from API with enhanced caching
  const fetchProjects = useCallback(
    async (forceRefresh = false) => {
      try {
        // Use a longer cache expiration for projects (10 minutes)
        const PROJECTS_CACHE_EXPIRATION = 10 * 60 * 1000;

        const data = await executeQuery(
          GET_PROJECTS_QUERY,
          {},
          true,
          !forceRefresh, // Use cache unless force refresh is requested
          PROJECTS_CACHE_EXPIRATION // Custom cache expiration time
        );

        // Set projects from the GraphQL response
        if (data && data.projects) {
          // Create a map of project IDs to project objects for quick lookup
          const projectMap = {};
          data.projects.forEach((project) => {
            projectMap[project.id] = project;
          });
          setProjectsMap(projectMap);
          console.log(
            `Loaded ${data.projects.length} projects ${
              forceRefresh ? "from server" : "with cache"
            }`
          );
        } else {
          console.warn("No projects found in response");
          setProjectsMap({});
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        // Don't set error state here to avoid overriding task errors
      }
    },
    [executeQuery]
  );

  // Fetch both tasks and projects when component mounts
  useEffect(() => {
    const fetchData = async () => {
      await fetchTasks();
      await fetchProjects();
    };

    fetchData();
  }, [fetchTasks, fetchProjects]);

  // Sort tasks based on the selected column
  const sortTasks = useCallback(
    (key) => {
      let direction = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }
      setSortConfig({ key, direction });
    },
    [sortConfig]
  );

  // Note: We use getFilteredAndSortedTasks for both filtering and sorting

  // Remove a task
  const removeTask = async () => {
    try {
      // Show a loading state in the modal
      setIsDeleting(true);

      const response = await executeQuery(
        DELETE_TASK_MUTATION,
        { id: taskToRemove },
        true,
        false // Don't use cache for mutations
      );

      if (!response || !response.deleteTask) {
        throw new Error("Failed to delete task");
      }

      // Refresh data from server to ensure UI is in sync
      await fetchTasks(true);

      // Also refresh projects in case any relationships have changed
      await fetchProjects(true);

      // Show success message
      setSuccessMessage("Task removed successfully!");

      // Auto-close the modal after a short delay
      setTimeout(() => {
        setTaskToRemove(null);
        setIsDeleting(false);
      }, 500);

      // Clear the success message after a longer delay
      setTimeout(() => setSuccessMessage(null), SUCCESS_MESSAGE_TIMEOUT);
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task. Please try again.");
      setTimeout(() => setError(null), SUCCESS_MESSAGE_TIMEOUT);
      setIsDeleting(false); // Make sure to reset deleting state on error
    }
  };

  // Handle task form submission (create or update)
  const handleTaskSubmit = async (taskData) => {
    try {
      let response;
      let successMsg;

      if (taskToEdit) {
        // Update existing task
        response = await executeQuery(
          UPDATE_TASK_MUTATION,
          {
            id: taskData.id,
            input: taskData.input,
          },
          true,
          false // Don't use cache for mutations
        );

        successMsg = "Task updated successfully!";
      } else {
        // Add new task
        response = await executeQuery(
          CREATE_TASK_MUTATION,
          { input: taskData.input },
          true,
          false // Don't use cache for mutations
        );

        successMsg = "Task added successfully!";
      }

      // Refresh data after successful operation - force refresh from server
      await fetchTasks(true);
      await fetchProjects(true);

      // Only close the modal and show success message if we get here (no errors)
      setSuccessMessage(successMsg);
      setIsTaskModalOpen(false);
      setTaskToEdit(null);
      setTimeout(() => setSuccessMessage(null), SUCCESS_MESSAGE_TIMEOUT);

      return response; // Return the response so the modal can handle it
    } catch (err) {
      console.error("Error saving task:", err);

      // Don't close the modal or show a general error message
      // Instead, throw the error so the modal can handle it
      throw err;
    }
  };

  // Get filtered and sorted tasks based on search query and sort config
  const getFilteredAndSortedTasks = useMemo(() => {
    // First filter tasks based on search query
    const filteredTasks = tasks.filter((task) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();

      // Get project name from projectsMap using the assignedProject ID
      const projectName =
        task.assignedProject && projectsMap && projectsMap[task.assignedProject]
          ? projectsMap[task.assignedProject].projectName
          : "";

      return (
        (projectName && projectName.toLowerCase().includes(query)) ||
        (task.title && task.title.toLowerCase().includes(query)) ||
        (task.description && task.description.toLowerCase().includes(query)) ||
        (task.assignedStudent?.user?.name &&
          task.assignedStudent.user.name.toLowerCase().includes(query)) ||
        (task.assignedAdmin?.user?.name &&
          task.assignedAdmin.user.name.toLowerCase().includes(query)) ||
        (task.status && task.status.toLowerCase().includes(query))
      );
    });

    // Then sort the filtered tasks
    return sortItems([...filteredTasks], sortConfig);
  }, [tasks, searchQuery, projectsMap, sortConfig]);

  // Virtualized row component with improved performance
  const Row = useCallback(
    ({ index, style }) => {
      const task = getFilteredAndSortedTasks[index];

      // Get project name from map
      const projectName =
        task.assignedProject && projectsMap[task.assignedProject]
          ? projectsMap[task.assignedProject].projectName
          : "Unassigned";

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
          {/* Project column */}
          <div
            style={{ width: columns[0].width }}
            className={`px-6 py-4 text-sm font-medium truncate text-${
              columns[0].align
            } ${isDarkMode ? "text-white" : "text-gray-900"}`}
            title={projectName}
          >
            {projectName}
          </div>

          {/* Task title column */}
          <div
            style={{ width: columns[1].width }}
            className={`px-6 py-4 text-sm truncate text-${columns[1].align} ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
            title={task.title}
          >
            {task.title}
          </div>

          {/* Description column */}
          <div
            style={{ width: columns[2].width }}
            className={`px-6 py-4 text-sm truncate text-${columns[2].align} ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
            title={task.description}
          >
            {task.description}
          </div>

          {/* Assigned student column */}
          <div
            style={{ width: columns[3].width }}
            className={`px-6 py-4 text-sm truncate text-${columns[3].align} ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
            title={task.assignedStudent?.user?.name || "Unassigned"}
          >
            {task.assignedStudent?.user?.name || "Unassigned"}
          </div>

          {/* Status column */}
          <div
            style={{ width: columns[4].width }}
            className={`px-6 py-4 flex justify-${columns[4].align}`}
          >
            <StatusBadge status={task.status} />
          </div>

          {/* Due date column */}
          <div
            style={{ width: columns[5].width }}
            className={`px-6 py-4 text-sm text-${columns[5].align} ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {task.dueDate ? formatDate(task.dueDate) : "No date"}
          </div>

          {/* Actions column */}
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
              aria-label="Delete task"
            >
              🗑️
            </button>
          </div>
        </div>
      );
    },
    [columns, getFilteredAndSortedTasks, isDarkMode, formatDate, projectsMap]
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
              placeholder="Search by task, project, assigned student, or admin..."
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
              if (getFilteredAndSortedTasks.length === 0) {
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
                      key={`task-list-${getFilteredAndSortedTasks.length}`} // Force re-render when tasks change
                      ref={listRef}
                      height={height}
                      width={width}
                      itemCount={getFilteredAndSortedTasks.length}
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
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-red-300/80"
                    : "bg-red-100 hover:bg-red-200 text-red-700 border border-red-200"
                } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
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
