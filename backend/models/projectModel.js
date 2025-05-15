/**
 * Project Model
 *
 * Represents a project in the system with details about its timeline, participants, and status.
 * Projects are created by admins and assigned to students.
 *
 * @module models/projectModel
 */
const mongoose = require("mongoose");

/**
 * Project Schema
 *
 * @typedef {Object} ProjectSchema
 * @property {string} projectName - The name of the project
 * @property {string} projectCategory - The category or subject area of the project
 * @property {string} projectDescription - Detailed description of the project
 * @property {mongoose.Schema.Types.ObjectId} createdBy - Reference to the Admin who created the project
 * @property {mongoose.Schema.Types.ObjectId[]} studentsWorkingOn - Array of Student references assigned to the project
 * @property {Date} startDate - The project's start date
 * @property {Date} endDate - The project's deadline
 * @property {string} status - Current status of the project (Pending, In_Progress, or Completed)
 * @property {number} progress - Percentage of project completion (0-100)
 * @property {mongoose.Schema.Types.ObjectId[]} tasks - Array of Task references associated with the project
 * @property {Date} createdAt - Timestamp when the project was created
 * @property {Date} updatedAt - Timestamp when the project was last updated
 */
const projectSchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: true,
      trim: true,
    },
    projectCategory: {
      type: String,
      required: true,
      trim: true,
    },
    projectDescription: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
      index: true,
    },
    studentsWorkingOn: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
        required: true,
      },
    ],
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In_Progress", "Completed"],
      default: "Pending",
      index: true,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    tasks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Task",
      },
    ],
  },
  { timestamps: true }
);

/**
 * Create indexes for efficient querying
 */
projectSchema.index({ createdAt: -1 });
projectSchema.index({ endDate: 1 });

/**
 * Project Model
 * @type {mongoose.Model<ProjectSchema>}
 */
const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
