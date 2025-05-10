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

// User queries and mutations (common to both student and admin)
export {
  GET_USERS_QUERY,
  GET_USER_QUERY,
  UPDATE_USER_MUTATION,
  DELETE_USER_MUTATION,
} from "./users";

// Student-specific queries and mutations
export {
  CREATE_STUDENT_MUTATION,
  DELETE_STUDENT_MUTATION,
  UPDATE_STUDENT_MUTATION,
  GET_STUDENTS_QUERY,
  GET_STUDENT_QUERY,
  GET_STUDENT_BY_USER_QUERY,
  GET_STUDENT_USER_QUERY,
} from "./student";

// Admin-specific queries and mutations
export {
  CREATE_ADMIN_MUTATION,
  DELETE_ADMIN_MUTATION,
  UPDATE_ADMIN_MUTATION,
  GET_ADMINS_QUERY,
  GET_ADMIN_QUERY,
  GET_ADMIN_BY_USER_QUERY,
  GET_ADMIN_USER_QUERY,
} from "./admin";
