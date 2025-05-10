import { createContext, useContext, useState } from "react";
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

  /**
   * Execute a GraphQL query or mutation with loading and error handling
   * @param {string} query - GraphQL query or mutation string
   * @param {Object} variables - Variables for the query/mutation
   * @param {boolean} includeCredentials - Whether to include credentials in the request
   * @returns {Promise<Object>} - Response data
   */
  const executeQuery = async (query, variables = {}, includeCredentials = true) => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await executeGraphQL(query, variables, includeCredentials);
      return data;
    } catch (err) {
      setError(err.message || "An error occurred while executing the GraphQL query");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Context value
  const value = {
    loading,
    error,
    executeQuery,
  };

  return (
    <GraphQLContext.Provider value={value}>
      {children}
    </GraphQLContext.Provider>
  );
};

export default GraphQLProvider;
