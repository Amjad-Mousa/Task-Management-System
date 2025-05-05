import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Tasks = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [datetime, setDatetime] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState('');
  const [tasks, setTasks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'project', direction: 'asc' });
  const [sortBy, setSortBy] = useState('project');
  const [taskToRemove, setTaskToRemove] = useState(null); 

  useEffect(() => {
    document.title = 'TasksManagement | Task Manager';
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
    const storedUser = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
    if (storedUser?.username) {
      setUsername(storedUser.username);
      setUserRole(storedUser.role);
    }
  }, []);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const defaultTasks = userRole === 'admin' ? [
      {
        id: 1,
        project: 'Website Redesign',
        taskName: 'Design Homepage',
        description: 'Create a responsive design for the homepage.',
        assignedStudent: 'All Yaseen',
        status: 'In Progress',
        dueDate: '4/22/2023',
      },
      {
        id: 2,
        project: 'Website Redesign',
        taskName: 'Develop API',
        description: 'Set up the backend API for the project.',
        assignedStudent: 'Braz Aeesh',
        status: 'Completed',
        dueDate: '1/16/2023',
      }
    ] : [
      {
        id: 1,
        project: 'Website Redesign',
        taskName: 'Design Homepage',
        description: 'Create a responsive design for the homepage.',
        assignedStudent: 'You',
        status: 'In Progress',
        dueDate: '4/22/2023',
      }
    ];
    
    setTasks([...defaultTasks, ...storedTasks]);
  }, [userRole]);

  const getStatusColor = (status) => {
    const normalizedStatus = status.toLowerCase().replace(' ', '');
    switch (normalizedStatus) {
      case 'completed': return 'bg-green-500';
      case 'inprogress': return 'bg-yellow-500';
      case 'pending':
      case 'notstarted': 
      default: return 'bg-gray-500';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    navigate('/signin');
  };

  const isActive = (path) =>
    location.pathname === path ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white';

  const sortTasks = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setTasks(sortedTasks);
  };

  const handleSortByChange = (event) => {
    setSortBy(event.target.value);
    sortTasks(event.target.value);
  };

  const removeTask = () => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskToRemove));
    setTaskToRemove(null);
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
        <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
          <div className="text-center text-2xl font-bold mb-6">Tasks Manager</div>
          <nav className="flex-1 space-y-3">
            <a href="/home" className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-blue-700 ${isActive('/home')}`}>
              🏠 Home
            </a>
            <a href="/projects" className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-800 ${isActive('/projects')}`}>
              📂 Projects
            </a>
            <a href="/tasks" className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-800 ${isActive('/tasks')}`}>
              ✅ Tasks
            </a>
            <a href="/chat" className={`flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-800 ${isActive('/chat')}`}>
              💬 Chat
            </a>
          </nav>
          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 rounded hover:bg-red-700 w-full"
            >
              🚪 Logout
            </button>
          </div>
        </aside>

        <main className="flex-1 p-6 relative overflow-y-auto">
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => navigate('/add-task')}
            >
              ➕ Add Task
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-black dark:text-white rounded"
            >
              {isDarkMode ? '🌞 Light' : '🌙 Dark'}
            </button>
          </div>

          <header className="mb-6">
            <h1 className="text-3xl font-bold mb-2">
              Welcome, <span className="text-blue-600 dark:text-blue-400">{username}</span>
            </h1>
            <div className="mt-2 flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md shadow">
              <span className="text-xl">⏰</span>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{datetime}</span>
            </div>
          </header>

          <div className="mb-4">
            <label htmlFor="sortBy" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Sort By:
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={handleSortByChange}
              className="ml-2 p-2 bg-gray-200 dark:bg-gray-700 text-black dark:text-white rounded"
            >
              <option value="project">Project</option>
              <option value="taskName">Task</option>
              <option value="assignedStudent">Assigned To</option>
              <option value="status">Status</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>

          <div className="w-full overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-800">
                <tr>
                  {['Project', 'Task', 'Description', 'Assigned To', 'Status', 'Due Date', 'Actions'].map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => sortTasks(header.toLowerCase().replace(' ', ''))}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {task.project}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {task.taskName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {task.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {task.assignedStudent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 text-sm font-semibold text-white rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {task.dueDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      <button
                        onClick={() => setTaskToRemove(task.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Confirm remove task modal */}
          {taskToRemove && (
            <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center">
                <p className="text-lg">Are you sure you want to remove this task?</p>
                <div className="mt-4 flex justify-center gap-4">
                  <button
                    onClick={removeTask}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setTaskToRemove(null)}
                    className="bg-gray-300 dark:bg-gray-700 text-black dark:text-white px-4 py-2 rounded hover:bg-gray-400"
                  >
                    No
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Tasks;
