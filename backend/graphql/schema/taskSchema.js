/**
 * Task Schema
 *
 * Defines GraphQL types, queries, and mutations for task operations.
 *
 * @module graphql/schema/taskSchema
 */
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInputObjectType,
} = require("graphql");
const { AdminType } = require("./adminSchema");
const { StudentType } = require("./studentSchema");
const taskResolvers = require("../resolver/taskResolver");

/**
 * GraphQL Task Type
 * Represents a task in the system
 * @type {GraphQLObjectType}
 */
const TaskType = new GraphQLObjectType({
  name: "Task",
  fields: () => ({
    id: { type: GraphQLID },
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Title of the task",
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Description of the task",
    },
    dueDate: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Due date of the task",
    },
    status: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Status of the task",
    },
    assignedAdmin: {
      type: AdminType,
      description: "Admin assigned to the task",
      resolve: taskResolvers.getTaskAssignedAdmin,
    },
    assignedStudent: {
      type: StudentType,
      description: "Student assigned to the task",
      resolve: taskResolvers.getTaskAssignedStudent,
    },
    assignedProject: {
      type: GraphQLID,
      description: "Project ID assigned to the task",
      resolve: taskResolvers.getTaskAssignedProject,
    },
    createdByAdmin: {
      type: AdminType,
      description: "Admin who created the task",
      resolve: taskResolvers.getTaskCreatedByAdmin,
    },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

/**
 * GraphQL Input Type for creating a new task
 * @type {GraphQLInputObjectType}
 */
const CreateTaskInput = new GraphQLInputObjectType({
  name: "CreateTaskInput",
  fields: () => ({
    title: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Title of the task",
    },
    description: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Description of the task",
    },
    dueDate: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Due date of the task",
    },
    status: {
      type: GraphQLString,
      description: "Status of the task",
    },
    assignedAdminId: {
      type: new GraphQLNonNull(GraphQLID),
      description: "ID of admin assigned to the task",
    },
    assignedStudentId: {
      type: GraphQLID,
      description: "ID of student assigned to the task",
    },
    assignedProjectId: {
      type: new GraphQLNonNull(GraphQLID),
      description: "ID of project assigned to the task",
    },
    createdByAdminId: {
      type: new GraphQLNonNull(GraphQLID),
      description: "ID of admin who created the task",
    },
  }),
});

/**
 * GraphQL Input Type for updating a task
 * @type {GraphQLInputObjectType}
 */
const UpdateTaskInput = new GraphQLInputObjectType({
  name: "UpdateTaskInput",
  fields: () => ({
    title: {
      type: GraphQLString,
      description: "Title of the task",
    },
    description: {
      type: GraphQLString,
      description: "Description of the task",
    },
    dueDate: {
      type: GraphQLString,
      description: "Due date of the task",
    },
    status: {
      type: GraphQLString,
      description: "Status of the task",
    },
    assignedAdminId: {
      type: GraphQLID,
      description: "ID of admin assigned to the task",
    },
    assignedStudentId: {
      type: GraphQLID,
      description: "ID of student assigned to the task",
    },
    assignedProjectId: {
      type: GraphQLID,
      description: "ID of project assigned to the task",
    },
  }),
});

/**
 * GraphQL Query Fields for task operations
 * @type {Object}
 */
const taskQueryFields = {
  task: {
    type: TaskType,
    description: "Get a task by ID",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the task",
      },
    },
    resolve: taskResolvers.getTaskById,
  },
  tasks: {
    type: new GraphQLList(TaskType),
    description: "Get all tasks",
    resolve: taskResolvers.getAllTasks,
  },
  tasksByProject: {
    type: new GraphQLList(TaskType),
    description: "Get tasks by project ID",
    args: {
      projectId: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the project",
      },
    },
    resolve: taskResolvers.getTasksByProject,
  },
  recentTasks: {
    type: new GraphQLList(TaskType),
    description: "Get the most recent tasks based on update time",
    args: {
      limit: {
        type: GraphQLInt,
        description: "Number of tasks to return (default: 5)",
        defaultValue: 5,
      },
    },
    resolve: taskResolvers.getRecentTasks,
  },
};

/**
 * GraphQL Mutation Fields for task operations
 * @type {Object}
 */
const taskMutationFields = {
  createTask: {
    type: TaskType,
    description: "Create a new task",
    args: {
      input: {
        type: new GraphQLNonNull(CreateTaskInput),
        description: "Task data for creation",
      },
    },
    resolve: taskResolvers.createTask,
  },
  updateTask: {
    type: TaskType,
    description: "Update an existing task",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the task to update",
      },
      input: {
        type: new GraphQLNonNull(UpdateTaskInput),
        description: "Task data to update",
      },
    },
    resolve: taskResolvers.updateTask,
  },
  deleteTask: {
    type: TaskType,
    description: "Delete a task",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the task to delete",
      },
    },
    resolve: taskResolvers.deleteTask,
  },
};

/**
 * Export task schema components
 * @type {Object}
 */
module.exports = {
  TaskType,
  taskQueryFields,
  taskMutationFields,
  CreateTaskInput,
  UpdateTaskInput,
};
