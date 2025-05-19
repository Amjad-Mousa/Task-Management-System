/**
 * User Model
 *
 * Represents a user in the system with authentication details and role information.
 * This is the base model for both admin and student users.
 *
 * @module models/userModel
 */
const mongoose = require("mongoose");

/**
 * User Schema
 *
 * @typedef {Object} UserSchema
 * @property {string} name - The user's full name (unique)
 * @property {string} email - The user's email address (unique)
 * @property {string} password - The user's hashed password
 * @property {string} role - The user's role (either "student" or "admin")
 * @property {Date} createdAt - Timestamp when the user was created
 * @property {Date} updatedAt - Timestamp when the user was last updated
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * User Model
 * @type {mongoose.Model<UserSchema>}
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
