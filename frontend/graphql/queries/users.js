/**
 * GraphQL queries and mutations related to users
 */

/**
 * Query to get all users
 */
export const GET_USERS_QUERY = `
  query GetUsers {
    users {
      id
      name
      email
      role
      createdAt
      updatedAt
    }
  }
`;

/**
 * Query to get a single user by ID
 */
export const GET_USER_QUERY = `
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      role
      createdAt
      updatedAt
    }
  }
`;

/**
 * Mutation to update an existing user
 */
export const UPDATE_USER_MUTATION = `
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      name
      email
      role
    }
  }
`;

/**
 * Mutation to delete a user
 */
export const DELETE_USER_MUTATION = `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
    }
  }
`;
