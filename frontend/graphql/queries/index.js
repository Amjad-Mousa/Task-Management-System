/**
 * Export all GraphQL queries and mutations
 */

// Auth queries and mutations
export {
  LOGIN_MUTATION,
  CREATE_USER_MUTATION,
  LOGOUT_MUTATION,
  CURRENT_USER_QUERY,
} from "./auth";

// Project queries and mutations
export {
  GET_PROJECTS,
  GET_PROJECT,
  CREATE_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT,
} from "./projects";

// Task queries and mutations
export {
  GET_TASKS,
  GET_TASK,
  GET_TASKS_BY_PROJECT,
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
} from "./tasks";

// User queries and mutations
export { GET_USERS, GET_USER, UPDATE_USER, DELETE_USER } from "./users";
