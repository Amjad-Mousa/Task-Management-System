import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "./useLocalStorage";
import { executeGraphQL } from "../utils/graphqlClient";
import {
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  CREATE_USER_MUTATION,
  CURRENT_USER_QUERY,
  CREATE_STUDENT_MUTATION,
  CREATE_ADMIN_MUTATION,
  DELETE_USER_MUTATION,
} from "../graphql/queries";

/**
 * Custom hook for authentication functionality
 *
 * @returns {Object} Authentication methods and state
 */
const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser, removeUser] = useLocalStorage("user", null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if we have a user in local storage or session storage
        const sessionUser = sessionStorage.getItem("user")
          ? JSON.parse(sessionStorage.getItem("user"))
          : null;
        const storedUser = user || sessionUser;

        if (storedUser) {
          setIsAuthenticated(true);
          setIsAdmin(storedUser.role === "admin");
        } else {
          // If no stored user, check with the server using cookies
          try {
            const response = await executeGraphQL(CURRENT_USER_QUERY);
            const currentUser = response.me;

            if (currentUser) {
              const userData = {
                id: currentUser.id,
                username: currentUser.name,
                role: currentUser.role,
                isStudent: currentUser.role === "student",
              };

              // Store in session storage by default
              sessionStorage.setItem("user", JSON.stringify(userData));

              setIsAuthenticated(true);
              setIsAdmin(currentUser.role === "admin");
            } else {
              setIsAuthenticated(false);
              setIsAdmin(false);
            }
          } catch (error) {
            console.error("Error checking authentication with server:", error);
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [user]);

  // Sign in function
  const signIn = async (credentials, staySignedIn = false) => {
    setError(null);
    try {
      const { username, password } = credentials;

      const response = await executeGraphQL(LOGIN_MUTATION, {
        input: {
          name: username,
          password: password,
          rememberMe: staySignedIn,
        },
      });

      const { success, message, user: userData } = response.login;

      if (!success) {
        setError(message);
        return false;
      }

      // Transform user data to match our frontend format
      const transformedUser = {
        id: userData.id,
        username: userData.name,
        role: userData.role,
        isStudent: userData.role === "student",
      };

      // Store user data based on staySignedIn preference
      if (staySignedIn) {
        setUser(transformedUser);
        sessionStorage.removeItem("user");
      } else {
        sessionStorage.setItem("user", JSON.stringify(transformedUser));
        removeUser();
      }

      setIsAuthenticated(true);
      setIsAdmin(userData.role === "admin");

      // Redirect based on user role
      if (userData.role === "student") {
        navigate("/student-home");
      } else {
        navigate("/admin-home");
      }

      return true;
    } catch (error) {
      console.error("Sign in error:", error);
      setError(error.message || "Failed to sign in. Please try again.");
      return false;
    }
  };

  // Clear authentication without redirecting
  const clearAuth = async () => {
    try {
      // Call the logout mutation to clear server-side session
      await executeGraphQL(LOGOUT_MUTATION);

      // Clear local storage and state
      removeUser();
      sessionStorage.removeItem("user");
      setIsAuthenticated(false);
      setIsAdmin(false);
      return true;
    } catch (error) {
      console.error("Clear auth error:", error);

      // Even if the server request fails, clear local data
      removeUser();
      sessionStorage.removeItem("user");
      setIsAuthenticated(false);
      setIsAdmin(false);
      return false;
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      await clearAuth();
      navigate("/signin");
      return true;
    } catch (error) {
      console.error("Sign out error:", error);
      setError(error.message || "Failed to sign out. Please try again.");
      navigate("/signin");
      return false;
    }
  };

  // Sign up function
  const signUp = async (userData) => {
    setError(null);
    try {
      // Transform user data to match API format
      const input = {
        name: userData.username,
        email: userData.email || `${userData.username}@example.com`, // Fallback if email not provided
        password: userData.password,
        role: userData.isStudent ? "student" : "admin",
      };

      // First, create the user
      const userResponse = await executeGraphQL(CREATE_USER_MUTATION, {
        input,
      });

      if (!userResponse.createUser) {
        setError("Failed to create user account");
        return false;
      }

      try {
        // Now that we have the user ID, create the role-specific record
        if (userData.isStudent) {
          const studentInput = {
            user_id: userResponse.createUser.id,
            universityId: userData.universityId,
            major: userData.major,
            year: userData.year,
          };

          const studentResponse = await executeGraphQL(
            CREATE_STUDENT_MUTATION,
            {
              input: studentInput,
            }
          );

          if (!studentResponse.createStudent) {
            throw new Error("Failed to create student profile");
          }
        } else {
          const adminInput = {
            user_id: userResponse.createUser.id,
            permissions: ["read", "write"],
          };

          const adminResponse = await executeGraphQL(CREATE_ADMIN_MUTATION, {
            input: adminInput,
          });

          if (!adminResponse.createAdmin) {
            throw new Error("Failed to create admin profile");
          }
        }

        return true;
      } catch (profileError) {
        // If profile creation fails, delete the orphaned user
        try {
          await executeGraphQL(DELETE_USER_MUTATION, {
            id: userResponse.createUser.id,
          });
          console.log(
            "Cleaned up orphaned user after profile creation failure"
          );
        } catch (cleanupError) {
          console.error("Failed to clean up orphaned user:", cleanupError);
        }

        setError(profileError.message || "Failed to complete signup process");
        return false;
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setError(error.message || "Failed to sign up. Please try again.");
      return false;
    }
  };

  // Get current user
  const getCurrentUser = () => {
    return (
      user ||
      (sessionStorage.getItem("user")
        ? JSON.parse(sessionStorage.getItem("user"))
        : null)
    );
  };

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
    user: getCurrentUser(),
    error,
    signIn,
    signOut,
    signUp,
    clearAuth,
  };
};

export default useAuth;
