import { useEffect, useState, useContext } from "react";
import { DashboardLayout } from "../layout";
import { Card, Select, StatusBadge, Modal } from "../ui";
import { DarkModeContext } from "../../Context/DarkModeContext";
import StatusUpdateModal from "./StatusUpdateModal";
import { getSearchInputClasses } from "../../utils/adminUtils";

/**
 * StudentTask component for student task management
 */
const StudentTask = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [tasks, setTasks] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "dueDate",
    direction: "asc",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const SUCCESS_MESSAGE_TIMEOUT = 3000;

  useEffect(() => {
    document.title = "Student Tasks | Task Manager";
  }, []);

  useEffect(() => {
    const studentTasks = [
      {
        id: 1,
        title: "Research Report",
        status: "In Progress",
        dueDate: "2025-05-10",
        description:
          "Complete the research report on the assigned topic. Include at least 5 academic sources and follow the APA citation format.",
      },
      {
        id: 2,
        title: "Final Presentation",
        status: "Completed",
        dueDate: "2025-04-20",
        description:
          "Prepare and deliver a 15-minute presentation on your project findings. Include visual aids and be prepared for Q&A.",
      },
      {
        id: 3,
        title: "Project Documentation",
        status: "Pending",
        dueDate: "2025-05-05",
        description:
          "Document all aspects of your project including methodology, findings, and conclusions. Submit in PDF format.",
      },
      {
        id: 4,
        title: "Literature Review",
        status: "Not Started",
        dueDate: "2025-05-15",
        description:
          "Conduct a comprehensive literature review on the research topic. Analyze at least 10 relevant academic papers.",
      },
    ];
    setTasks(studentTasks);
  }, []);

  const sortTasks = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSortedTasks = () => {
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
        return direction === "asc"
          ? new Date(a.dueDate) - new Date(b.dueDate)
          : new Date(b.dueDate) - new Date(a.dueDate);
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
        return direction === "asc"
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });
    return sortedTasks;
  };

  const handleTaskClick = (taskId) => {
    const task = tasks.find((task) => task.id === taskId);
    setSelectedTask(task);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    setSuccessMessage("Task status updated successfully!");
    setTimeout(() => setSuccessMessage(null), SUCCESS_MESSAGE_TIMEOUT);
  };

  return (
    <DashboardLayout
      role="student"
      title="Your Tasks"
      successMessage={successMessage}
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

      {/* Tasks Table */}
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
                { display: "Task", key: "title" },
                { display: "Description", key: "description" },
                { display: "Status", key: "status" },
                { display: "Due Date", key: "dueDate" },
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
            {getSortedTasks().length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className={`px-6 py-8 text-center text-sm ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {searchQuery.trim()
                    ? `No tasks found matching "${searchQuery}"`
                    : "No tasks available."}
                </td>
              </tr>
            ) : (
              getSortedTasks().map((task) => (
                <tr
                  key={task.id}
                  onClick={() => handleTaskClick(task.id)}
                  className="table-row-hover transition-colors duration-150 cursor-pointer"
                >
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {task.title}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {task.description.length > 50
                      ? `${task.description.substring(0, 50)}...`
                      : task.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={task.status} />
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {new Date(task.dueDate).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
