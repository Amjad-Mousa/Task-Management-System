import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({ role = 'admin', username = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    navigate('/signin');
  };

  // Admin navigation links
  const adminLinks = [
    { path: '/home', icon: '🏠', label: 'Home' },
    { path: '/projects', icon: '📂', label: 'Projects' },
    { path: '/tasks', icon: '✅', label: 'Tasks' },
    { path: '/chat', icon: '💬', label: 'Chat' },
  ];

  // Student navigation links
  const studentLinks = [
    { path: '/stu-home', icon: '🏠', label: 'Home' },
    { path: '/student-task', icon: '✅', label: 'Tasks' },
    { path: '/student-chat', icon: '💬', label: 'Chat' },
  ];

  const links = role === 'student' ? studentLinks : adminLinks;
  const title = role === 'student' ? 'Student Dashboard' : 'Admin Dashboard';

  return (
    <aside className="w-64 bg-gray-800 text-white p-4 flex flex-col">
      <div className="text-center text-xl font-bold mb-6">
        {title}
      </div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-2 px-4 py-3 rounded-md transition-all duration-200 btn-hover-effect ${
              isActive(link.path)
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-100 hover:bg-gray-600'
            }`}
            data-tooltip={`Go to ${link.label}`}
          >
            <span className="text-lg">{link.icon}</span>
            <span className="nav-link-hover">{link.label}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 px-4 py-3 bg-red-600 rounded-md hover:bg-red-700 transition-all duration-200 btn-hover-effect tooltip"
          data-tooltip="Log out of your account"
        >
          <span className="text-lg">🚪</span>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
