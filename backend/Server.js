import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Import schemas
import userSchema from "./graphql/schema/userSchema.js";
import adminSchema from "./graphql/schema/adminSchema.js";
import studentSchema from "./graphql/schema/studentSchema.js";
import projectSchema from "./graphql/schema/projectSchema.js";
import taskSchema from "./graphql/schema/taskSchema.js";

// Import resolvers
import userResolvers from "./graphql/resolver/userResolver.js";
import adminResolvers from "./graphql/resolver/adminResolver.js";
import studentResolvers from "./graphql/resolver/studentResolver.js";
import projectResolvers from "./graphql/resolver/projectResolver.js";
import taskResolvers from "./graphql/resolver/taskResolver.js";

// Load environment variables
dotenv.config();

// MongoDB connection
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/task-management";

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error.message);
  });

// Merge all resolvers
const resolvers = {
  Query: {
    // User queries
    getUsers: userResolvers.getUsers,
    getUser: userResolvers.getUser,

    // Admin queries
    getAdmins: adminResolvers.getAdmins,
    getAdmin: adminResolvers.getAdmin,

    // Student queries
    getStudents: studentResolvers.getStudents,
    getStudent: studentResolvers.getStudent,
    getStudentByUserId: studentResolvers.getStudentByUserId,

    // Project queries
    getProjects: projectResolvers.getProjects,
    getProject: projectResolvers.getProject,

    // Task queries
    getTasks: taskResolvers.getTasks,
    getTask: taskResolvers.getTask,
    getTasksByProject: taskResolvers.getTasksByProject,
    getTasksByStudent: taskResolvers.getTasksByStudent,
  },
  Mutation: {
    // User mutations
    createUser: userResolvers.createUser,
    updateUser: userResolvers.updateUser,
    deleteUser: userResolvers.deleteUser,

    // Admin mutations
    createAdmin: adminResolvers.createAdmin,
    updateAdmin: adminResolvers.updateAdmin,
    deleteAdmin: adminResolvers.deleteAdmin,

    // Student mutations
    createStudent: studentResolvers.createStudent,
    updateStudent: studentResolvers.updateStudent,
    deleteStudent: studentResolvers.deleteStudent,

    // Project mutations
    createProject: projectResolvers.createProject,
    updateProject: projectResolvers.updateProject,
    deleteProject: projectResolvers.deleteProject,

    // Task mutations
    createTask: taskResolvers.createTask,
    updateTask: taskResolvers.updateTask,
    deleteTask: taskResolvers.deleteTask,
  },
};

// Create Apollo Server
const server = new ApolloServer({
  typeDefs: `
    # User Schema
    ${userSchema.loc.source.body}
    
    # Admin Schema
    ${adminSchema.loc.source.body}
    
    # Student Schema
    ${studentSchema.loc.source.body}
    
    # Project Schema
    ${projectSchema.loc.source.body}
    
    # Task Schema
    ${taskSchema.loc.source.body}
  `,
  resolvers,
  formatError: (error) => {
    console.error("GraphQL Error:", error);
    return {
      message: error.message,
      path: error.path,
      extensions: error.extensions,
    };
  },
});

// Start the server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    const { url } = await startStandaloneServer(server, {
      listen: { port: PORT },
    });
    console.log(`Server ready at ${url}`);
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
