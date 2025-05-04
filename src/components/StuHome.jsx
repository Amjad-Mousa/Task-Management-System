import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const StuHome = () => {
  const [datetime, setDatetime] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [username, setUsername] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    document.title = "StudentHome - Task Manager";
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setDatetime(
        now.toLocaleString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
    if (storedUser?.username) {
      setUsername(storedUser.username);
    }
  }, []);

  const stats = {
    projectsCount: 5,
    tasksCount: 10,
    finishedProjectsCount: 2,
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  };

  useEffect(() => {
    const studentTasks = [
      { id: 1, title: 'Task 1', status: 'In Progress' },
      { id: 2, title: 'Task 2', status: 'Completed' },
    ];
    setTasks(studentTasks);
  }, []);

  if (!tasks) {
    return <div>Loading tasks...</div>;
  }

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
          <div className="text-center text-xl mb-4">
            <h2 className="font-bold">Home</h2>
          </div>
          <div className="flex-1">
            <Link to="/stu-home" className="flex items-center gap-2 p-3 mb-3 bg-blue-600 rounded-md hover:bg-blue-700 ">
              <span>🏠</span> Home
            </Link>
            <Link to="/student-task" className="flex items-center gap-2 p-3 mb-3 bg-gray-700 rounded-md hover:bg-gray-800">
              <span>✅</span> Tasks
            </Link>
            <Link to="/student-chat" className="flex items-center gap-2 p-3 mb-3 bg-gray-700 rounded-md hover:bg-gray-800">
              <span>💬</span> Chat
            </Link>
          </div>
          <div className="mt-auto">
            <a href="/signin" onClick={handleLogout} className="flex items-center gap-2 p-3 bg-red-600 rounded-md hover:bg-red-700">
              <span>🚪</span> Logout
            </a>
          </div>
        </aside>

        <main className="flex-1 p-6 relative">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="absolute top-4 right-4 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          <header className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              Welcome, <span className="text-blue-600">{username || 'Student'}</span>
            </h1>
            <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md shadow">
              <span className="text-xl">⏰</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{datetime}</span>
            </div>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <p className="text-lg">Number of Projects</p>
              <span className="text-2xl font-bold">{stats.projectsCount}</span>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <p className="text-lg">Number of Tasks</p>
              <span className="text-2xl font-bold">{stats.tasksCount}</span>
            </div>
            <div className={`p-4 rounded-lg text-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <p className="text-lg">Number of Finished Projects</p>
              <span className="text-2xl font-bold">{stats.finishedProjectsCount}</span>
            </div>
          </div>

          <div className="w-full max-w-4xl mx-auto mb-6">
            <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
            <ul>
              {tasks.map((task) => (
                <li key={task.id} className={`p-4 rounded-lg mb-3 ${task.status === 'Completed' ? 'bg-green-600' : 'bg-yellow-600'} text-white`}>
                  <h3 className="text-lg">{task.title}</h3>
                  <p>Status: {task.status}</p>
                </li>
              ))}
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StuHome;
