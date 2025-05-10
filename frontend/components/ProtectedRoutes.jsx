import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";
import useAuth from "../hooks/useAuth";

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
      // Redirect to respective home based on actual role
      return <Navigate to={isAdmin ? "/home" : "/stu-home"} replace />;
    }
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredRole: PropTypes.oneOf(["admin", "student"]),
};

export default ProtectedRoute;
