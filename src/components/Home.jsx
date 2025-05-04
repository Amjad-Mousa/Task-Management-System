import { useEffect, useState } from 'react';
import DashboardChart from './DashboardChart';

const Home = () => {
  const [datetime, setDatetime] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [username, setUsername] = useState('');

  useEffect(() => {
    document.title = "AdminHomePage | Task Manager";
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
    studentsCount: 20,
    tasksCount: 10,
    finishedProjectsCount: 2,
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
          <div className="text-center text-2xl font-bold mb-6">Home</div>

          <nav className="flex-1 space-y-3">
            <a href="/home" className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700">
              🏠 Home
            </a>
            <a href="/projects" className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded hover:bg-gray-800">
              📂 Projects
            </a>
            <a href="/tasks" className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded hover:bg-gray-800">
              ✅ Tasks
            </a>
            <a href="/chat" className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded hover:bg-gray-800">
              💬 Chat
            </a>
          </nav>

          <div className="mt-4">
            <a
              href="/signin"
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700"
            >
              🚪 Logout
            </a>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 relative overflow-y-auto">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="absolute top-4 right-4 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
          >
            {isDarkMode ? 'Light Mode' : 'Dark Mode'}
          </button>

          {/* Header with welcome and time */}
          <header className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Welcome message */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-2">
                  👋 Welcome, <span className="text-blue-600 dark:text-blue-400">{username || 'Admin'}</span>
                </h1>
              </div>
            </div>

            {/* Date & Time */}
            <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md shadow">
              <span className="text-xl">⏰</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{datetime}</span>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg text-center shadow ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <p className="text-lg mb-1 text-gray-800 dark:text-gray-100">Projects</p>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.projectsCount}</span>
            </div>
            <div className={`p-4 rounded-lg text-center shadow ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <p className="text-lg mb-1 text-gray-800 dark:text-gray-100">Students</p>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.studentsCount}</span>
            </div>
            <div className={`p-4 rounded-lg text-center shadow ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <p className="text-lg mb-1 text-gray-800 dark:text-gray-100">Tasks</p>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.tasksCount}</span>
            </div>
            <div className={`p-4 rounded-lg text-center shadow ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <p className="text-lg mb-1 text-gray-800 dark:text-gray-100">Finished Projects</p>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.finishedProjectsCount}</span>
            </div>
          </div>

          {/* Chart Section */}
          <div className="w-full max-w-4xl mx-auto">
            <DashboardChart stats={stats} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
