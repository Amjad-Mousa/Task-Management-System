/**
 * @file useLocalStorage.js - Custom hook for localStorage management
 * @module src/hooks/useLocalStorage
 */

import { useState, useEffect } from "react";

/**
 * Custom hook for working with localStorage
 * Provides persistent state with localStorage and syncs across tabs
 *
 * @param {string} key - The localStorage key
 * @param {any} initialValue - The initial value if key doesn't exist
 * @returns {Array} [storedValue, setValue, removeValue] - State value and functions
 */
const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Save state
      setStoredValue(valueToStore);

      // Save to local storage
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Function to remove the item from localStorage
  const removeValue = () => {
    try {
      localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
          console.error(
            `Error parsing localStorage change for key "${key}":`,
            error
          );
        }
      }
    };

    // Add event listener
    window.addEventListener("storage", handleStorageChange);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;
