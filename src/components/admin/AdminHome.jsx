import { useEffect, useState, useContext } from "react";
import DashboardChart from "../DashboardChart";
import { DashboardLayout } from "../layout";
import { StatCard } from "../shared";
import { Card } from "../ui";
import { DarkModeContext } from "../../Context/DarkModeContext";
import { Link } from "react-router-dom";

/**
 * AdminHome component for admin dashboard
 */
const AdminHome = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [selectedStat, setSelectedStat] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    document.title = "Admin Dashboard | Task Manager";
  }, []);

  // Load tasks and projects
  useEffect(() => {
    // Load tasks
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
        lastUpdated: "2023-04-15T10:30:00Z",
      },
      {
        id: 2,
        project: "Website Redesign",
        taskName: "Develop API",
        description: "Set up the backend API for the project.",
        assignedStudent: "Braz Aeesh",
        status: "Completed",
        dueDate: "1/16/2023",
        lastUpdated: "2023-01-16T14:20:00Z",
      },
      {
        id: 3,
        project: "Mobile App Development",
        taskName: "Create Wireframes",
        description: "Design initial wireframes for the mobile app.",
        assignedStudent: "Ibn Al-Jawzee",
        status: "Not Started",
        dueDate: "5/15/2023",
        lastUpdated: "2023-04-10T09:15:00Z",
      },
      {
        id: 4,
        project: "E-commerce Platform",
        taskName: "Database Design",
        description: "Create database schema for the e-commerce platform.",
        assignedStudent: "Ayman Oulom",
        status: "Pending",
        dueDate: "3/30/2023",
        lastUpdated: "2023-03-25T16:45:00Z",
      },
    ];
    const allTasks = [...defaultTasks, ...storedTasks];
    setTasks(allTasks);

    // Load projects
    const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    const defaultProjects = [
      {
        id: 1,
        title: "Website Redesign",
        description:
          "Redesign the company website with modern UI/UX principles",
        students: ["All Yaseen", "Braz Aeesh"],
        category: "Web Development",
        progress: 65,
        status: "In Progress",
        startDate: "2023-01-10",
        endDate: "2023-05-30",
        lastUpdated: "2023-04-12T11:20:00Z",
      },
      {
        id: 2,
        title: "Mobile App Development",
        description: "Develop a mobile app for both iOS and Android platforms",
        students: ["Ibn Al-Jawzee"],
        category: "Mobile Development",
        progress: 25,
        status: "In Progress",
        startDate: "2023-03-01",
        endDate: "2023-07-15",
        lastUpdated: "2023-04-05T13:40:00Z",
      },
      {
        id: 3,
        title: "E-commerce Platform",
        description: "Build an e-commerce platform with payment integration",
        students: ["Ayman Oulom"],
        category: "Web Development",
        progress: 40,
        status: "Pending",
        startDate: "2023-02-15",
        endDate: "2023-06-30",
        lastUpdated: "2023-03-20T09:30:00Z",
      },
    ];
    const allProjects = [...defaultProjects, ...savedProjects];
    setProjects(allProjects);

    // Generate recent activity
    const activities = [
      ...allTasks.map((task) => ({
        type: "task",
        action: "updated",
        item: task.taskName,
        date: new Date(task.lastUpdated || Date.now()),
        user: task.assignedStudent,
        details: `Status: ${task.status}`,
      })),
      ...allProjects.map((project) => ({
        type: "project",
        action: "updated",
        item: project.title,
        date: new Date(project.lastUpdated || Date.now()),
        user: project.students?.[0] || "Admin",
        details: `Progress: ${project.progress}%`,
      })),
    ];

    // Sort by date (newest first) and take the 5 most recent
    activities.sort((a, b) => b.date - a.date);
    setRecentActivity(activities.slice(0, 5));
  }, []);

  // Dashboard statistics
  const stats = {
    projectsCount: projects.length,
    studentsCount: 20,
    tasksCount: tasks.length,
    finishedProjectsCount: projects.filter(
      (p) => p.progress === 100 || p.status === "Completed"
    ).length,
  };

  // Calculate task status counts
  const taskStatusCounts = {
    "Not Started": tasks.filter((task) => task.status === "Not Started").length,
    "In Progress": tasks.filter((task) => task.status === "In Progress").length,
    Pending: tasks.filter((task) => task.status === "Pending").length,
    Completed: tasks.filter((task) => task.status === "Completed").length,
  };

  // Calculate project category distribution
  const projectCategories = {};
  projects.forEach((project) => {
    if (project.category) {
      projectCategories[project.category] =
        (projectCategories[project.category] || 0) + 1;
    }
  });

  // Map stat titles to their index in the chart
  const statIndexMap = {
    Projects: 0,
    Students: 1,
    Tasks: 2,
    "Finished Projects": 3,
  };

  // Handle stat card click
  const handleStatCardClick = (title) => {
    if (selectedStat === title) {
      setSelectedStat(null); // Deselect if already selected
    } else {
      setSelectedStat(title); // Select the clicked stat
    }
  };

  // Format date for display
  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const day = 24 * 60 * 60 * 1000;

    if (diff < day) {
      return "Today";
    } else if (diff < 2 * day) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <DashboardLayout role="admin" showWelcomeMessage={true}>
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
              to="/projects"
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
              to="/tasks"
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
              to="/chat"
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
          <h2 className="text-xl font-semibold mb-4">Task Status Overview</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Object.entries(taskStatusCounts).map(([status, count]) => (
              <div
                key={status}
                className={`p-3 rounded-lg text-center ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <div
                  className={`text-2xl font-bold mb-1 ${
                    status === "Completed"
                      ? "text-green-500"
                      : status === "In Progress"
                      ? "text-yellow-500"
                      : status === "Pending"
                      ? "text-gray-500"
                      : "text-red-500"
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
                  className="bg-red-500 h-2 rounded-l-full"
                  style={{
                    width: `${
                      (taskStatusCounts["Not Started"] / stats.tasksCount) * 100
                    }%`,
                    display:
                      taskStatusCounts["Not Started"] > 0 ? "block" : "none",
                  }}
                ></div>
                <div
                  className="bg-gray-500 h-2"
                  style={{
                    width: `${
                      (taskStatusCounts["Pending"] / stats.tasksCount) * 100
                    }%`,
                    display: taskStatusCounts["Pending"] > 0 ? "block" : "none",
                  }}
                ></div>
                <div
                  className="bg-yellow-500 h-2"
                  style={{
                    width: `${
                      (taskStatusCounts["In Progress"] / stats.tasksCount) * 100
                    }%`,
                    display:
                      taskStatusCounts["In Progress"] > 0 ? "block" : "none",
                  }}
                ></div>
                <div
                  className="bg-green-500 h-2 rounded-r-full"
                  style={{
                    width: `${
                      (taskStatusCounts["Completed"] / stats.tasksCount) * 100
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
          <h2 className="text-xl font-semibold mb-4">Statistics Overview</h2>
          <DashboardChart
            stats={stats}
            highlightIndex={selectedStat ? statIndexMap[selectedStat] : null}
          />
        </Card>
      </div>

      {/* Recent Activity and Project Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Activity */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </div>
          {recentActivity.length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              No recent activity found.
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
                    <span className="font-medium">
                      {activity.type === "task" ? "✅ " : "📂 "}
                      {activity.item}
                    </span>
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

        {/* Project Categories */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Project Categories</h2>
            <Link
              to="/projects"
              className={`text-sm px-3 py-1 rounded ${
                isDarkMode
                  ? "bg-blue-900/30 text-blue-300 hover:bg-blue-800/50"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              View All
            </Link>
          </div>
          {Object.keys(projectCategories).length === 0 ? (
            <p className="text-center py-4 text-gray-500">
              No project categories found.
            </p>
          ) : (
            <div className="space-y-4">
              {Object.entries(projectCategories).map(([category, count]) => (
                <div key={category} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category}</span>
                    <span className="text-sm">{count} projects</span>
                  </div>
                  <div className="w-full bg-gray-300 dark:bg-gray-700 h-2 rounded-full">
                    <div
                      className={`h-2 rounded-full ${
                        isDarkMode ? "bg-blue-600" : "bg-blue-500"
                      }`}
                      style={{ width: `${(count / projects.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-4">
            <h3 className="font-medium mb-2">Project Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-3 rounded-lg text-center ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <div className="text-2xl font-bold mb-1 text-yellow-500">
                  {projects.filter((p) => p.status === "In Progress").length}
                </div>
                <div className="text-sm">In Progress</div>
              </div>
              <div
                className={`p-3 rounded-lg text-center ${
                  isDarkMode ? "bg-gray-800" : "bg-gray-100"
                }`}
              >
                <div className="text-2xl font-bold mb-1 text-green-500">
                  {projects.filter((p) => p.status === "Completed").length}
                </div>
                <div className="text-sm">Completed</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminHome;
