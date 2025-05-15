/**
 * Admin Resolver
 *
 * Handles operations related to admin users including fetching, creating, updating, and deleting admin records.
 *
 * @module graphql/resolver/adminResolver
 */
const Admin = require("../../models/adminModel");
const User = require("../../models/userModel");
const mongoose = require("mongoose");
const { checkAuth } = require("../../middleware/auth");

/**
 * Admin resolvers for GraphQL operations
 * @type {Object}
 */
const adminResolvers = {
  /**
   * Get all admin users
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} _args - Query arguments (not used)
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Array>} List of all admin users
   * @throws {Error} If user is not authenticated
   */
  admins: async (_, _args, context) => {
    try {
      // Check authentication but allow both students and admins to access
      const decodedToken = checkAuth(context);
      console.log("Authenticated user requesting admins:", decodedToken);

      // Both students and admins can view the list of admins for chat purposes
      const admins = await Admin.find();
      console.log(`Found ${admins.length} admins`);

      return admins;
    } catch (error) {
      console.error("Error in admins resolver:", error);
      throw error;
    }
  },

  /**
   * Get a single admin by ID
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Query parameters
   * @param {string} params.id - Admin ID
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Admin user data
   * @throws {Error} If user is not authenticated, not authorized, or admin not found
   */
  admin: async (_, { id }, context) => {
    const decodedToken = checkAuth(context);

    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to view admin details");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid admin ID");
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      throw new Error("Admin not found");
    }

    return admin;
  },

  /**
   * Get an admin by user ID
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Query parameters
   * @param {string} params.userId - User ID
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Admin user data
   * @throws {Error} If user is not authenticated, not authorized, or admin not found
   */
  adminByUserId: async (_, { userId }, context) => {
    const decodedToken = checkAuth(context);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to view admin details");
    }

    const admin = await Admin.findOne({ user_id: userId });
    if (!admin) {
      throw new Error("Admin not found");
    }

    return admin;
  },

  /**
   * Get user details for an admin
   *
   * @async
   * @param {Object} parent - Parent resolver containing admin data
   * @returns {Promise<Object>} User data associated with the admin
   */
  getAdminUser: async (parent) => {
    try {
      console.log("Getting user for admin:", parent);
      if (!parent || !parent.user_id) {
        console.error("Invalid parent or missing user_id:", parent);
        return null;
      }

      const user = await User.findById(parent.user_id);
      console.log("Found user:", user ? user.name : "null");
      return user;
    } catch (error) {
      console.error("Error in getAdminUser resolver:", error);
      return null;
    }
  },

  /**
   * Create a new admin
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Mutation parameters
   * @param {Object} params.input - Admin creation input data
   * @returns {Promise<Object>} Newly created admin
   * @throws {Error} If validation fails or admin creation fails
   */
  createAdmin: async (_, { input }) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(input.user_id)) {
        throw new Error("Invalid user ID");
      }

      const user = await User.findById(input.user_id);
      if (!user) {
        throw new Error("User not found");
      }

      const existingAdmin = await Admin.findOne({ user_id: input.user_id });
      if (existingAdmin) {
        throw new Error("This user is already an admin");
      }

      if (!input.permissions || input.permissions.length === 0) {
        input.permissions = ["read", "write"];
      }

      const admin = new Admin(input);
      return await admin.save();
    } catch (error) {
      throw new Error(`Error creating admin: ${error.message}`);
    }
  },

  /**
   * Update an existing admin
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Mutation parameters
   * @param {string} params.id - Admin ID
   * @param {Object} params.input - Admin update input data
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Updated admin
   * @throws {Error} If user is not authenticated, not authorized, or admin not found
   */
  updateAdmin: async (_, { id, input }, context) => {
    const decodedToken = checkAuth(context);

    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to update admins");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid admin ID");
    }

    const admin = await Admin.findById(id);
    if (!admin) {
      throw new Error("Admin not found");
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(id, input, {
      new: true,
    });
    return updatedAdmin;
  },

  /**
   * Delete an admin
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Mutation parameters
   * @param {string} params.id - Admin ID
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Deleted admin
   * @throws {Error} If user is not authenticated, not authorized, or admin not found
   */
  deleteAdmin: async (_, { id }, context) => {
    const decodedToken = checkAuth(context);

    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to delete admins");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid admin ID");
    }

    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      throw new Error("Admin not found");
    }

    return admin;
  },
};

/**
 * Export admin resolver functions
 * @type {Object}
 */
module.exports = adminResolvers;
