import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { executeGraphQL } from "../utils/graphqlClient";

// Create GraphQL context
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
  // Cache for storing query results
  const queryCache = useRef({});

  /**
   * Clear the entire cache or a specific query from the cache
   * @param {string} queryKey - Optional query key to clear specific cache entry
   */
  const clearCache = useCallback((queryKey = null) => {
    if (queryKey) {
      // Clear specific query cache
      if (queryCache.current[queryKey]) {
        delete queryCache.current[queryKey];
      }
    } else {
      // Clear entire cache
      queryCache.current = {};
    }
  }, []);

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
   * @returns {Promise<Object>} - Response data
   */
  const executeQuery = useCallback(
    async (
      query,
      variables = {},
      includeCredentials = true,
      useCache = !query.trim().toUpperCase().startsWith("MUTATION")
    ) => {
      setLoading(true);
      setError(null);

      // Generate cache key
      const cacheKey = generateCacheKey(query, variables);

      // Check if this is a mutation (which should invalidate cache)
      const isMutation = query.trim().toUpperCase().startsWith("MUTATION");

      // If it's a mutation, clear related caches
      if (isMutation) {
        // Clear specific caches based on the mutation type
        if (
          query.includes("createProject") ||
          query.includes("updateProject") ||
          query.includes("deleteProject")
        ) {
          // Clear any project-related queries
          Object.keys(queryCache.current).forEach((key) => {
            if (key.includes("GetProjects") || key.includes("GetProject")) {
              delete queryCache.current[key];
            }
          });
        }
      }

      // Return cached result if available and cache should be used
      if (useCache && queryCache.current[cacheKey]) {
        setLoading(false);
        return queryCache.current[cacheKey];
      }

      try {
        const data = await executeGraphQL(query, variables, includeCredentials);

        // Cache the result if it's not a mutation and caching is enabled
        if (useCache && !isMutation) {
          queryCache.current[cacheKey] = data;
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
    [generateCacheKey]
  );

  // Context value
  const value = useMemo(
    () => ({
      loading,
      error,
      executeQuery,
      clearCache,
    }),
    [loading, error, executeQuery, clearCache]
  );

  return (
    <GraphQLContext.Provider value={value}>{children}</GraphQLContext.Provider>
  );
};

export default GraphQLProvider;
