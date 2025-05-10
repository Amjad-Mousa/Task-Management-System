/**
 * GraphQL queries and mutations related to projects
 */

/**
 * Query to get all projects
 */
export const GET_PROJECTS = `
  query GetProjects {
    projects {
      id
      title
      description
      startDate
      endDate
      status
      createdAt
      updatedAt
    }
  }
`;

/**
 * Query to get a single project by ID
 */
export const GET_PROJECT = `
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      title
      description
      startDate
      endDate
      status
      createdAt
      updatedAt
    }
  }
`;

/**
 * Mutation to create a new project
 */
export const CREATE_PROJECT = `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      title
      description
      startDate
      endDate
      status
    }
  }
`;

/**
 * Mutation to update an existing project
 */
export const UPDATE_PROJECT = `
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      title
      description
      startDate
      endDate
      status
    }
  }
`;

/**
 * Mutation to delete a project
 */
export const DELETE_PROJECT = `
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      id
    }
  }
`;
