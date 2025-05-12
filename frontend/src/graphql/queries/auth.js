/**
 * GraphQL queries and mutations related to authentication
 */

/**
 * Login mutation
 */
export const LOGIN_MUTATION = `
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      success
      message
      user {
        id
        name
        email
        role
      }
    }
  }
`;

/**
 * Create user mutation (signup)
 */
export const CREATE_USER_MUTATION = `
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      role
    }
  }
`;

/**
 * Logout mutation
 */
export const LOGOUT_MUTATION = `
  mutation Logout {
    logout {
      success
      message
    }
  }
`;

/**
 * Current user query
 */
export const CURRENT_USER_QUERY = `
  query Me {
    me {
      id
      name
      email
      role
    }
  }
`;
