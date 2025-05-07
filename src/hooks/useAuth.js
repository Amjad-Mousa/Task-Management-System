import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useLocalStorage from './useLocalStorage';

/**
 * Custom hook for authentication functionality
 * 
 * @returns {Object} Authentication methods and state
 */
const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser, removeUser] = useLocalStorage('user', null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = () => {
      const sessionUser = JSON.parse(sessionStorage.getItem('user'));
      const currentUser = user || sessionUser;
      
      if (currentUser) {
        setIsAuthenticated(true);
        setIsAdmin(!currentUser.isStudent);
      } else {
        setIsAuthenticated(false);
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, [user]);

  // Sign in function
  const signIn = (userData, staySignedIn = false) => {
    if (staySignedIn) {
      setUser(userData);
      sessionStorage.removeItem('user');
    } else {
      sessionStorage.setItem('user', JSON.stringify(userData));
      removeUser();
    }
    
    setIsAuthenticated(true);
    setIsAdmin(!userData.isStudent);
    
    // Redirect based on user role
    if (userData.isStudent) {
      navigate('/stu-home');
    } else {
      navigate('/home');
    }
    
    return true;
  };

  // Sign out function
  const signOut = () => {
    removeUser();
    sessionStorage.removeItem('user');
    setIsAuthenticated(false);
    setIsAdmin(false);
    navigate('/signin');
  };

  // Sign up function
  const signUp = (userData) => {
    // In a real app, this would make an API call
    // For now, we'll just store in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
    return true;
  };

  // Get current user
  const getCurrentUser = () => {
    return user || JSON.parse(sessionStorage.getItem('user'));
  };

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
    user: getCurrentUser(),
    signIn,
    signOut,
    signUp,
  };
};

export default useAuth;
