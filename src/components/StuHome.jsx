import { useEffect, useState } from "react";
import DarkModeToggle from "./DarkModeToggle";
import Sidebar from "./Sidebar";

const StuHome = () => {
  const [datetime, setDatetime] = useState("");
  const [username, setUsername] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    document.title = "StudentHome - Task Manager";
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDatetime(
        now.toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user")
    );
    if (storedUser?.username) {
      setUsername(storedUser.username);
    }
  }, []);

  const stats = {
    projectsCount: 5,
    tasksCount: 10,
    finishedProjectsCount: 2,
  };

  useEffect(() => {
    const studentTasks = [
      { id: 1, title: "Research Report", status: "In Progress" },
      { id: 2, title: "Final Presentation", status: "Completed" },
      { id: 3, title: "Project Documentation", status: "Pending" },
      { id: 4, title: "Literature Review", status: "Not Started" },
    ];
    setTasks(studentTasks);
  }, []);

  if (!tasks) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <Sidebar role="student" username={username} />

      <main className="flex-1 p-6 relative">
        <div className="absolute top-4 right-4">
          <DarkModeToggle />
        </div>

        <header className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            Welcome,{" "}
            <span className="text-blue-600">{username || "Student"}</span>
          </h1>
          <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md shadow">
            <span className="text-xl">⏰</span>
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              {datetime}
            </span>
          </div>
        </header>

        <div className="flex justify-center mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg text-center bg-gray-200 dark:bg-gray-700">
              <p className="text-lg text-gray-800 dark:text-gray-100">
                Number of Projects
              </p>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {stats.projectsCount}
              </span>
            </div>
            <div className="p-4 rounded-lg text-center bg-gray-200 dark:bg-gray-700">
              <p className="text-lg text-gray-800 dark:text-gray-100">
                Number of Tasks
              </p>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {stats.tasksCount}
              </span>
            </div>
            <div className="p-4 rounded-lg text-center bg-gray-200 dark:bg-gray-700">
              <p className="text-lg text-gray-800 dark:text-gray-100">
                Number of Finished Projects
              </p>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {stats.finishedProjectsCount}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-6">
          <div className="w-full max-w-4xl">
            <h2 className="text-xl font-semibold mb-4 text-center">
              Your Tasks
            </h2>
            <ul>
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className={`p-4 rounded-lg mb-3 ${
                    task.status === "Completed"
                      ? "bg-green-600"
                      : task.status === "In Progress"
                      ? "bg-yellow-500"
                      : task.status === "Pending"
                      ? "bg-gray-500"
                      : "bg-red-600"
                  } text-white`}
                >
                  <h3 className="text-lg">{task.title}</h3>
                  <p>Status: {task.status}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StuHome;
