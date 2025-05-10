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
    id: {
      type: GraphQLID,
      description: "Unique identifier for the user",
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Username for authentication",
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
      description: "User's email address",
    },
    role: {
      type: new GraphQLNonNull(GraphQLString),
      description: "User role (admin or student)",
    },
    createdAt: {
      type: GraphQLString,
      description: "Timestamp when the user was created",
    },
    updatedAt: {
      type: GraphQLString,
      description: "Timestamp when the user was last updated",
    },
  }),
});

// Input type for creating a new user
const CreateUserInput = new GraphQLInputObjectType({
  name: "CreateUserInput",
  fields: () => ({
    name: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Username for authentication",
    },
    email: {
      type: new GraphQLNonNull(GraphQLString),
      description: "User's email address",
    },
    password: {
      type: new GraphQLNonNull(GraphQLString),
      description: "User's password",
    },
    role: {
      type: new GraphQLNonNull(GraphQLString),
      description: "User role (admin or student)",
    },
  }),
});

// Input type for updating a user
const UpdateUserInput = new GraphQLInputObjectType({
  name: "UpdateUserInput",
  fields: () => ({
    name: {
      type: GraphQLString,
      description: "Username for authentication",
    },
    email: {
      type: GraphQLString,
      description: "User's email address",
    },
    password: {
      type: GraphQLString,
      description: "User's password",
    },
    role: {
      type: GraphQLString,
      description: "User role (admin or student)",
    },
  }),
});

// User Query Fields
const userQueryFields = {
  users: {
    type: new GraphQLList(UserType),
    description: "Get all users",
    resolve: userResolvers.users,
  },
  user: {
    type: UserType,
    description: "Get a user by ID",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the user to retrieve",
      },
    },
    resolve: userResolvers.user,
  },
};

// User Mutation Fields
const userMutationFields = {
  createUser: {
    type: UserType,
    description: "Create a new user",
    args: {
      input: {
        type: new GraphQLNonNull(CreateUserInput),
        description: "User data for creation",
      },
    },
    resolve: userResolvers.createUser,
  },
  updateUser: {
    type: UserType,
    description: "Update an existing user",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the user to update",
      },
      input: {
        type: new GraphQLNonNull(UpdateUserInput),
        description: "User data to update",
      },
    },
    resolve: userResolvers.updateUser,
  },
  deleteUser: {
    type: UserType,
    description: "Delete a user",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the user to delete",
      },
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
