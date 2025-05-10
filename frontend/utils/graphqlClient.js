/**
 * GraphQL client utility for making API requests
 * Uses the fetch API to send GraphQL queries and mutations
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/graphql";

/**
 * Execute a GraphQL query or mutation
 *
 * @param {string} query - GraphQL query or mutation string
 * @param {Object} variables - Variables for the query/mutation
 * @param {boolean} includeCredentials - Whether to include credentials in the request
 * @returns {Promise<Object>} - Response data
 */
export const executeGraphQL = async (
  query,
  variables = {},
  includeCredentials = true
) => {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      credentials: includeCredentials ? "include" : "same-origin",
    });

    // Check if the response is ok
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", errorText);
      throw new Error(
        `Server error: ${response.status} ${response.statusText}`
      );
    }

    // Check if response has content
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      console.error("Invalid response format:", text);
      throw new Error("Server returned non-JSON response");
    }

    // Parse JSON safely
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Failed to parse server response as JSON");
    }

    // Check for GraphQL errors
    if (result.errors) {
      console.error("GraphQL errors:", result.errors);
      throw new Error(result.errors[0].message || "GraphQL error occurred");
    }

    return result.data;
  } catch (error) {
    console.error("GraphQL request failed:", error);
    throw error;
  }
};
