const Student = require("../../models/studentModel");
const User = require("../../models/userModel");
const mongoose = require("mongoose");
const { checkAuth } = require("../../middleware/auth");

const studentResolvers = {
  // Get all students
  students: async (_, _args, context) => {
    // Only allow authenticated users to access all students
    const decodedToken = checkAuth(context);
    
    // Only admins can see all students
    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to view all students");
    }
    
    return await Student.find();
  },

  // Get a single student by ID
  student: async (_, { id }, context) => {
    // Only allow authenticated users to access student details
    const decodedToken = checkAuth(context);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid student ID");
    }
    
    const student = await Student.findById(id);
    if (!student) {
      throw new Error("Student not found");
    }
    
    // Check if user is admin or the student themselves
    const studentUser = await User.findById(student.user_id);
    if (decodedToken.role !== "admin" && decodedToken.userId !== studentUser.id.toString()) {
      throw new Error("Not authorized to view this student's details");
    }
    
    return student;
  },
  
  // Get a student by user ID
  studentByUserId: async (_, { userId }, context) => {
    // Only allow authenticated users to access student details
    const decodedToken = checkAuth(context);
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }
    
    // Check if user is admin or the student themselves
    if (decodedToken.role !== "admin" && decodedToken.userId !== userId) {
      throw new Error("Not authorized to view this student's details");
    }
    
    const student = await Student.findOne({ user_id: userId });
    if (!student) {
      throw new Error("Student not found");
    }
    
    return student;
  },
  
  // Get user details for a student
  getStudentUser: async (parent) => {
    return await User.findById(parent.user_id);
  },

  // Create a new student
  createStudent: async (_, { input }, context) => {
    try {
      // Only allow authenticated users to create students
      const decodedToken = checkAuth(context);
      
      // Only admins can create students
      if (decodedToken.role !== "admin") {
        throw new Error("Not authorized to create students");
      }
      
      // Check if user exists
      if (!mongoose.Types.ObjectId.isValid(input.user_id)) {
        throw new Error("Invalid user ID");
      }
      
      const user = await User.findById(input.user_id);
      if (!user) {
        throw new Error("User not found");
      }
      
      // Check if user is already a student
      const existingStudent = await Student.findOne({ user_id: input.user_id });
      if (existingStudent) {
        throw new Error("This user is already a student");
      }
      
      // Create new student
      const student = new Student(input);
      return await student.save();
    } catch (error) {
      throw new Error(`Error creating student: ${error.message}`);
    }
  },

  // Update an existing student
  updateStudent: async (_, { id, input }, context) => {
    // Check authentication
    const decodedToken = checkAuth(context);
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid student ID");
    }
    
    // Find the student
    const student = await Student.findById(id);
    if (!student) {
      throw new Error("Student not found");
    }
    
    // Check if user is admin or the student themselves
    const studentUser = await User.findById(student.user_id);
    if (decodedToken.role !== "admin" && decodedToken.userId !== studentUser.id.toString()) {
      throw new Error("Not authorized to update this student");
    }
    
    // Update the student
    const updatedStudent = await Student.findByIdAndUpdate(id, input, { new: true });
    return updatedStudent;
  },

  // Delete a student
  deleteStudent: async (_, { id }, context) => {
    // Check authentication
    const decodedToken = checkAuth(context);
    
    // Only admins can delete students
    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to delete students");
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid student ID");
    }
    
    // Delete the student
    const student = await Student.findByIdAndDelete(id);
    if (!student) {
      throw new Error("Student not found");
    }
    
    return student;
  },
};

module.exports = studentResolvers;
