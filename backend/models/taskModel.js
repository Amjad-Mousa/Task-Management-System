/**
 * Task Model
 *
 * Represents a task in the system with details about its assignment, deadline, and status.
 * Tasks are created by admins, assigned to students, and associated with projects.
 *
 * @module models/taskModel
 */
const mongoose = require("mongoose");

/**
 * Task Schema
 *
 * @typedef {Object} TaskSchema
 * @property {string} title - The title of the task
 * @property {string} description - Detailed description of the task
 * @property {Date} dueDate - The deadline for the task
 * @property {string} status - Current status of the task (Not Started, In Progress, Completed, or Pending)
 * @property {mongoose.Schema.Types.ObjectId} assignedAdmin - Reference to the Admin responsible for the task
 * @property {mongoose.Schema.Types.ObjectId[]} assignedStudent - Array of Student references assigned to the task
 * @property {mongoose.Schema.Types.ObjectId} assignedProject - Reference to the Project the task belongs to
 * @property {mongoose.Schema.Types.ObjectId} createdByAdmin - Reference to the Admin who created the task
 * @property {Date} createdAt - Timestamp when the task was created
 * @property {Date} updatedAt - Timestamp when the task was last updated
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed", "Pending"],
      default: "Not Started",
      index: true,
    },
    assignedAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
    assignedStudent: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    assignedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  { timestamps: true }
);

/**
 * Create indexes for efficient querying
 */
taskSchema.index({ createdAt: -1 });
taskSchema.index({ status: 1, dueDate: 1 });

/**
 * Task Model
 * @type {mongoose.Model<TaskSchema>}
 */
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
