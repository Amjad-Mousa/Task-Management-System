/**
 * Admin Model
 *
 * Represents an administrator user in the system with permission information.
 * Extends the base User model with admin-specific fields.
 *
 * @module models/adminModel
 */
const mongoose = require("mongoose");

/**
 * Admin Schema
 *
 * @typedef {Object} AdminSchema
 * @property {mongoose.Schema.Types.ObjectId} user_id - Reference to the User model
 * @property {string[]} permissions - Array of permission strings for the admin
 * @property {Date} createdAt - Timestamp when the admin record was created
 * @property {Date} updatedAt - Timestamp when the admin record was last updated
 */
const adminSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    permissions: {
      type: [String],
      required: true,
      default: ["create_project", "manage_tasks"],
    },
  },
  { timestamps: true }
);

/**
 * Admin Model
 * @type {mongoose.Model<AdminSchema>}
 */
const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
