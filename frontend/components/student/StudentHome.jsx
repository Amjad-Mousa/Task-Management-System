import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { DashboardLayout } from "../layout";
import { Card, StatusBadge } from "../ui";
import { StatCard } from "../shared";
import { DarkModeContext } from "../../Context/DarkModeContext";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/adminUtils";
import { useGraphQL } from "../../Context/GraphQLContext";
import { useAuth } from "../../hooks";
import { GET_TASKS_QUERY, GET_PROJECTS_QUERY } from "../../graphql/queries";

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
 * StudentHome component for student dashboard
 */
const StudentHome = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const { executeQuery } = useGraphQL();
  const { user } = useAuth();
  const userId = user?.id;

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedStat, setSelectedStat] = useState(null);
  const [taskFilter, setTaskFilter] = useState("all");
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    document.title = "Student Dashboard | Task Manager";
  }, []);

  // Cache expiration time (2 minutes)
  const CACHE_EXPIRATION = 2 * 60 * 1000;

  // Fetch tasks with caching
  const fetchTasks = useCallback(
    async (forceRefresh = false) => {
      if (!userId) return [];

      try {
        // Use caching unless force refresh is requested
        const taskData = await executeQuery(
          GET_TASKS_QUERY,
          {},
          true,
          !forceRefresh,
          CACHE_EXPIRATION
        );

        if (taskData && taskData.tasks) {
          // Filter tasks for the current student - do this client-side for better caching
          const studentTasks = taskData.tasks.filter(
            (task) =>
              task.assignedStudent && task.assignedStudent.user_id === userId
          );

          // Transform tasks to match the expected format - use a more efficient approach
          return studentTasks.map((task) => {
            // Parse and validate the due date
            const formattedDueDate = parseDate(task.dueDate);

            // Return only the fields we need to reduce memory usage
            return {
              id: task.id,
              title: task.title,
              status: task.status,
              dueDate: formattedDueDate,
              project: task.assignedProject || "Unassigned",
              description: task.description,
            };
          });
        }
        return [];
      } catch (err) {
        console.error("Error fetching student tasks:", err);
        return [];
      }
    },
    [executeQuery, userId, CACHE_EXPIRATION]
  );

  // Fetch projects with caching
  const fetchProjects = useCallback(
    async (forceRefresh = false) => {
      if (!userId) return [];

      try {
        // Use caching unless force refresh is requested
        const projectData = await executeQuery(
          GET_PROJECTS_QUERY,
          {},
          true,
          !forceRefresh,
          CACHE_EXPIRATION
        );

        if (projectData && projectData.projects) {
          // Filter projects for the current student - do this client-side for better caching
          return projectData.projects.filter(
            (project) =>
              project.studentsWorkingOn &&
              project.studentsWorkingOn.some(
                (student) => student.user && student.user.id === userId
              )
          );
        }
        return [];
      } catch (err) {
        console.error("Error fetching student projects:", err);
        return [];
      }
    },
    [executeQuery, userId, CACHE_EXPIRATION]
  );

  // Load student data with refresh capability
  const loadData = useCallback(
    async (forceRefresh = false) => {
      if (!userId) return;

      setIsLoading(true);
      setErrorMessage(null);

      try {
        // Use Promise.all for parallel fetching
        const [fetchedTasks, fetchedProjects] = await Promise.all([
          fetchTasks(forceRefresh),
          fetchProjects(forceRefresh),
        ]);

        setTasks(fetchedTasks);
        setProjects(fetchedProjects);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setErrorMessage(
          "Failed to load dashboard data. Please try again later."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [fetchTasks, fetchProjects, userId]
  );

  // Initial data load
  useEffect(() => {
    loadData(false); // Use cached data if available on initial load
  }, [loadData]);

  // Helper function to check if a task has an upcoming deadline
  const isUpcomingDeadline = useCallback((task) => {
    if (!task.dueDate || task.status === "Completed") {
      return false;
    }

    // Get today's date and reset time to midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Parse the due date
    const dueDate = parseDate(task.dueDate);

    // If date is invalid, return false
    if (!dueDate) {
      return false;
    }

    // Reset time to midnight
    dueDate.setHours(0, 0, 0, 0);

    // Calculate the difference in days
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round((dueDate - today) / oneDay);

    // Include tasks due within the next 7 days
    return diffDays >= 0 && diffDays <= 7;
  }, []);

  // Memoize filtered task arrays for better performance
  const upcomingDeadlineTasks = useMemo(
    () => tasks.filter(isUpcomingDeadline),
    [tasks, isUpcomingDeadline]
  );

  const tasksInProgress = useMemo(
    () => tasks.filter((task) => task.status === "In Progress"),
    [tasks]
  );

  const completedProjects = useMemo(
    () => projects.filter((project) => project.status === "Completed"),
    [projects]
  );

  // Calculate dashboard statistics - optimized with memoization
  const stats = useMemo(
    () => ({
      projectsCount: projects.length,
      tasksInProgressCount: tasksInProgress.length,
      finishedProjectsCount: completedProjects.length,
      upcomingDeadlines: upcomingDeadlineTasks.length,
      // Store the filtered tasks for reuse
      _upcomingDeadlineTasks: upcomingDeadlineTasks,
      _tasksInProgress: tasksInProgress,
    }),
    [
      projects.length,
      completedProjects.length,
      upcomingDeadlineTasks,
      tasksInProgress,
    ]
  );

  // Memoize completed tasks
  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === "Completed"),
    [tasks]
  );

  // Memoize pending tasks
  const pendingTasks = useMemo(
    () => tasks.filter((task) => task.status === "Pending"),
    [tasks]
  );

  // Memoize not started tasks
  const notStartedTasks = useMemo(
    () => tasks.filter((task) => task.status === "Not Started"),
    [tasks]
  );

  // Calculate task status counts - reuse memoized arrays
  const taskStatusCounts = useMemo(
    () => ({
      "Not Started": notStartedTasks.length,
      "In Progress": tasksInProgress.length,
      Pending: pendingTasks.length,
      Completed: completedTasks.length,
    }),
    [
      notStartedTasks.length,
      tasksInProgress.length,
      pendingTasks.length,
      completedTasks.length,
    ]
  );

  // Helper function to compare dates for sorting
  const compareDates = useCallback((a, b) => {
    // Handle cases where dueDate might be missing or invalid
    if (!a.dueDate) return 1; // Push items without due dates to the end
    if (!b.dueDate) return -1;

    // Parse dates using our utility function
    const dateA = parseDate(a.dueDate);
    const dateB = parseDate(b.dueDate);

    // Check if dates are valid
    if (!dateA) return 1;
    if (!dateB) return -1;

    // Sort by date (ascending - closest deadline first)
    return dateA - dateB;
  }, []);

  // Get filtered tasks based on selected filter - optimized with memoization
  const getFilteredTasks = useMemo(() => {
    let filteredTasks;

    if (taskFilter === "all") {
      filteredTasks = tasks;
    } else if (taskFilter === "upcoming") {
      // Reuse the pre-calculated upcoming deadline tasks from stats
      filteredTasks = stats._upcomingDeadlineTasks;
    } else if (taskFilter === "In Progress") {
      // Reuse the pre-calculated tasks in progress from stats
      filteredTasks = stats._tasksInProgress;
    } else {
      filteredTasks = tasks.filter((task) => task.status === taskFilter);
    }

    // Sort by due date (closest deadline first)
    const sortedTasks = [...filteredTasks].sort(compareDates);

    // Return only the first 5 tasks
    return sortedTasks.slice(0, 5);
  }, [
    tasks,
    taskFilter,
    stats._upcomingDeadlineTasks,
    stats._tasksInProgress,
    compareDates,
  ]);

  // This function is no longer needed as we're using real project data from the API

  // Task click functionality removed as requested

  // Handle stat card click
  const handleStatCardClick = (statTitle) => {
    if (selectedStat === statTitle) {
      setSelectedStat(null);
      setShowProjectsModal(false);
    } else {
      setSelectedStat(statTitle);

      // Set appropriate task filter based on selected stat
      if (statTitle === "Number of Projects") {
        setShowProjectsModal(true);
      } else if (statTitle === "Tasks In Progress") {
        setTaskFilter("In Progress");
        setShowProjectsModal(false);
      } else if (statTitle === "Completed Tasks") {
        setTaskFilter("Completed");
        setShowProjectsModal(false);
      } else if (statTitle === "Upcoming Deadlines") {
        setTaskFilter("upcoming");
        setShowProjectsModal(false);
      }
    }
  };

  // Show loading state
  if (isLoading && tasks.length === 0 && projects.length === 0) {
    return (
      <DashboardLayout role="student" showWelcomeMessage={true}>
        <div className="flex justify-center items-center h-64">
          <div
            className={`text-lg ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Loading dashboard...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="student"
      showWelcomeMessage={true}
      errorMessage={errorMessage}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Number of Projects"
          value={stats.projectsCount}
          icon="project"
          color="blue"
          onClick={() => handleStatCardClick("Number of Projects")}
          isSelected={selectedStat === "Number of Projects"}
          isDarkMode={isDarkMode}
        />
        <StatCard
          title="Tasks In Progress"
          value={stats.tasksInProgressCount}
          icon="progress"
          color="yellow"
          onClick={() => handleStatCardClick("Tasks In Progress")}
          isSelected={selectedStat === "Tasks In Progress"}
          isDarkMode={isDarkMode}
        />
        <StatCard
          title="Completed Tasks"
          value={taskStatusCounts.Completed}
          icon="completed"
          color="purple"
          onClick={() => handleStatCardClick("Completed Tasks")}
          isSelected={selectedStat === "Completed Tasks"}
          isDarkMode={isDarkMode}
        />
        <StatCard
          title="Upcoming Deadlines"
          value={stats.upcomingDeadlines}
          icon="deadline"
          color="red"
          onClick={() => handleStatCardClick("Upcoming Deadlines")}
          isSelected={selectedStat === "Upcoming Deadlines"}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Task List */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-xl font-semibold ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {selectedStat
              ? selectedStat === "Number of Projects"
                ? "Your Projects"
                : selectedStat === "Upcoming Deadlines"
                ? "Upcoming Deadlines"
                : selectedStat === "Completed Tasks"
                ? "Completed Tasks"
                : selectedStat === "Tasks In Progress"
                ? "Tasks In Progress"
                : "Your Tasks"
              : "Recent Tasks"}
          </h2>
          <Link
            to="/student-task"
            className={`text-sm ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            } hover:underline`}
          >
            View All
          </Link>
        </div>

        {showProjectsModal ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.length > 0 ? (
              projects.map((project) => (
                <Card
                  key={project.id}
                  className={`p-4 ${
                    isDarkMode
                      ? "bg-gray-800 hover:bg-gray-750"
                      : "bg-white hover:bg-gray-50"
                  } transition-colors duration-200 cursor-pointer card-hover-effect`}
                  onClick={() => {
                    // Handle card click - you can add any effect or state change here
                    // For example, set a selected project state
                    setSelectedProject(project);
                  }}
                >
                  <div>
                    <h3
                      className={`text-lg font-medium mb-2 ${
                        isDarkMode ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {project.projectName}
                    </h3>
                    <div className="flex justify-between items-center mb-2">
                      <span
                        className={`text-sm ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {project.projectCategory}
                      </span>
                      <StatusBadge status={project.status} />
                    </div>
                    <div
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Due:{" "}
                      {project.endDate
                        ? formatDate(project.endDate)
                        : "Not set"}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div
                className={`col-span-full text-center py-8 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No projects assigned to you yet.
              </div>
            )}
          </div>
        ) : (
          <div>
            {getFilteredTasks.length > 0 ? (
              getFilteredTasks.map((task) => (
                <Card
                  key={task.id}
                  className={`mb-3 p-4 ${
                    isDarkMode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-white hover:bg-gray-50"
                  } transition-all duration-200 cursor-pointer transform hover:scale-[1.01] hover:shadow-md border-l-4 ${
                    task.status === "Completed"
                      ? "border-green-500"
                      : task.status === "In Progress"
                      ? "border-yellow-500"
                      : task.status === "Pending"
                      ? "border-gray-500"
                      : "border-red-500"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3
                        className={`font-medium mb-1 ${
                          isDarkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {task.title}
                      </h3>
                      <div
                        className={`text-xs ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Due:{" "}
                        {task.dueDate ? formatDate(task.dueDate) : "Not set"}
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                </Card>
              ))
            ) : (
              <div
                className={`text-center py-8 ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No {taskFilter === "all" ? "" : taskFilter.toLowerCase()} tasks
                found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status Update Modal removed as requested */}

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Project Details</h2>
              <button
                onClick={() => setSelectedProject(null)}
                className={`text-3xl ${
                  isDarkMode ? "hover:text-gray-400" : "hover:text-gray-600"
                }`}
              >
                &times;
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3
                  className={`text-xl font-bold mb-2 ${
                    isDarkMode ? "text-blue-400" : "text-blue-600"
                  }`}
                >
                  {selectedProject.projectName}
                </h3>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  {selectedProject.projectDescription}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-lg font-semibold mb-1">Category</h4>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {selectedProject.projectCategory}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">Status</h4>
                  <StatusBadge status={selectedProject.status} />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">Start Date</h4>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {selectedProject.startDate
                      ? formatDate(selectedProject.startDate)
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">Due Date</h4>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {selectedProject.endDate
                      ? formatDate(selectedProject.endDate)
                      : "Not set"}
                  </p>
                </div>
              </div>

              {selectedProject.tasks && selectedProject.tasks.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Tasks</h4>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    This project has {selectedProject.tasks.length} associated
                    tasks.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentHome;
