import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import DashboardChart from "../DashboardChart";
import { DashboardLayout } from "../layout";
import { StatCard } from "../shared";
import { Card } from "../ui";
import { DarkModeContext } from "../../Context/DarkModeContext";
import { useGraphQL } from "../../Context/GraphQLContext";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/adminUtils";
import {
  GET_PROJECTS_QUERY,
  GET_TASKS_QUERY,
  GET_STUDENTS_QUERY,
  GET_RECENT_TASKS_QUERY,
} from "../../graphql/queries";

/**
 * AdminHome component for admin dashboard
 */
const AdminHome = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const { executeQuery, getCachedData } = useGraphQL();
  const [selectedStat, setSelectedStat] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.title = "Admin Dashboard | Task Manager";
  }, []);

  // Fetch projects from API with optimized caching
  const fetchProjects = useCallback(async () => {
    try {
      // Set a longer cache expiration for projects (10 minutes)
      const data = await executeQuery(
        GET_PROJECTS_QUERY,
        {},
        true, // Include credentials
        true, // Use cache
        10 * 60 * 1000 // 10 minutes cache expiration
      );

      if (data && data.projects) {
        setProjects(data.projects);
        return data.projects;
      } else {
        console.warn("No projects found in response");
        setProjects([]);
        return [];
      }
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Failed to load projects. Please try again later.");
      return [];
    }
  }, [executeQuery]);

  // Fetch tasks from API with optimized caching
  const fetchTasks = useCallback(async () => {
    try {
      // Set a medium cache expiration for tasks (5 minutes)
      const data = await executeQuery(
        GET_TASKS_QUERY,
        {},
        true, // Include credentials
        true, // Use cache
        5 * 60 * 1000 // 5 minutes cache expiration
      );

      if (data && data.tasks) {
        setTasks(data.tasks);
        return data.tasks;
      } else {
        console.warn("No tasks found in response");
        setTasks([]);
        return [];
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError("Failed to load tasks. Please try again later.");
      return [];
    }
  }, [executeQuery]);

  // Fetch students from API with optimized caching
  const fetchStudents = useCallback(async () => {
    try {
      // Set a longer cache expiration for students (15 minutes)
      const data = await executeQuery(
        GET_STUDENTS_QUERY,
        {},
        true, // Include credentials
        true, // Use cache
        15 * 60 * 1000 // 15 minutes cache expiration
      );

      if (data && data.students) {
        setStudents(data.students);
        return data.students;
      } else {
        console.warn("No students found in response");
        setStudents([]);
        return [];
      }
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load students. Please try again later.");
      return [];
    }
  }, [executeQuery]);

  // Fetch recent tasks with shorter cache time
  const fetchRecentActivities = useCallback(async () => {
    try {
      // Set a shorter cache expiration for recent activities (2 minutes)
      const data = await executeQuery(
        GET_RECENT_TASKS_QUERY,
        { limit: 5 },
        true, // Include credentials
        true, // Use cache
        2 * 60 * 1000 // 2 minutes cache expiration
      );

      if (data && data.recentTasks) {
        // Transform the recent tasks into activity format
        const activities = data.recentTasks.map((task) => {
          // Use the task's updatedAt date
          const taskDate = task.updatedAt;

          // Get student name with proper handling for null/undefined values
          let studentName = "Unassigned";
          if (
            task.assignedStudent &&
            task.assignedStudent.user &&
            task.assignedStudent.user.name
          ) {
            studentName = task.assignedStudent.user.name;
          }

          return {
            type: "task",
            action: "updated",
            item: task.title,
            date: taskDate,
            user: studentName,
            details: `Status: ${task.status}`,
          };
        });

        setRecentActivity(activities);
        return activities;
      } else {
        console.warn("No recent tasks found in response");
        setRecentActivity([]);
        return [];
      }
    } catch (err) {
      console.error("Error fetching recent tasks:", err);
      setError("Failed to load recent tasks. Please try again later.");
      return [];
    }
  }, [executeQuery]);

  // Load all data with optimized error handling and caching
  useEffect(() => {
    const loadAllData = async () => {
      // Check if we have cached data first
      const cachedProjects = getCachedData(GET_PROJECTS_QUERY, {});
      const cachedTasks = getCachedData(GET_TASKS_QUERY, {});
      const cachedStudents = getCachedData(GET_STUDENTS_QUERY, {});
      const cachedRecentTasks = getCachedData(GET_RECENT_TASKS_QUERY, {
        limit: 5,
      });

      // If we have all cached data, use it immediately
      if (
        cachedProjects &&
        cachedTasks &&
        cachedStudents &&
        cachedRecentTasks
      ) {
        setProjects(cachedProjects.projects || []);
        setTasks(cachedTasks.tasks || []);
        setStudents(cachedStudents.students || []);

        // Transform cached recent tasks
        if (cachedRecentTasks.recentTasks) {
          const activities = cachedRecentTasks.recentTasks.map((task) => ({
            type: "task",
            action: "updated",
            item: task.title,
            date: task.updatedAt,
            user: task.assignedStudent?.user?.name || "Unassigned",
            details: `Status: ${task.status}`,
          }));
          setRecentActivity(activities);
        }

        setLoading(false);
        return;
      }

      // Otherwise, fetch fresh data
      setLoading(true);
      setError(null);

      try {
        // Use Promise.allSettled to handle partial failures
        const results = await Promise.allSettled([
          fetchProjects(),
          fetchTasks(),
          fetchStudents(),
          fetchRecentActivities(),
        ]);

        // Check for any rejected promises
        const rejectedResults = results.filter(
          (result) => result.status === "rejected"
        );
        if (rejectedResults.length > 0) {
          console.warn(
            `${rejectedResults.length} data fetching operations failed`
          );
          // We still continue with partial data
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [
    fetchProjects,
    fetchTasks,
    fetchStudents,
    fetchRecentActivities,
    getCachedData,
  ]);

  // Dashboard statistics - memoized to prevent unnecessary recalculations
  const stats = useMemo(
    () => ({
      projectsCount: projects.length,
      studentsCount: students.length,
      tasksCount: tasks.length,
      finishedProjectsCount: projects.filter(
        (p) => p.progress === 100 || p.status === "Completed"
      ).length,
    }),
    [projects, students, tasks]
  );

  // Calculate task status counts - memoized
  const taskStatusCounts = useMemo(
    () => ({
      "Not Started": tasks.filter((task) => task.status === "Not Started")
        .length,
      "In Progress": tasks.filter((task) => task.status === "In Progress")
        .length,
      Pending: tasks.filter((task) => task.status === "Pending").length,
      Completed: tasks.filter((task) => task.status === "Completed").length,
    }),
    [tasks]
  );

  // Map stat titles to their index in the chart - memoized
  const statIndexMap = useMemo(
    () => ({
      Projects: 0,
      Students: 1,
      Tasks: 2,
      "Finished Projects": 3,
    }),
    []
  );

  // Handle stat card click
  const handleStatCardClick = (title) => {
    if (selectedStat === title) {
      setSelectedStat(null); // Deselect if already selected
    } else {
      setSelectedStat(title); // Select the clicked stat
    }
  };

  return (
    <DashboardLayout role="admin" showWelcomeMessage={true}>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div
            className={`text-xl ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Loading dashboard data...
          </div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              title="Projects"
              value={stats.projectsCount}
              onClick={() => handleStatCardClick("Projects")}
              isSelected={selectedStat === "Projects"}
            />
            <StatCard
              title="Students"
              value={stats.studentsCount}
              onClick={() => handleStatCardClick("Students")}
              isSelected={selectedStat === "Students"}
            />
            <StatCard
              title="Tasks"
              value={stats.tasksCount}
              onClick={() => handleStatCardClick("Tasks")}
              isSelected={selectedStat === "Tasks"}
            />
            <StatCard
              title="Finished Projects"
              value={stats.finishedProjectsCount}
              onClick={() => handleStatCardClick("Finished Projects")}
              isSelected={selectedStat === "Finished Projects"}
            />
          </div>

          {/* Quick Actions and Task Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Quick Actions */}
            <Card className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link
                  to="/admin-projects"
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <span className="flex items-center">
                    <span className="text-lg mr-3">📂</span>
                    <span>Add New Project</span>
                  </span>
                  <span className="text-lg">→</span>
                </Link>
                <Link
                  to="/admin-tasks"
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <span className="flex items-center">
                    <span className="text-lg mr-3">✅</span>
                    <span>Assign New Task</span>
                  </span>
                  <span className="text-lg">→</span>
                </Link>
                <Link
                  to="/admin-chat"
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-gray-800 hover:bg-gray-700"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  <span className="flex items-center">
                    <span className="text-lg mr-3">💬</span>
                    <span>Message Students</span>
                  </span>
                  <span className="text-lg">→</span>
                </Link>
              </div>
            </Card>

            {/* Task Status */}
            <Card className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">
                Task Status Overview
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(taskStatusCounts).map(([status, count]) => (
                  <div
                    key={status}
                    className={`p-3 rounded-lg text-center border ${
                      isDarkMode
                        ? "bg-gray-800 border-gray-700"
                        : status === "Completed"
                        ? "bg-green-100 border-green-200"
                        : status === "In Progress"
                        ? "bg-yellow-100 border-yellow-200"
                        : status === "Pending"
                        ? "bg-gray-100 border-gray-200"
                        : "bg-red-100 border-red-200"
                    }`}
                  >
                    <div
                      className={`text-2xl font-bold mb-1 ${
                        status === "Completed"
                          ? isDarkMode
                            ? "text-green-500"
                            : "text-green-700"
                          : status === "In Progress"
                          ? isDarkMode
                            ? "text-yellow-500"
                            : "text-yellow-700"
                          : status === "Pending"
                          ? isDarkMode
                            ? "text-gray-500"
                            : "text-gray-700"
                          : isDarkMode
                          ? "text-red-500"
                          : "text-red-700"
                      }`}
                    >
                      {count}
                    </div>
                    <div className="text-sm">{status}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="w-full bg-gray-300 dark:bg-gray-700 h-2 rounded-full">
                  <div className="flex h-2">
                    <div
                      className={`${
                        isDarkMode ? "bg-red-500" : "bg-red-400"
                      } h-2 rounded-l-full`}
                      style={{
                        width: `${
                          (taskStatusCounts["Not Started"] / stats.tasksCount) *
                          100
                        }%`,
                        display:
                          taskStatusCounts["Not Started"] > 0
                            ? "block"
                            : "none",
                      }}
                    ></div>
                    <div
                      className={`${
                        isDarkMode ? "bg-gray-500" : "bg-gray-400"
                      } h-2`}
                      style={{
                        width: `${
                          (taskStatusCounts["Pending"] / stats.tasksCount) * 100
                        }%`,
                        display:
                          taskStatusCounts["Pending"] > 0 ? "block" : "none",
                      }}
                    ></div>
                    <div
                      className={`${
                        isDarkMode ? "bg-yellow-500" : "bg-yellow-400"
                      } h-2`}
                      style={{
                        width: `${
                          (taskStatusCounts["In Progress"] / stats.tasksCount) *
                          100
                        }%`,
                        display:
                          taskStatusCounts["In Progress"] > 0
                            ? "block"
                            : "none",
                      }}
                    ></div>
                    <div
                      className={`${
                        isDarkMode ? "bg-green-500" : "bg-green-400"
                      } h-2 rounded-r-full`}
                      style={{
                        width: `${
                          (taskStatusCounts["Completed"] / stats.tasksCount) *
                          100
                        }%`,
                        display:
                          taskStatusCounts["Completed"] > 0 ? "block" : "none",
                      }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>Not Started</span>
                  <span>Completed</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Chart Section */}
          <div className="w-full mb-6">
            <Card>
              <h2 className="text-xl font-semibold mb-4">
                Statistics Overview
              </h2>
              <DashboardChart
                stats={stats}
                highlightIndex={
                  selectedStat ? statIndexMap[selectedStat] : null
                }
              />
            </Card>
          </div>

          {/* Recent Tasks */}
          <div className="mb-6">
            <Card>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Tasks</h2>
              </div>
              {recentActivity.length === 0 ? (
                <p className="text-center py-4 text-gray-500">
                  No recent tasks found.
                </p>
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((activity, index) => (
                    <li
                      key={index}
                      className={`p-3 rounded-lg ${
                        isDarkMode ? "bg-gray-800" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">✅ {activity.item}</span>
                        <span className="text-sm text-gray-500">
                          {formatDate(activity.date)}
                        </span>
                      </div>
                      <div className="text-sm mt-1">
                        <span className="text-gray-500">
                          {activity.user} • {activity.details}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AdminHome;
