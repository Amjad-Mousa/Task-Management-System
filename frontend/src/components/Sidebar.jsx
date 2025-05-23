import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { DarkModeContext } from "../Context/DarkModeContext";
import useAuth from "../hooks/useAuth";

/**
 * @file Sidebar.jsx - Navigation sidebar component
 * @module components/Sidebar
 */

/**
 * Sidebar component for dashboard navigation
 * @component
 * @param {Object} props - Component props
 * @param {('admin'|'student')} [props.role='admin'] - User role
 * @returns {React.ReactElement} Rendered Sidebar component
 */
const Sidebar = ({ role = "admin" }) => {
  const location = useLocation();
  const { isDarkMode } = useContext(DarkModeContext);
  const { signOut } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
  };

  // Admin navigation links
  const adminLinks = [
    { path: "/admin-home", icon: "🏠", label: "Home" },
    { path: "/admin-projects", icon: "📂", label: "Projects" },
    { path: "/admin-tasks", icon: "✅", label: "Tasks" },
    { path: "/admin-chat", icon: "💬", label: "Chat" },
  ];

  // Student navigation links
  const studentLinks = [
    { path: "/student-home", icon: "🏠", label: "Home" },
    { path: "/student-task", icon: "✅", label: "Tasks" },
    { path: "/student-chat", icon: "💬", label: "Chat" },
  ];

  const links = role === "student" ? studentLinks : adminLinks;
  const title = role === "student" ? "Student Dashboard" : "Admin Dashboard";

  return (
    <aside
      className={`w-64 p-4 flex flex-col transition-colors duration-300 ${
        isDarkMode
          ? "bg-gray-800 text-white border-gray-700"
          : "bg-gray-100 text-gray-800 border-gray-200"
      }`}
    >
      <div className="text-center text-xl font-bold mb-6">{title}</div>

      <nav className="flex-1 space-y-2">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-2 px-4 py-3 rounded-md transition-all duration-200 btn-hover-effect ${
              isActive(link.path)
                ? "bg-blue-600 text-white"
                : isDarkMode
                ? "bg-gray-700 text-gray-100 hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            data-tooltip={`Go to ${link.label}`}
          >
            <span className="text-lg">{link.icon}</span>
            <span className="nav-link-hover">{link.label}</span>
          </Link>
        ))}
      </nav>

      <div
        className={`mt-6 pt-4 border-t ${
          isDarkMode ? "border-gray-700" : "border-gray-300"
        }`}
      >
        <button
          onClick={handleLogout}
          className={`flex w-full items-center gap-2 px-4 py-3 rounded-md transition-all duration-200 btn-hover-effect tooltip ${
            isDarkMode
              ? "bg-gray-700 hover:bg-gray-600 text-red-300"
              : "bg-gray-200 hover:bg-gray-300 text-red-600"
          }`}
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
