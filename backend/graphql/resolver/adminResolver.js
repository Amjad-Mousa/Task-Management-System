const Admin = require("../../models/adminModel");
const User = require("../../models/userModel");
const mongoose = require("mongoose");
const { checkAuth } = require("../../middleware/auth");

const adminResolvers = {
  // Get all admins
  admins: async (_, _args, context) => {
    // Only allow authenticated users to access all admins
    const decodedToken = checkAuth(context);

    // Only admins can see all admins
    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to view all admins");
    }

    return await Admin.find();
  },

  // Get a single admin by ID
  admin: async (_, { id }, context) => {
    // Only allow authenticated users to access admin details
    const decodedToken = checkAuth(context);

    // Only admins can see admin details
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

  // Get an admin by user ID
  adminByUserId: async (_, { userId }, context) => {
    // Only allow authenticated users to access admin details
    const decodedToken = checkAuth(context);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // Check if user is admin or the admin themselves
    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to view admin details");
    }

    const admin = await Admin.findOne({ user_id: userId });
    if (!admin) {
      throw new Error("Admin not found");
    }

    return admin;
  },

  // Get user details for an admin
  getAdminUser: async (parent) => {
    return await User.findById(parent.user_id);
  },

  // Create a new admin
  createAdmin: async (_, { input }) => {
    try {
      // Check if user exists
      if (!mongoose.Types.ObjectId.isValid(input.user_id)) {
        throw new Error("Invalid user ID");
      }

      const user = await User.findById(input.user_id);
      if (!user) {
        throw new Error("User not found");
      }

      // Check if user is already an admin
      const existingAdmin = await Admin.findOne({ user_id: input.user_id });
      if (existingAdmin) {
        throw new Error("This user is already an admin");
      }

      // Set default permissions if none provided
      if (!input.permissions || input.permissions.length === 0) {
        input.permissions = ["read", "write"];
      }

      // Create new admin
      const admin = new Admin(input);
      return await admin.save();
    } catch (error) {
      throw new Error(`Error creating admin: ${error.message}`);
    }
  },

  // Update an existing admin
  updateAdmin: async (_, { id, input }, context) => {
    // Check authentication
    const decodedToken = checkAuth(context);

    // Only admins can update admins
    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to update admins");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid admin ID");
    }

    // Find the admin
    const admin = await Admin.findById(id);
    if (!admin) {
      throw new Error("Admin not found");
    }

    // Update the admin
    const updatedAdmin = await Admin.findByIdAndUpdate(id, input, {
      new: true,
    });
    return updatedAdmin;
  },

  // Delete an admin
  deleteAdmin: async (_, { id }, context) => {
    // Check authentication
    const decodedToken = checkAuth(context);

    // Only admins can delete admins
    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to delete admins");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid admin ID");
    }

    // Delete the admin
    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      throw new Error("Admin not found");
    }

    return admin;
  },
};

module.exports = adminResolvers;
