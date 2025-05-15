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
  GET_PROJECTS_QUERY,
  GET_PROJECT_QUERY,
  CREATE_PROJECT_MUTATION,
  UPDATE_PROJECT_MUTATION,
  DELETE_PROJECT_MUTATION,
} from "./projects";

// Task queries and mutations
export {
  GET_TASKS_QUERY,
  GET_TASK_QUERY,
  GET_TASKS_BY_PROJECT_QUERY,
  GET_RECENT_TASKS_QUERY,
  CREATE_TASK_MUTATION,
  UPDATE_TASK_MUTATION,
  DELETE_TASK_MUTATION,
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
