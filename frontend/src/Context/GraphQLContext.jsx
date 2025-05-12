/**
 * @file GraphQLContext.jsx - Context provider for GraphQL operations
 * @module src/Context/GraphQLContext
 */

import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { executeGraphQL } from "../utils/graphqlClient";

/**
 * GraphQL context for managing GraphQL operations and caching
 * @type {React.Context}
 */
const GraphQLContext = createContext();

/**
 * Custom hook to use the GraphQL context
 * @returns {Object} GraphQL context value
 */
export const useGraphQL = () => {
  const context = useContext(GraphQLContext);
  if (!context) {
    throw new Error("useGraphQL must be used within a GraphQLProvider");
  }
  return context;
};

/**
 * GraphQL Provider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export const GraphQLProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const queryCache = useRef({});
  const cacheTimestamps = useRef({});
  // Default cache expiration time (5 minutes)
  const DEFAULT_CACHE_EXPIRATION = 5 * 60 * 1000;

  useEffect(() => {
    try {
      const storedCache = sessionStorage.getItem("graphqlQueryCache");
      const storedTimestamps = sessionStorage.getItem("graphqlCacheTimestamps");

      if (storedCache) {
        queryCache.current = JSON.parse(storedCache);
      }

      if (storedTimestamps) {
        cacheTimestamps.current = JSON.parse(storedTimestamps);
      }
    } catch (err) {
      console.error("Error loading cache from sessionStorage:", err);
      queryCache.current = {};
      cacheTimestamps.current = {};
    }
  }, []);

  const saveCache = useCallback(() => {
    try {
      sessionStorage.setItem(
        "graphqlQueryCache",
        JSON.stringify(queryCache.current)
      );
      sessionStorage.setItem(
        "graphqlCacheTimestamps",
        JSON.stringify(cacheTimestamps.current)
      );
    } catch (err) {
      console.error("Error saving cache to sessionStorage:", err);
    }
  }, []);

  /**
   * Clear the entire cache or a specific query from the cache
   * @param {string} queryKey - Optional query key to clear specific cache entry
   */
  const clearCache = useCallback(
    (queryKey = null) => {
      if (queryKey) {
        if (queryCache.current[queryKey]) {
          delete queryCache.current[queryKey];
          delete cacheTimestamps.current[queryKey];
        }
      } else {
        queryCache.current = {};
        cacheTimestamps.current = {};
      }

      saveCache();
    },
    [saveCache]
  );

  /**
   * Check if a cache entry is expired
   * @param {string} cacheKey - Cache key to check
   * @param {number} expirationTime - Cache expiration time in milliseconds
   * @returns {boolean} - Whether the cache entry is expired
   */
  const isCacheExpired = useCallback(
    (cacheKey, expirationTime = DEFAULT_CACHE_EXPIRATION) => {
      const timestamp = cacheTimestamps.current[cacheKey];
      if (!timestamp) return true;

      return Date.now() - timestamp > expirationTime;
    },
    []
  );

  /**
   * Generate a cache key from query and variables
   * @param {string} query - GraphQL query string
   * @param {Object} variables - Query variables
   * @returns {string} - Cache key
   */
  const generateCacheKey = useCallback((query, variables) => {
    return `${query}:${JSON.stringify(variables || {})}`;
  }, []);

  /**
   * Execute a GraphQL query or mutation with loading and error handling
   * @param {string} query - GraphQL query or mutation string
   * @param {Object} variables - Variables for the query/mutation
   * @param {boolean} includeCredentials - Whether to include credentials in the request
   * @param {boolean} useCache - Whether to use cache for this query (default: true for queries, false for mutations)
   * @param {number} cacheExpiration - Cache expiration time in milliseconds (default: 5 minutes)
   * @returns {Promise<Object>} - Response data
   */
  const executeQuery = useCallback(
    async (
      query,
      variables = {},
      includeCredentials = true,
      useCache = !query.trim().toUpperCase().startsWith("MUTATION"),
      cacheExpiration = DEFAULT_CACHE_EXPIRATION
    ) => {
      setLoading(true);
      setError(null);

      const cacheKey = generateCacheKey(query, variables);

      const isMutation = query.trim().toUpperCase().startsWith("MUTATION");

      if (isMutation) {
        if (
          query.includes("createProject") ||
          query.includes("updateProject") ||
          query.includes("deleteProject")
        ) {
          Object.keys(queryCache.current).forEach((key) => {
            if (key.includes("GetProjects") || key.includes("GetProject")) {
              delete queryCache.current[key];
              delete cacheTimestamps.current[key];
            }
          });
        }

        if (
          query.includes("createTask") ||
          query.includes("updateTask") ||
          query.includes("deleteTask")
        ) {
          Object.keys(queryCache.current).forEach((key) => {
            if (key.includes("GetTasks") || key.includes("GetTask")) {
              delete queryCache.current[key];
              delete cacheTimestamps.current[key];
            }
          });
        }

        saveCache();
      }

      if (
        useCache &&
        queryCache.current[cacheKey] &&
        !isCacheExpired(cacheKey, cacheExpiration)
      ) {
        setLoading(false);
        return queryCache.current[cacheKey];
      }

      try {
        const data = await executeGraphQL(query, variables, includeCredentials);

        if (useCache && !isMutation) {
          queryCache.current[cacheKey] = data;
          cacheTimestamps.current[cacheKey] = Date.now();
          saveCache();
        }

        return data;
      } catch (err) {
        setError(
          err.message || "An error occurred while executing the GraphQL query"
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [generateCacheKey, isCacheExpired, saveCache]
  );

  /**
   * Get cached data for a query if available
   * @param {string} query - GraphQL query string
   * @param {Object} variables - Variables for the query
   * @returns {Object|null} - Cached data or null if not available
   */
  const getCachedData = useCallback(
    (query, variables = {}) => {
      const cacheKey = generateCacheKey(query, variables);
      if (queryCache.current[cacheKey] && !isCacheExpired(cacheKey)) {
        return queryCache.current[cacheKey];
      }
      return null;
    },
    [generateCacheKey, isCacheExpired]
  );

  const value = useMemo(
    () => ({
      loading,
      error,
      executeQuery,
      clearCache,
      getCachedData,
    }),
    [loading, error, executeQuery, clearCache, getCachedData]
  );

  return (
    <GraphQLContext.Provider value={value}>{children}</GraphQLContext.Provider>
  );
};

export default GraphQLProvider;
