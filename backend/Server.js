/**
 * Task Management System Server
 *
 * Main server file that sets up Express with GraphQL, MongoDB connection,
 * and necessary middleware for the Task Management System.
 *
 * @module server
 */

const express = require("express");
const mongoose = require("mongoose");
const { createHandler } = require("graphql-http/lib/use/express");
const { GraphQLSchema, GraphQLObjectType } = require("graphql");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Import query and mutation fields from schema files
const {
  userQueryFields,
  userMutationFields,
} = require("./graphql/schema/userSchema");
const {
  authQueryFields,
  authMutationFields,
} = require("./graphql/schema/authSchema");
const {
  studentQueryFields,
  studentMutationFields,
} = require("./graphql/schema/studentSchema");
const {
  adminQueryFields,
  adminMutationFields,
} = require("./graphql/schema/adminSchema");
const {
  projectQueryFields,
  projectMutationFields,
} = require("./graphql/schema/projectSchema");
const {
  taskQueryFields,
  taskMutationFields,
} = require("./graphql/schema/taskSchema");
const {
  messageQueryFields,
  messageMutationFields,
} = require("./graphql/schema/messageSchema");

/**
 * Express application instance
 * @type {express.Application}
 */
const app = express();

/**
 * Configure CORS middleware to allow credentials and specify allowed origin
 * This is essential for cross-domain requests with authentication
 */
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

/**
 * Add cookie-parser middleware to parse cookies in requests
 * Required for session-based authentication
 */
app.use(cookieParser());

/**
 * Connect to MongoDB database using connection string from environment variables
 * @returns {Promise} MongoDB connection promise
 */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(console.error);

/**
 * Define GraphQL Root Query type
 * Combines all query fields from different schema modules
 * @type {GraphQLObjectType}
 */
const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    ...userQueryFields,
    ...authQueryFields,
    ...studentQueryFields,
    ...adminQueryFields,
    ...projectQueryFields,
    ...taskQueryFields,
    ...messageQueryFields,
  },
});

/**
 * Define GraphQL Root Mutation type
 * Combines all mutation fields from different schema modules
 * @type {GraphQLObjectType}
 */
const RootMutation = new GraphQLObjectType({
  name: "RootMutation",
  fields: {
    ...userMutationFields,
    ...authMutationFields,
    ...studentMutationFields,
    ...adminMutationFields,
    ...projectMutationFields,
    ...taskMutationFields,
    ...messageMutationFields,
  },
});

/**
 * Create the GraphQL schema with query and mutation types
 * @type {GraphQLSchema}
 */
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

/**
 * Set up GraphQL HTTP handler at /graphql endpoint
 * Includes context with request and response objects for authentication
 */
app.use("/graphql", (req, res, next) => {
  const handler = createHandler({
    schema,
    context: () => {
      // Include both request and response in context
      return { req: { ...req, res } };
    },
    formatError: (error) => {
      console.error(error);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  });

  handler(req, res, next);
});

/**
 * Serve Ruru GraphQL IDE at the root endpoint
 * Provides a visual interface for exploring and testing the GraphQL API
 */
const { ruruHTML } = require("ruru/server");
app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

/**
 * Start the Express server on the specified port
 * @listens {number} process.env.PORT - Port number from environment variables
 */
app.listen(process.env.PORT, () => {
  console.log(`GraphQL server running at http://localhost:${process.env.PORT}`);
});
