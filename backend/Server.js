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

const app = express();

// Configure CORS to allow credentials
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true,
  })
);

// Add cookie-parser middleware
app.use(cookieParser());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(console.error);

// Define Root Query
const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    ...userQueryFields,
    ...authQueryFields,
    // Add other query fields here as your schema grows:
    // ...projectQueryFields,
    // ...taskQueryFields,
  },
});

// Define Root Mutation
const RootMutation = new GraphQLObjectType({
  name: "RootMutation",
  fields: {
    ...userMutationFields,
    ...authMutationFields,
    // Add other mutation fields here as your schema grows:
    // ...projectMutationFields,
    // ...taskMutationFields,
  },
});

// Create the schema
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

// Create GraphQL handler with context
app.use(
  "/graphql",
  createHandler({
    schema,
    context: (req) => {
      // Pass the request object to resolvers for auth middleware
      return { req };
    },
    formatError: (error) => {
      console.error(error);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  })
);

// Serve GraphiQL IDE
const { ruruHTML } = require("ruru/server");
app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

app.listen(4000, () => {
  console.log("🚀 GraphQL server running at http://localhost:4000");
});
