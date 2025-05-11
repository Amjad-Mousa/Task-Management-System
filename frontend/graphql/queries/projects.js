/**
 * GraphQL queries and mutations related to projects
 */

/**
 * Query to get all projects
 */
export const GET_PROJECTS_QUERY = `
  query GetProjects {
    projects {
      id
      projectName
      projectCategory
      projectDescription
      startDate
      endDate
      status
      progress
      createdBy {
        id
        user {
          id
          name
        }
      }
      studentsWorkingOn {
        id
        user {
          id
          name
        }
      }
      tasks
      createdAt
      updatedAt
    }
  }
`;

/**
 * Query to get a single project by ID
 */
export const GET_PROJECT_QUERY = `
  query GetProject($id: ID!) {
    project(id: $id) {
      id
      projectName
      projectCategory
      projectDescription
      startDate
      endDate
      status
      progress
      createdBy {
        id
        user {
          id
          name
        }
      }
      studentsWorkingOn {
        id
        user {
          id
          name
        }
      }
      tasks
      createdAt
      updatedAt
    }
  }
`;

/**
 * Mutation to create a new project
 */
export const CREATE_PROJECT_MUTATION = `
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      projectName
      projectCategory
      projectDescription
      startDate
      endDate
      status
      progress
      studentsWorkingOn {
        id
      }
    }
  }
`;

/**
 * Mutation to update an existing project
 */
export const UPDATE_PROJECT_MUTATION = `
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      projectName
      projectCategory
      projectDescription
      startDate
      endDate
      status
      progress
      studentsWorkingOn {
        id
      }
    }
  }
`;

/**
 * Mutation to delete a project
 */
export const DELETE_PROJECT_MUTATION = `
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      id
    }
  }
`;
