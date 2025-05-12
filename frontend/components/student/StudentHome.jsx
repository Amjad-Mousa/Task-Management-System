import { useEffect, useState, useContext } from "react";
import { DashboardLayout } from "../layout";
import { Card, StatusBadge } from "../ui";
import { StatCard } from "../shared";
import { DarkModeContext } from "../../Context/DarkModeContext";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/adminUtils";

/**
 * StudentHome component for student dashboard
 */
const StudentHome = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [tasks, setTasks] = useState([]);
  const [selectedStat, setSelectedStat] = useState(null);
  const [taskFilter, setTaskFilter] = useState("all");
  const [showProjectsModal, setShowProjectsModal] = useState(false);

  useEffect(() => {
    document.title = "Student Dashboard | Task Manager";
  }, []);

  // Dashboard statistics
  const stats = {
    projectsCount: 5,
    tasksCount: 10,
    finishedProjectsCount: 2,
    upcomingDeadlines: 3,
  };

  // Load student tasks
  useEffect(() => {
    const studentTasks = [
      {
        id: 1,
        title: "Research Report",
        status: "In Progress",
        dueDate: "2025-05-10",
        project: "Academic Research",
        description:
          "Complete the research report on the assigned topic. Include at least 5 academic sources and follow the APA citation format.",
      },
      {
        id: 2,
        title: "Final Presentation",
        status: "Completed",
        dueDate: "2025-04-20",
        project: "Academic Research",
        description:
          "Prepare and deliver a 15-minute presentation on your project findings. Include visual aids and be prepared for Q&A.",
      },
      {
        id: 3,
        title: "Project Documentation",
        status: "Pending",
        dueDate: "2025-05-05",
        project: "Web Development",
        description:
          "Document all aspects of your project including methodology, findings, and conclusions. Submit in PDF format.",
      },
      {
        id: 4,
        title: "Literature Review",
        status: "Not Started",
        dueDate: "2025-05-15",
        project: "Academic Research",
        description:
          "Conduct a comprehensive literature review on the research topic. Analyze at least 10 relevant academic papers.",
      },
      {
        id: 5,
        title: "Database Design",
        status: "In Progress",
        dueDate: "2025-05-12",
        project: "Web Development",
        description:
          "Design and implement the database schema for the project. Include entity relationship diagrams.",
      },
    ];
    setTasks(studentTasks);
  }, []);

  // Get filtered tasks based on selected filter
  const getFilteredTasks = () => {
    let filteredTasks;
    if (taskFilter === "all") {
      filteredTasks = tasks;
    } else if (taskFilter === "upcoming") {
      filteredTasks = tasks.filter((task) => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0 && task.status !== "Completed";
      });
    } else {
      filteredTasks = tasks.filter((task) => task.status === taskFilter);
    }

    // Sort by due date (most recent first)
    filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Return only the first 5 tasks
    return filteredTasks.slice(0, 5);
  };

  // Calculate task status counts
  const taskStatusCounts = {
    "Not Started": tasks.filter((task) => task.status === "Not Started").length,
    "In Progress": tasks.filter((task) => task.status === "In Progress").length,
    Pending: tasks.filter((task) => task.status === "Pending").length,
    Completed: tasks.filter((task) => task.status === "Completed").length,
  };

  // Get unique projects from tasks
  const getUniqueProjects = () => {
    const projectNames = [...new Set(tasks.map((task) => task.project))];
    return projectNames.map((name) => {
      const projectTasks = tasks.filter((task) => task.project === name);
      const completedTasks = projectTasks.filter(
        (task) => task.status === "Completed"
      ).length;
      const totalTasks = projectTasks.length;
      const progress =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      return {
        name,
        progress,
        tasks: projectTasks,
        completedTasks,
        totalTasks,
      };
    });
  };

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
      } else if (statTitle === "Number of Tasks") {
        setTaskFilter("all");
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

  if (!tasks) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <DashboardLayout role="student" showWelcomeMessage={true}>
      {/* Stats Cards */}
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <StatCard
            title="Number of Projects"
            value={stats.projectsCount}
            onClick={() => handleStatCardClick("Number of Projects")}
            isSelected={selectedStat === "Number of Projects"}
          />
          <StatCard
            title="Number of Tasks"
            value={stats.tasksCount}
            onClick={() => handleStatCardClick("Number of Tasks")}
            isSelected={selectedStat === "Number of Tasks"}
          />
          <StatCard
            title="Completed Tasks"
            value={taskStatusCounts["Completed"]}
            onClick={() => handleStatCardClick("Completed Tasks")}
            isSelected={selectedStat === "Completed Tasks"}
          />
          <StatCard
            title="Upcoming Deadlines"
            value={stats.upcomingDeadlines}
            onClick={() => handleStatCardClick("Upcoming Deadlines")}
            isSelected={selectedStat === "Upcoming Deadlines"}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex justify-center mb-6">
        <Card className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Tasks</h2>
            <Link
              to="/student-task"
              className={`px-3 py-1 rounded text-sm ${
                isDarkMode
                  ? "bg-blue-900/30 text-blue-300 hover:bg-blue-800/50"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              View All Tasks
            </Link>
          </div>

          {getFilteredTasks().length === 0 ? (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">
              No tasks available.
            </p>
          ) : (
            <ul className="space-y-3">
              {getFilteredTasks().map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Projects Modal */}
      {showProjectsModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg w-full max-w-md ${
              isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Projects</h2>
              <button
                onClick={() => setShowProjectsModal(false)}
                className={`text-3xl ${
                  isDarkMode ? "hover:text-gray-400" : "hover:text-gray-600"
                }`}
              >
                &times;
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              <ul className="space-y-3">
                {getUniqueProjects().map((project) => (
                  <li
                    key={project.name}
                    className={`p-4 rounded-lg ${
                      isDarkMode ? "bg-gray-700" : "bg-gray-100"
                    }`}
                  >
                    <span
                      className={`text-lg font-medium ${
                        isDarkMode ? "text-blue-300" : "text-blue-600"
                      }`}
                    >
                      {project.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <style jsx>{`
              .custom-scrollbar::-webkit-scrollbar {
                width: 6px;
              }
              .custom-scrollbar::-webkit-scrollbar-track {
                background: ${isDarkMode ? "#1f2937" : "#f3f4f6"};
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb {
                background: ${isDarkMode ? "#4b5563" : "#d1d5db"};
                border-radius: 10px;
              }
              .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: ${isDarkMode ? "#6b7280" : "#9ca3af"};
              }
            `}</style>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

/**
 * TaskItem component for displaying a task with enhanced details
 */
const TaskItem = ({ task }) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [expanded, setExpanded] = useState(false);

  // Calculate days until due date
  const getDaysUntilDue = () => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = getDaysUntilDue();
  const isOverdue = daysUntilDue < 0 && task.status !== "Completed";
  const isUrgent =
    daysUntilDue >= 0 && daysUntilDue <= 3 && task.status !== "Completed";

  return (
    <li
      className={`p-4 rounded-lg border transition-all duration-200 ${
        expanded ? "shadow-md" : ""
      } ${
        isDarkMode
          ? "border-gray-700 hover:border-gray-600"
          : "border-gray-200 hover:border-gray-300"
      } ${
        isOverdue
          ? isDarkMode
            ? "border-red-800 bg-red-900/20"
            : "border-red-300 bg-red-50"
          : isUrgent
          ? isDarkMode
            ? "border-yellow-800 bg-yellow-900/20"
            : "border-yellow-300 bg-yellow-50"
          : ""
      }`}
    >
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-medium">{task.title}</h3>
            {isOverdue && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  isDarkMode
                    ? "bg-red-900/30 text-red-300 border-red-800"
                    : "bg-red-100 text-red-700 border-red-200"
                }`}
              >
                Overdue
              </span>
            )}
            {isUrgent && !isOverdue && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${
                  isDarkMode
                    ? "bg-yellow-900/30 text-yellow-300 border-yellow-800"
                    : "bg-yellow-100 text-yellow-700 border-yellow-200"
                }`}
              >
                Urgent
              </span>
            )}
          </div>
          <div
            className={`text-sm mt-1 ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <span>Project: {task.project}</span>
            <span className="mx-2">•</span>
            <span>Due: {formatDate(task.dueDate)}</span>
            {daysUntilDue >= 0 && task.status !== "Completed" && (
              <>
                <span className="mx-2">•</span>
                <span>{daysUntilDue} days left</span>
              </>
            )}
          </div>
        </div>
        <StatusBadge status={task.status} />
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t dark:border-gray-700">
          <p
            className={`text-sm mb-3 ${
              isDarkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {task.description}
          </p>
          <div className="flex justify-end">
            <Link
              to="/student-task"
              className={`px-3 py-1 text-sm rounded ${
                isDarkMode
                  ? "bg-blue-900/30 text-blue-300 hover:bg-blue-800/50"
                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
              }`}
            >
              Update Status
            </Link>
          </div>
        </div>
      )}
    </li>
  );
};

export default StudentHome;
