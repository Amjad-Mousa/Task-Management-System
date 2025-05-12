/**
 * Authentication Resolver
 *
 * Handles user authentication operations including login, logout, and retrieving the current user.
 *
 * @module graphql/resolver/authResolver
 */
const User = require("../../models/userModel");
const argon2 = require("argon2");
const {
  setSessionCookie,
  clearSessionCookie,
  checkAuth,
} = require("../../middleware/auth");

/**
 * Authentication resolvers for GraphQL operations
 * @type {Object}
 */
const authResolvers = {
  /**
   * Get the currently authenticated user
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} _args - Query arguments (not used)
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object|null>} The authenticated user or null if not authenticated
   */
  me: async (_, _args, context) => {
    try {
      const sessionData = checkAuth(context);

      const user = await User.findById(sessionData.userId);
      if (!user) {
        throw new Error("User not found");
      }

      return user;
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      return null;
    }
  },

  /**
   * Authenticate a user and create a session
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Query parameters
   * @param {Object} params.input - Login input data
   * @param {string} params.input.name - Username
   * @param {string} params.input.password - User password (plain text)
   * @param {boolean} [params.input.rememberMe=false] - Whether to extend session duration
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Authentication result with user data and status
   */
  login: async (_, { input }, context) => {
    try {
      const { name, password, rememberMe = false } = input;

      const user = await User.findOne({ name });
      if (!user) {
        throw new Error("Invalid credentials");
      }

      const validPassword = await argon2.verify(user.password, password);
      if (!validPassword) {
        throw new Error("Invalid credentials");
      }

      setSessionCookie(
        context.req.res,
        user,
        rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
      );

      return {
        user,
        success: true,
        message: "Login successful",
      };
    } catch (error) {
      return {
        user: null,
        success: false,
        message: error.message,
      };
    }
  },

  /**
   * End a user's session (logout)
   *
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} _args - Query arguments (not used)
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Object} Logout result with status
   */
  logout: (_, _args, context) => {
    try {
      clearSessionCookie(context.req.res);

      return {
        user: null,
        success: true,
        message: "Logout successful",
      };
    } catch (error) {
      return {
        user: null,
        success: false,
        message: error.message,
      };
    }
  },
};

/**
 * Export authentication resolver functions
 * @type {Object}
 */
module.exports = authResolvers;
