const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
} = require("graphql");
const userResolvers = require("../resolver/userResolver.js");

// User Type
const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: new GraphQLNonNull(GraphQLString) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

// Input type for creating a new user
const CreateUserInput = new GraphQLInputObjectType({
  name: "CreateUserInput",
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    role: { type: new GraphQLNonNull(GraphQLString) },
  }),
});

// Input type for updating a user
const UpdateUserInput = new GraphQLInputObjectType({
  name: "UpdateUserInput",
  fields: () => ({
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    password: { type: GraphQLString },
    role: { type: GraphQLString },
  }),
});

// User Query Fields - modular approach
const userQueryFields = {
  users: {
    type: new GraphQLList(UserType),
    resolve: userResolvers.users,
  },
  user: {
    type: UserType,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    resolve: userResolvers.user,
  },
};

// User Mutation Fields - modular approach
const userMutationFields = {
  createUser: {
    type: UserType,
    args: {
      input: { type: new GraphQLNonNull(CreateUserInput) },
    },
    resolve: userResolvers.createUser,
  },
  updateUser: {
    type: UserType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      input: { type: new GraphQLNonNull(UpdateUserInput) },
    },
    resolve: userResolvers.updateUser,
  },
  deleteUser: {
    type: UserType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
    },
    resolve: userResolvers.deleteUser,
  },
};

// Export types and schema components
module.exports = {
  UserType,
  userQueryFields,
  userMutationFields,
  CreateUserInput,
  UpdateUserInput,
};
