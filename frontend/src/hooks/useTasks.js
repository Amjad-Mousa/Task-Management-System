import { useState, useCallback, useEffect } from "react";
import { useGraphQL } from "../Context/GraphQLContext";
import {
  GET_TASKS_QUERY,
  GET_TASK_QUERY,
  GET_TASKS_BY_PROJECT_QUERY,
  CREATE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
} from "../graphql/queries";

/**
 * Custom hook for managing tasks with GraphQL and caching
 * @returns {Object} Task management functions and state
 */
export const useTasks = () => {
  const { executeQuery, getCachedData } = useGraphQL();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cache expiration times
  const TASKS_CACHE_EXPIRATION = 2 * 60 * 1000; // 2 minutes

  /**
   * Fetch all tasks with caching
   * @param {boolean} forceRefresh - Whether to force a refresh from the server
   * @returns {Promise<Array>} - Array of tasks
   */
  const fetchTasks = useCallback(
    async (forceRefresh = false) => {
      try {
        setLoading(true);
        
        const data = await executeQuery(
          GET_TASKS_QUERY,
          {},
          true,
          !forceRefresh, // Use cache unless force refresh is requested
          TASKS_CACHE_EXPIRATION
        );

        if (data && data.tasks) {
          setTasks(data.tasks);
          setError(null);
          return data.tasks;
        } else {
          console.warn("No tasks found in response");
          setTasks([]);
          return [];
        }
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again later.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [executeQuery]
  );

  /**
   * Fetch a single task by ID
   * @param {string} taskId - Task ID
   * @param {boolean} forceRefresh - Whether to force a refresh from the server
   * @returns {Promise<Object>} - Task object
   */
  const fetchTaskById = useCallback(
    async (taskId, forceRefresh = false) => {
      try {
        setLoading(true);
        
        const data = await executeQuery(
          GET_TASK_QUERY,
          { id: taskId },
          true,
          !forceRefresh,
          TASKS_CACHE_EXPIRATION
        );

        if (data && data.task) {
          setError(null);
          return data.task;
        } else {
          console.warn(`No task found with ID: ${taskId}`);
          return null;
        }
      } catch (err) {
        console.error(`Error fetching task ${taskId}:`, err);
        setError(`Failed to load task. Please try again later.`);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [executeQuery]
  );

  /**
   * Fetch tasks by project ID
   * @param {string} projectId - Project ID
   * @param {boolean} forceRefresh - Whether to force a refresh from the server
   * @returns {Promise<Array>} - Array of tasks
   */
  const fetchTasksByProject = useCallback(
    async (projectId, forceRefresh = false) => {
      try {
        setLoading(true);
        
        const data = await executeQuery(
          GET_TASKS_BY_PROJECT_QUERY,
          { projectId },
          true,
          !forceRefresh,
          TASKS_CACHE_EXPIRATION
        );

        if (data && data.tasksByProject) {
          setError(null);
          return data.tasksByProject;
        } else {
          console.warn(`No tasks found for project: ${projectId}`);
          return [];
        }
      } catch (err) {
        console.error(`Error fetching tasks for project ${projectId}:`, err);
        setError(`Failed to load project tasks. Please try again later.`);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [executeQuery]
  );

  /**
   * Create a new task
   * @param {Object} taskData - Task data
   * @returns {Promise<Object>} - Created task
   */
  const createTask = useCallback(
    async (taskData) => {
      try {
        setLoading(true);
        
        const response = await executeQuery(
          CREATE_TASK_MUTATION,
          { input: taskData },
          true,
          false // Don't use cache for mutations
        );

        if (response && response.createTask) {
          // Refresh tasks after creating a new one
          await fetchTasks(true);
          setError(null);
          return response.createTask;
        } else {
          throw new Error("Failed to create task");
        }
      } catch (err) {
        console.error("Error creating task:", err);
        setError("Failed to create task. Please try again.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [executeQuery, fetchTasks]
  );

  /**
   * Update an existing task
   * @param {string} taskId - Task ID
   * @param {Object} taskData - Updated task data
   * @returns {Promise<Object>} - Updated task
   */
  const updateTask = useCallback(
    async (taskId, taskData) => {
      try {
        setLoading(true);
        
        const response = await executeQuery(
          UPDATE_TASK_MUTATION,
          {
            id: taskId,
            input: taskData,
          },
          true,
          false // Don't use cache for mutations
        );

        if (response && response.updateTask) {
          // Refresh tasks after updating
          await fetchTasks(true);
          setError(null);
          return response.updateTask;
        } else {
          throw new Error("Failed to update task");
        }
      } catch (err) {
        console.error(`Error updating task ${taskId}:`, err);
        setError("Failed to update task. Please try again.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [executeQuery, fetchTasks]
  );

  /**
   * Delete a task
   * @param {string} taskId - Task ID
   * @returns {Promise<Object>} - Deleted task
   */
  const deleteTask = useCallback(
    async (taskId) => {
      try {
        setLoading(true);
        
        const response = await executeQuery(
          DELETE_TASK_MUTATION,
          { id: taskId },
          true,
          false // Don't use cache for mutations
        );

        if (response && response.deleteTask) {
          // Refresh tasks after deleting
          await fetchTasks(true);
          setError(null);
          return response.deleteTask;
        } else {
          throw new Error("Failed to delete task");
        }
      } catch (err) {
        console.error(`Error deleting task ${taskId}:`, err);
        setError("Failed to delete task. Please try again.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [executeQuery, fetchTasks]
  );

  // Return the hook API
  return {
    tasks,
    loading,
    error,
    fetchTasks,
    fetchTaskById,
    fetchTasksByProject,
    createTask,
    updateTask,
    deleteTask,
  };
};

export default useTasks;
