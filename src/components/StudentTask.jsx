import { useEffect, useState, useContext } from "react";
import { useLocation } from "react-router-dom";
import { DarkModeContext } from "../Context/DarkModeContext";
import DarkModeToggle from "./DarkModeToggle";
import Sidebar from "./Sidebar";

const StuTask = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [username, setUsername] = useState("");
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [sortedTasks, setSortedTasks] = useState([]);
  const [sortBy, setSortBy] = useState("dueDate"); // Sorting by 'dueDate' or 'status'

  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path
      ? "bg-blue-600 text-white"
      : isDarkMode
      ? "bg-gray-700"
      : "bg-gray-200";

  useEffect(() => {
    document.title = "Student Tasks";
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user")
    );
    if (storedUser?.username) {
      setUsername(storedUser.username);
    }
  }, []);

  useEffect(() => {
    const studentTasks = [
      {
        id: 1,
        title: "Research Report",
        status: "In Progress",
        dueDate: "2025-05-10",
      },
      {
        id: 2,
        title: "Final Presentation",
        status: "Completed",
        dueDate: "2025-04-20",
      },
      {
        id: 3,
        title: "Project Documentation",
        status: "Pending",
        dueDate: "2025-05-05",
      },
      {
        id: 4,
        title: "Literature Review",
        status: "Not Started",
        dueDate: "2025-05-15",
      },
    ];
    setTasks(studentTasks);
    setSortedTasks(studentTasks); // Initialize sorted tasks
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
  };

  const handleSort = (sortBy) => {
    const sorted = [...tasks].sort((a, b) => {
      if (sortBy === "dueDate") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === "status") {
        const statusOrder = ["Pending", "In Progress", "Completed"];
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      }
    });

    setSortBy(sortBy);
    setSortedTasks(sorted);
  };

  const handleTaskClick = (taskId) => {
    const task = tasks.find((task) => task.id === taskId);
    setSelectedTask(task);
  };

  const handleCloseDetails = () => {
    setSelectedTask(null);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <Sidebar role="student" username={username} />

      {/* Main Content */}
      <main className="flex-1 p-6 relative">
        {/* Dark Mode Toggle */}
        <div className="absolute top-4 right-4">
          <DarkModeToggle />
        </div>

        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Your Tasks</h1>
        </header>

        {/* Sort Options */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => handleSort(e.target.value)}
              className="ml-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md"
            >
              <option value="dueDate">Sort by Due Date</option>
              <option value="status">Sort by Status</option>
            </select>
          </div>
        </div>

        {/* Tasks Section */}
        <section className="w-full max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">Your Tasks</h2>
          {sortedTasks.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              No tasks available.
            </p>
          ) : (
            <ul className="space-y-4">
              {sortedTasks.map((task) => (
                <li
                  key={task.id}
                  onClick={() => handleTaskClick(task.id)}
                  className={`p-4 rounded-lg cursor-pointer shadow transition-transform hover:scale-105 ${
                    task.id === selectedTask?.id
                      ? "bg-blue-600 text-white"
                      : task.status === "Completed"
                      ? "bg-green-600 text-white"
                      : task.status === "In Progress"
                      ? "bg-yellow-500 text-white"
                      : task.status === "Pending"
                      ? "bg-gray-500 text-white"
                      : "bg-red-600 text-white" // Not Started
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold">{task.title}</h3>
                    <span className="text-sm italic">{task.status}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Task Details Section */}
        {selectedTask && (
          <section className="mt-6 p-6 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">Task Details</h3>
            <div>
              <p className="text-lg">
                <strong>Title:</strong> {selectedTask.title}
              </p>
              <p className="text-lg">
                <strong>Status:</strong> {selectedTask.status}
              </p>
              <p className="text-lg">
                <strong>Due Date:</strong>{" "}
                {new Date(selectedTask.dueDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleCloseDetails}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
            >
              Close Details
            </button>
          </section>
        )}
      </main>
    </div>
  );
};

export default StuTask;
