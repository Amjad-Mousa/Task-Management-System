/**
 * Authentication Schema
 *
 * Defines GraphQL types, queries, and mutations for authentication operations.
 *
 * @module graphql/schema/authSchema
 */
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInputObjectType,
} = require("graphql");
const { UserType } = require("./userSchema");
const authResolvers = require("../resolver/authResolver");

/**
 * GraphQL Authentication Response Type
 * Represents the response from authentication operations
 * @type {GraphQLObjectType}
 */
const AuthResponseType = new GraphQLObjectType({
  name: "AuthResponse",
  fields: () => ({
    user: {
      type: UserType,
      description: "User data if authentication is successful",
    },
    success: {
      type: GraphQLBoolean,
      description: "Whether the authentication operation was successful",
    },
    message: {
      type: GraphQLString,
      description: "Message describing the result of the operation",
    },
  }),
});

/**
 * GraphQL Input Type for login operations
 * @type {GraphQLInputObjectType}
 */
const LoginInput = new GraphQLInputObjectType({
  name: "LoginInput",
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Username for authentication",
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
      description: "User password",
    },
    rememberMe: {
      type: GraphQLBoolean,
      description: "Whether to keep the user logged in for an extended period",
    },
  }),
});

/**
 * GraphQL Query Fields for authentication operations
 * @type {Object}
 */
const authQueryFields = {
  me: {
    type: UserType,
    description: "Get the currently authenticated user",
    resolve: authResolvers.me,
  },
};

/**
 * GraphQL Mutation Fields for authentication operations
 * @type {Object}
 */
const authMutationFields = {
  login: {
    type: AuthResponseType,
    description: "Log in a user with credentials",
    args: {
      input: { type: new GraphQLNonNull(LoginInput) },
    },
    resolve: authResolvers.login,
  },
  logout: {
    type: AuthResponseType,
    description: "Log out the current user",
    resolve: authResolvers.logout,
  },
};

/**
 * Export authentication schema components
 * @type {Object}
 */
module.exports = {
  AuthResponseType,
  LoginInput,
  authQueryFields,
  authMutationFields,
};
