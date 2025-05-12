/**
 * Admin Schema
 *
 * Defines GraphQL types, queries, and mutations for admin operations.
 *
 * @module graphql/schema/adminSchema
 */
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
} = require("graphql");
const { UserType } = require("./userSchema");
const adminResolvers = require("../resolver/adminResolver");

/**
 * GraphQL Admin Type
 * Represents an admin user in the system
 * @type {GraphQLObjectType}
 */
const AdminType = new GraphQLObjectType({
  name: "Admin",
  fields: () => ({
    id: { type: GraphQLID },
    user_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "Reference to the User model",
    },
    user: {
      type: UserType,
      description: "User details for this admin",
      resolve: adminResolvers.getAdminUser,
    },
    permissions: {
      type: new GraphQLList(GraphQLString),
      description: "List of permissions for this admin",
    },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

/**
 * GraphQL Input Type for creating a new admin
 * @type {GraphQLInputObjectType}
 */
const CreateAdminInput = new GraphQLInputObjectType({
  name: "CreateAdminInput",
  fields: () => ({
    user_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "User ID to associate with this admin",
    },
    permissions: {
      type: new GraphQLList(GraphQLString),
      description: "List of permissions for this admin",
    },
  }),
});

/**
 * GraphQL Input Type for updating an admin
 * @type {GraphQLInputObjectType}
 */
const UpdateAdminInput = new GraphQLInputObjectType({
  name: "UpdateAdminInput",
  fields: () => ({
    permissions: {
      type: new GraphQLList(GraphQLString),
      description: "List of permissions for this admin",
    },
  }),
});

/**
 * GraphQL Query Fields for admin operations
 * @type {Object}
 */
const adminQueryFields = {
  admins: {
    type: new GraphQLList(AdminType),
    description: "Get all admins",
    resolve: adminResolvers.admins,
  },
  admin: {
    type: AdminType,
    description: "Get an admin by ID",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the admin to retrieve",
      },
    },
    resolve: adminResolvers.admin,
  },
  adminByUserId: {
    type: AdminType,
    description: "Get an admin by user ID",
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: "User ID of the admin to retrieve",
      },
    },
    resolve: adminResolvers.adminByUserId,
  },
};

/**
 * GraphQL Mutation Fields for admin operations
 * @type {Object}
 */
const adminMutationFields = {
  createAdmin: {
    type: AdminType,
    description: "Create a new admin",
    args: {
      input: {
        type: new GraphQLNonNull(CreateAdminInput),
        description: "Admin data for creation",
      },
    },
    resolve: adminResolvers.createAdmin,
  },
  updateAdmin: {
    type: AdminType,
    description: "Update an existing admin",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the admin to update",
      },
      input: {
        type: new GraphQLNonNull(UpdateAdminInput),
        description: "Admin data to update",
      },
    },
    resolve: adminResolvers.updateAdmin,
  },
  deleteAdmin: {
    type: AdminType,
    description: "Delete an admin",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the admin to delete",
      },
    },
    resolve: adminResolvers.deleteAdmin,
  },
};

/**
 * Export admin schema components
 * @type {Object}
 */
module.exports = {
  AdminType,
  adminQueryFields,
  adminMutationFields,
  CreateAdminInput,
  UpdateAdminInput,
};
