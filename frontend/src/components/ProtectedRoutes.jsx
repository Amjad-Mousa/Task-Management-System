import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import useAuth from "../hooks/useAuth";

/**
 * @file ProtectedRoutes.jsx - Route protection component
 * @module components/ProtectedRoutes
 */

/**
 * Component that protects routes based on authentication and role requirements
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {('admin'|'student')} [props.requiredRole] - Role required to access the route
 * @returns {React.ReactElement} Rendered component or redirect
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (requiredRole) {
    const isStudent = !isAdmin;
    const roleMatch =
      (requiredRole === "admin" && isAdmin) ||
      (requiredRole === "student" && isStudent);

    if (!roleMatch) {
      return (
        <Navigate to={isAdmin ? "/admin-home" : "/student-home"} replace />
      );
    }
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.oneOf(["admin", "student"]),
};

export default ProtectedRoute;
