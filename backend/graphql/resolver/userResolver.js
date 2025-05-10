const User = require("../../models/userModel.js");
const mongoose = require("mongoose");
const argon2 = require("argon2");
const { checkAuth } = require("../../middleware/auth.js");

const userResolvers = {
  // Get all users
  users: async (_, _args, context) => {
    // Only allow authenticated users to access all users
    checkAuth(context);
    return await User.find();
  },

  // Get a single user by ID
  user: async (_, { id }, context) => {
    // Only allow authenticated users to access user details
    checkAuth(context);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }
    return await User.findById(id);
  },

  // Create a new user (register)
  createUser: async (_, { input }) => {
    try {
      // Check if user with this name or email already exists
      const existingUser = await User.findOne({
        $or: [{ name: input.name }, { email: input.email }],
      });

      if (existingUser) {
        throw new Error("User with this name or email already exists");
      }

      // Hash the password
      const hashedPassword = await argon2.hash(input.password);

      // Create new user with hashed password
      const user = new User({
        ...input,
        password: hashedPassword,
      });

      return await user.save();
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  },

  // Update an existing user
  updateUser: async (_, { id, input }, context) => {
    // Check authentication
    const decodedToken = checkAuth(context);

    // Only allow users to update their own profile or admins to update any profile
    if (decodedToken.userId !== id && decodedToken.role !== "admin") {
      throw new Error("Not authorized to update this user");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    // If password is being updated, hash it
    if (input.password) {
      input.password = await argon2.hash(input.password);
    }

    // Update the user by ID
    const user = await User.findByIdAndUpdate(id, input, { new: true });
    if (!user) throw new Error("User not found");

    return user;
  },

  // Delete a user by ID
  deleteUser: async (_, { id }, context) => {
    // Check authentication
    const decodedToken = checkAuth(context);

    // Only allow admins to delete users
    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to delete users");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }

    // Delete the user by ID
    const user = await User.findByIdAndDelete(id);
    if (!user) throw new Error("User not found");

    return user;
  },
};

module.exports = userResolvers;
