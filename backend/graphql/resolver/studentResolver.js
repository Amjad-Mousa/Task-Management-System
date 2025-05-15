/**
 * Student Resolver
 *
 * Handles operations related to student users including fetching, creating, updating, and deleting student records.
 *
 * @module graphql/resolver/studentResolver
 */
const Student = require("../../models/studentModel");
const User = require("../../models/userModel");
const mongoose = require("mongoose");
const { checkAuth } = require("../../middleware/auth");

/**
 * Student resolvers for GraphQL operations
 * @type {Object}
 */
const studentResolvers = {
  /**
   * Get all students
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} _args - Query arguments (not used)
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Array>} List of all students
   * @throws {Error} If user is not authenticated or not authorized
   */
  students: async (_, _args, context) => {
    const decodedToken = checkAuth(context);

    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to view all students");
    }

    return await Student.find();
  },

  /**
   * Get a single student by ID
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Query parameters
   * @param {string} params.id - Student ID
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Student data
   * @throws {Error} If user is not authenticated, not authorized, or student not found
   */
  student: async (_, { id }, context) => {
    const decodedToken = checkAuth(context);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid student ID");
    }

    const student = await Student.findById(id);
    if (!student) {
      throw new Error("Student not found");
    }

    const studentUser = await User.findById(student.user_id);
    if (
      decodedToken.role !== "admin" &&
      decodedToken.userId !== studentUser.id.toString()
    ) {
      throw new Error("Not authorized to view this student's details");
    }

    return student;
  },

  /**
   * Get a student by user ID
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Query parameters
   * @param {string} params.userId - User ID
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Student data
   * @throws {Error} If user is not authenticated, not authorized, or student not found
   */
  studentByUserId: async (_, { userId }, context) => {
    const decodedToken = checkAuth(context);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    if (decodedToken.role !== "admin" && decodedToken.userId !== userId) {
      throw new Error("Not authorized to view this student's details");
    }

    const student = await Student.findOne({ user_id: userId });
    if (!student) {
      throw new Error("Student not found");
    }

    return student;
  },

  /**
   * Get user details for a student
   *
   * @async
   * @param {Object} parent - Parent resolver containing student data
   * @returns {Promise<Object>} User data associated with the student
   */
  getStudentUser: async (parent) => {
    return await User.findById(parent.user_id);
  },

  /**
   * Create a new student
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Mutation parameters
   * @param {Object} params.input - Student creation input data
   * @returns {Promise<Object>} Newly created student
   * @throws {Error} If validation fails or student creation fails
   */
  createStudent: async (_, { input }) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(input.user_id)) {
        throw new Error("Invalid user ID");
      }

      const user = await User.findById(input.user_id);
      if (!user) {
        throw new Error("User not found");
      }

      const existingStudent = await Student.findOne({ user_id: input.user_id });
      if (existingStudent) {
        throw new Error("This user is already a student");
      }

      const student = new Student(input);
      return await student.save();
    } catch (error) {
      throw new Error(`Error creating student: ${error.message}`);
    }
  },

  /**
   * Update an existing student
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Mutation parameters
   * @param {string} params.id - Student ID
   * @param {Object} params.input - Student update input data
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Updated student
   * @throws {Error} If user is not authenticated, not authorized, or student not found
   */
  updateStudent: async (_, { id, input }, context) => {
    const decodedToken = checkAuth(context);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid student ID");
    }

    const student = await Student.findById(id);
    if (!student) {
      throw new Error("Student not found");
    }

    const studentUser = await User.findById(student.user_id);
    if (
      decodedToken.role !== "admin" &&
      decodedToken.userId !== studentUser.id.toString()
    ) {
      throw new Error("Not authorized to update this student");
    }

    const updatedStudent = await Student.findByIdAndUpdate(id, input, {
      new: true,
    });
    return updatedStudent;
  },

  /**
   * Delete a student
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Mutation parameters
   * @param {string} params.id - Student ID
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Deleted student
   * @throws {Error} If user is not authenticated, not authorized, or student not found
   */
  deleteStudent: async (_, { id }, context) => {
    const decodedToken = checkAuth(context);

    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to delete students");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid student ID");
    }

    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      throw new Error("Student not found");
    }

    return student;
  },
};

/**
 * Export student resolver functions
 * @type {Object}
 */
module.exports = studentResolvers;
