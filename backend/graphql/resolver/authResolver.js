import User from "../../models/userModel.js";
import Student from "../../models/studentModel.js";
import Admin from "../../models/adminModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/**
 * Login user
 * @param {Object} params - Login parameters
 * @param {string} params.username - User's username (can be either name or email)
 * @param {string} params.password - User's password
 * @returns {Object} Auth payload with token and user
 */
const login = async ({ username, password }) => {
  try {
    // Try to find user by name (username) or email
    const user = await User.findOne({
      $or: [{ name: username }, { email: username }],
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (err) {
    console.error("Login error:", err);
    throw new Error(err.message || "Authentication failed");
  }
};

/**
 * Register new user
 * @param {Object} params - Registration parameters
 * @param {string} params.name - User's name
 * @param {string} params.email - User's email
 * @param {string} params.password - User's password
 * @param {string} params.role - User's role (admin or student)
 * @param {string} params.universityId - Student's university ID (required for students)
 * @param {string} params.major - Student's major (required for students)
 * @param {string} params.year - Student's year (required for students)
 * @returns {Object} Auth payload with token and user
 */
const register = async ({
  name,
  email,
  password,
  role,
  universityId,
  major,
  year,
}) => {
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const existingUsername = await User.findOne({ name });
    if (existingUsername) {
      throw new Error("Username already taken");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    if (role === "student") {
      if (!universityId || !major || !year) {
        throw new Error(
          "University ID, major, and year are required for students"
        );
      }

      await Student.create({
        user_id: user._id,
        universityId,
        major,
        year,
      });
    } else if (role === "admin") {
      await Admin.create({
        user_id: user._id,
        permissions: ["read", "write"],
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Return token and user info
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  } catch (err) {
    console.error("Registration error:", err);
    throw new Error(err.message || "Registration failed");
  }
};

/**
 * Get current user
 * @param {Object} _ - Parent resolver
 * @param {Object} __ - Arguments
 * @param {Object} context - GraphQL context
 * @returns {Object} User object
 */
const getCurrentUser = async (_, __, context) => {
  try {
    if (!context.user) {
      throw new Error("Not authenticated");
    }

    const user = await User.findById(context.user.userId);
    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  } catch (err) {
    console.error("Get current user error:", err);
    throw new Error(err.message || "Failed to get current user");
  }
};

/**
 * Logout user (client-side only in this implementation)
 * @returns {Boolean} Success status
 */
const logout = async () => {
  return true;
};

export default {
  login,
  register,
  getCurrentUser,
  logout,
};
