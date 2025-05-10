/**
 * GraphQL queries and mutations related to tasks
 */

/**
 * Query to get all tasks
 */
export const GET_TASKS = `
  query GetTasks {
    tasks {
      id
      title
      description
      projectId
      assignedTo
      startDate
      dueDate
      status
      priority
      createdAt
      updatedAt
    }
  }
`;

/**
 * Query to get a single task by ID
 */
export const GET_TASK = `
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      projectId
      assignedTo
      startDate
      dueDate
      status
      priority
      createdAt
      updatedAt
    }
  }
`;

/**
 * Query to get tasks by project ID
 */
export const GET_TASKS_BY_PROJECT = `
  query GetTasksByProject($projectId: ID!) {
    tasksByProject(projectId: $projectId) {
      id
      title
      description
      projectId
      assignedTo
      startDate
      dueDate
      status
      priority
      createdAt
      updatedAt
    }
  }
`;

/**
 * Mutation to create a new task
 */
export const CREATE_TASK = `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      projectId
      assignedTo
      startDate
      dueDate
      status
      priority
    }
  }
`;

/**
 * Mutation to update an existing task
 */
export const UPDATE_TASK = `
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      description
      projectId
      assignedTo
      startDate
      dueDate
      status
      priority
    }
  }
`;

/**
 * Mutation to delete a task
 */
export const DELETE_TASK = `
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
    }
  }
`;
