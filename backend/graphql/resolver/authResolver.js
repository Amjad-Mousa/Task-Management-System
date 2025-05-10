const User = require("../../models/userModel");
const argon2 = require("argon2");
const {
  setSessionCookie,
  clearSessionCookie,
  checkAuth,
} = require("../../middleware/auth");

const authResolvers = {
  // Get current authenticated user
  me: async (_, _args, context) => {
    try {
      // Verify session and get user ID
      const sessionData = checkAuth(context);

      // Find user by ID
      const user = await User.findById(sessionData.userId);
      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      // Return null if not authenticated (don't throw error)
      return null;
    }
  },

  // Login user
  login: async (_, { input }, context) => {
    try {
      const { name, password, rememberMe = false } = input;

      // Find user by name
      const user = await User.findOne({ name });
      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Verify password
      const validPassword = await argon2.verify(user.password, password);
      if (!validPassword) {
        throw new Error("Invalid credentials");
      }

      // Set session cookie
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

  // Logout user
  logout: (_, _args, context) => {
    try {
      // Clear session cookie
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

module.exports = authResolvers;
