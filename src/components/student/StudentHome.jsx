import { useEffect, useState, useContext } from "react";
import { DashboardLayout } from "../layout";
import { Card, StatusBadge, Select } from "../ui";
import { StatCard } from "../shared";
import { DarkModeContext } from "../../Context/DarkModeContext";
import { Link } from "react-router-dom";

/**
 * StudentHome component for student dashboard
 */
const StudentHome = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedStat, setSelectedStat] = useState(null);
  const [taskFilter, setTaskFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState(null);

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

  // Load student projects
  useEffect(() => {
    const studentProjects = [
      {
        id: 1,
        title: "Academic Research",
        description:
          "Research project on advanced topics in your field of study",
        progress: 65,
        status: "In Progress",
        startDate: "2025-03-15",
        endDate: "2025-06-15",
        tasks: [1, 2, 4],
      },
      {
        id: 2,
        title: "Web Development",
        description:
          "Building a responsive web application with modern technologies",
        progress: 40,
        status: "In Progress",
        startDate: "2025-04-01",
        endDate: "2025-05-30",
        tasks: [3, 5],
      },
      {
        id: 3,
        title: "Data Analysis",
        description: "Analyzing large datasets to extract meaningful insights",
        progress: 10,
        status: "Not Started",
        startDate: "2025-05-01",
        endDate: "2025-06-30",
        tasks: [],
      },
    ];
    setProjects(studentProjects);
  }, []);

  // Get filtered tasks based on selected filter
  const getFilteredTasks = () => {
    if (taskFilter === "all") return tasks;
    if (taskFilter === "upcoming") {
      return tasks.filter((task) => {
        const dueDate = new Date(task.dueDate);
        const today = new Date();
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays >= 0 && task.status !== "Completed";
      });
    }
    return tasks.filter((task) => task.status === taskFilter);
  };

  // Get tasks for selected project
  const getProjectTasks = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return [];
    return tasks.filter((task) => project.tasks.includes(task.id));
  };

  // Calculate task status counts
  const taskStatusCounts = {
    "Not Started": tasks.filter((task) => task.status === "Not Started").length,
    "In Progress": tasks.filter((task) => task.status === "In Progress").length,
    Pending: tasks.filter((task) => task.status === "Pending").length,
    Completed: tasks.filter((task) => task.status === "Completed").length,
  };

  // Handle stat card click
  const handleStatCardClick = (statTitle) => {
    if (selectedStat === statTitle) {
      setSelectedStat(null);
    } else {
      setSelectedStat(statTitle);

      // Set appropriate task filter based on selected stat
      if (statTitle === "Number of Tasks") {
        setTaskFilter("all");
      } else if (statTitle === "Number of Finished Projects") {
        setTaskFilter("Completed");
      } else if (statTitle === "Upcoming Deadlines") {
        setTaskFilter("upcoming");
      }
    }
  };

  // Handle project click
  const handleProjectClick = (projectId) => {
    if (selectedProject === projectId) {
      setSelectedProject(null);
    } else {
      setSelectedProject(projectId);
    }
  };

  if (!tasks || !projects) {
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

      {/* Task Status Summary */}
      <div className="mb-6">
        <Card className="w-full">
          <h2 className="text-xl font-semibold mb-4">Task Status Summary</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {Object.entries(taskStatusCounts).map(([status, count]) => (
              <div
                key={status}
                onClick={() => setTaskFilter(status)}
                className={`px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  taskFilter === status
                    ? "transform scale-105 shadow-md"
                    : "hover:shadow-sm"
                } ${
                  isDarkMode
                    ? "bg-gray-800 hover:bg-gray-700"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <StatusBadge status={status} />
                  <span className="text-lg font-semibold">{count}</span>
                </div>
              </div>
            ))}
            <div
              onClick={() => setTaskFilter("all")}
              className={`px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                taskFilter === "all"
                  ? "transform scale-105 shadow-md"
                  : "hover:shadow-sm"
              } ${
                isDarkMode
                  ? "bg-gray-800 hover:bg-gray-700"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-2.5 py-1 rounded-full text-center min-w-[7rem] ${
                    isDarkMode
                      ? "bg-blue-900/30 text-blue-300 border border-blue-800"
                      : "bg-blue-600 text-white border border-blue-700"
                  }`}
                >
                  All Tasks
                </span>
                <span className="text-lg font-semibold">{tasks.length}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Projects Section */}
      <div className="mb-6">
        <Card className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Projects</h2>
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

          <div className="space-y-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                  selectedProject === project.id
                    ? isDarkMode
                      ? "border-blue-500 bg-gray-800"
                      : "border-blue-500 bg-blue-50"
                    : isDarkMode
                    ? "border-gray-700 hover:border-gray-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => handleProjectClick(project.id)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">{project.title}</h3>
                  <StatusBadge status={project.status} />
                </div>
                <p
                  className={`text-sm mb-3 ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {project.description}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-gray-300 dark:bg-gray-700 h-2 rounded-full mb-2">
                  <div
                    className={`h-2 rounded-full ${
                      project.status === "Completed"
                        ? "bg-green-500"
                        : project.progress > 50
                        ? "bg-yellow-500"
                        : project.status === "Pending"
                        ? "bg-gray-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span>{project.progress}% Complete</span>
                  <span>
                    Due: {new Date(project.endDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Project tasks (shown when project is selected) */}
                {selectedProject === project.id && (
                  <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <h4 className="font-medium mb-2">Project Tasks</h4>
                    {getProjectTasks(project.id).length > 0 ? (
                      <ul className="space-y-2">
                        {getProjectTasks(project.id).map((task) => (
                          <li
                            key={task.id}
                            className="flex justify-between items-center p-2 rounded bg-gray-100 dark:bg-gray-800"
                          >
                            <span>{task.title}</span>
                            <StatusBadge status={task.status} size="sm" />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No tasks assigned to this project yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Tasks List */}
      <div className="flex justify-center mb-6">
        <Card className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {taskFilter === "all"
                ? "All Tasks"
                : taskFilter === "upcoming"
                ? "Upcoming Deadlines"
                : `${taskFilter} Tasks`}
            </h2>
            <Select
              name="taskFilter"
              value={taskFilter}
              onChange={(e) => setTaskFilter(e.target.value)}
              options={[
                { value: "all", label: "All Tasks" },
                { value: "Not Started", label: "Not Started" },
                { value: "In Progress", label: "In Progress" },
                { value: "Pending", label: "Pending" },
                { value: "Completed", label: "Completed" },
                { value: "upcoming", label: "Upcoming Deadlines" },
              ]}
              className="w-48"
            />
          </div>

          {getFilteredTasks().length === 0 ? (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">
              No tasks found for the selected filter.
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
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isDarkMode
                    ? "bg-red-900/50 text-red-300"
                    : "bg-red-100 text-red-600"
                }`}
              >
                Overdue
              </span>
            )}
            {isUrgent && !isOverdue && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isDarkMode
                    ? "bg-yellow-900/50 text-yellow-300"
                    : "bg-yellow-100 text-yellow-600"
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
            <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
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
