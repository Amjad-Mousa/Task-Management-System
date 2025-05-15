/**
 * Student Model
 *
 * Represents a student user in the system with academic information.
 * Extends the base User model with student-specific fields.
 *
 * @module models/studentModel
 */
const mongoose = require("mongoose");

/**
 * Student Schema
 *
 * @typedef {Object} StudentSchema
 * @property {mongoose.Schema.Types.ObjectId} user_id - Reference to the User model
 * @property {string} universityId - The student's university ID number
 * @property {string} major - The student's field of study
 * @property {string} year - The student's academic year
 * @property {Date} createdAt - Timestamp when the student record was created
 * @property {Date} updatedAt - Timestamp when the student record was last updated
 */
const studentSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    universityId: {
      type: String,
      required: true,
      trim: true,
    },
    major: {
      type: String,
      required: true,
      trim: true,
    },
    year: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

/**
 * Student Model
 * @type {mongoose.Model<StudentSchema>}
 */
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
