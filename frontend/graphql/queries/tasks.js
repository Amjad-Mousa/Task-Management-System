/**
 * GraphQL queries and mutations related to tasks
 */

/**
 * Query to get all tasks
 */
export const GET_TASKS_QUERY = `
  query GetTasks {
    tasks {
      id
      title
      description
      dueDate
      status
      assignedAdmin {
        id
        name
      }
      assignedStudent {
        id
        user_id
      }
      assignedProject {
        id
        title
      }
      createdAt
      updatedAt
    }
  }
`;

/**
 * Query to get a single task by ID
 */
export const GET_TASK_QUERY = `
  query GetTask($id: ID!) {
    task(id: $id) {
      id
      title
      description
      dueDate
      status
      assignedAdmin {
        id
        name
      }
      assignedStudent {
        id
        user_id
      }
      assignedProject {
        id
        title
      }
      createdByAdmin {
        id
        name
      }
      createdAt
      updatedAt
    }
  }
`;

/**
 * Query to get tasks by project ID
 */
export const GET_TASKS_BY_PROJECT_QUERY = `
  query GetTasksByProject($projectId: ID!) {
    tasksByProject(projectId: $projectId) {
      id
      title
      description
      dueDate
      status
      assignedAdmin {
        id
        name
      }
      assignedStudent {
        id
        user_id
      }
      createdAt
      updatedAt
    }
  }
`;

/**
 * Query to get the most recent tasks
 */
export const GET_RECENT_TASKS_QUERY = `
  query GetRecentTasks($limit: Int) {
    recentTasks(limit: $limit) {
      id
      title
      description
      status
      dueDate
      assignedStudent {
        id
        user_id
      }
      updatedAt
    }
  }
`;

/**
 * Mutation to create a new task
 */
export const CREATE_TASK_MUTATION = `
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      dueDate
      status
      assignedAdmin {
        id
      }
      assignedStudent {
        id
      }
      assignedProject {
        id
      }
    }
  }
`;

/**
 * Mutation to update an existing task
 */
export const UPDATE_TASK_MUTATION = `
  mutation UpdateTask($id: ID!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      description
      dueDate
      status
      assignedAdmin {
        id
      }
      assignedStudent {
        id
      }
      assignedProject {
        id
      }
    }
  }
`;

/**
 * Mutation to delete a task
 */
export const DELETE_TASK_MUTATION = `
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
    }
  }
`;
