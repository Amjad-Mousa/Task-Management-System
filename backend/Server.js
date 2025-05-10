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
    origin: process.env.CLIENT_URL,
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
  },
});

// Define Root Mutation
const RootMutation = new GraphQLObjectType({
  name: "RootMutation",
  fields: {
    ...userMutationFields,
    ...authMutationFields,
  },
});

// Create the schema
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

// Create GraphQL handler with context that includes response object
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

// Serve GraphiQL IDE
const { ruruHTML } = require("ruru/server");
app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

app.listen(process.env.PORT, () => {
  console.log(
    `🚀 GraphQL server running at http://localhost:${process.env.PORT}`
  );
});
