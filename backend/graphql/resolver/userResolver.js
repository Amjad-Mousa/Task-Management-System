/**
 * User Resolver
 *
 * Handles operations related to users including fetching, creating, updating, and deleting user records.
 *
 * @module graphql/resolver/userResolver
 */
const User = require("../../models/userModel.js");
const mongoose = require("mongoose");
const argon2 = require("argon2");
const { checkAuth } = require("../../middleware/auth.js");

/**
 * User resolvers for GraphQL operations
 * @type {Object}
 */
const userResolvers = {
  /**
   * Get all users
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} _args - Query arguments (not used)
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Array>} List of all users
   * @throws {Error} If user is not authenticated
   */
  users: async (_, _args, context) => {
    checkAuth(context);
    return await User.find();
  },

  /**
   * Get a single user by ID
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Query parameters
   * @param {string} params.id - User ID
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} User data
   * @throws {Error} If user is not authenticated or user not found
   */
  user: async (_, { id }, context) => {
    checkAuth(context);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }
    return await User.findById(id);
  },

  /**
   * Create a new user (register)
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Mutation parameters
   * @param {Object} params.input - User creation input data
   * @returns {Promise<Object>} Newly created user
   * @throws {Error} If validation fails or user creation fails
   */
  createUser: async (_, { input }) => {
    try {
      const existingUser = await User.findOne({
        $or: [{ name: input.name }, { email: input.email }],
      });

      if (existingUser) {
        throw new Error("User with this name or email already exists");
      }

      const hashedPassword = await argon2.hash(input.password);

      const user = new User({
        ...input,
        password: hashedPassword,
      });

      return await user.save();
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  },

  /**
   * Update an existing user
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Mutation parameters
   * @param {string} params.id - User ID
   * @param {Object} params.input - User update input data
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Updated user
   * @throws {Error} If user is not authenticated, not authorized, or user not found
   */
  updateUser: async (_, { id, input }, context) => {
    const decodedToken = checkAuth(context);

    if (decodedToken.userId !== id && decodedToken.role !== "admin") {
      throw new Error("Not authorized to update this user");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    if (input.password) {
      input.password = await argon2.hash(input.password);
    }

    const user = await User.findByIdAndUpdate(id, input, { new: true });
    if (!user) throw new Error("User not found");

    return user;
  },

  /**
   * Delete a user by ID
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Mutation parameters
   * @param {string} params.id - User ID
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Deleted user
   * @throws {Error} If user is not authenticated, not authorized, or user not found
   */
  deleteUser: async (_, { id }, context) => {
    const decodedToken = checkAuth(context);

    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to delete users");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) throw new Error("User not found");

    return user;
  },
};

/**
 * Export user resolver functions
 * @type {Object}
 */
module.exports = userResolvers;
