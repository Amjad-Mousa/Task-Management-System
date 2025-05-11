const Project = require("../../models/projectModel");
const Admin = require("../../models/adminModel");
const Student = require("../../models/studentModel");
const Task = require("../../models/taskModel");
const { checkAuth } = require("../../middleware/auth");
const mongoose = require("mongoose");

// Validate project input
const validateProjectInput = (input) => {
  const errors = {};

  // Project name validation
  if (!input.projectName) {
    errors.projectName = "Project name is required";
  } else if (input.projectName.trim().length < 3) {
    errors.projectName = "Project name must be at least 3 characters";
  } else if (input.projectName.trim().length > 100) {
    errors.projectName = "Project name cannot exceed 100 characters";
  }

  // Project description validation
  if (!input.projectDescription) {
    errors.projectDescription = "Project description is required";
  } else if (input.projectDescription.trim().length < 10) {
    errors.projectDescription = "Description must be at least 10 characters";
  }

  // Start date validation
  if (input.startDate) {
    const startDate = new Date(input.startDate);
    if (isNaN(startDate.getTime())) {
      errors.startDate = "Invalid start date format";
    }
  }

  // End date validation
  if (input.endDate) {
    const endDate = new Date(input.endDate);
    if (isNaN(endDate.getTime())) {
      errors.endDate = "Invalid end date format";
    }

    // Check if end date is after start date
    if (input.startDate) {
      const startDate = new Date(input.startDate);
      if (
        !isNaN(startDate.getTime()) &&
        !isNaN(endDate.getTime()) &&
        endDate < startDate
      ) {
        errors.endDate = "End date must be after start date";
      }
    }
  }

  // Status validation
  if (input.status) {
    const validStatuses = ["Pending", "In_Progress", "Completed"];
    if (!validStatuses.includes(input.status)) {
      errors.status = "Invalid status value";
    }
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

// Validate references to other entities
const validateReferences = async (input) => {
  const errors = {};

  // Validate creator admin reference
  if (input.createdBy) {
    if (!mongoose.Types.ObjectId.isValid(input.createdBy)) {
      errors.createdBy = "Invalid admin ID format";
    } else {
      const admin = await Admin.findById(input.createdBy);
      if (!admin) {
        errors.createdBy = "Admin not found";
      }
    }
  }

  // Validate students working on project
  if (input.studentsWorkingOn && input.studentsWorkingOn.length > 0) {
    for (let i = 0; i < input.studentsWorkingOn.length; i++) {
      const studentId = input.studentsWorkingOn[i];
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        errors[`studentsWorkingOn[${i}]`] = "Invalid student ID format";
      } else {
        const student = await Student.findById(studentId);
        if (!student) {
          errors[`studentsWorkingOn[${i}]`] = "Student not found";
        }
      }
    }
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

const projectResolvers = {
  // Get all projects
  getAllProjects: async (_, _args, context) => {
    // Only allow authenticated users to access all projects
    checkAuth(context);
    return await Project.find();
  },

  // Get project tasks
  getProjectTasks: async (parent) => {
    try {
      if (!parent.id) return [];
      // Find tasks associated with this project
      const tasks = await Task.find({ assignedProject: parent.id }).select(
        "_id"
      );
      return tasks.map((task) => task._id);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      return [];
    }
  },

  // Get the admin who created the project
  getProjectCreatedBy: async (parent) => {
    try {
      if (!parent.createdBy) return null;
      return await Admin.findById(parent.createdBy);
    } catch (error) {
      console.error("Error fetching project creator:", error);
      return null;
    }
  },

  // Get students working on the project
  getProjectStudentsWorkingOn: async (parent) => {
    try {
      if (!parent.studentsWorkingOn || parent.studentsWorkingOn.length === 0)
        return [];
      return await Student.find({ _id: { $in: parent.studentsWorkingOn } });
    } catch (error) {
      console.error("Error fetching students working on project:", error);
      return [];
    }
  },

  // Get a single project by ID
  getProjectById: async (_, { id }, context) => {
    try {
      // Check authentication
      checkAuth(context);

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid project ID format");
      }

      const project = await Project.findById(id);
      if (!project) {
        throw new Error("Project not found");
      }
      return project;
    } catch (error) {
      throw new Error(`Error fetching project: ${error.message}`);
    }
  },

  // Get projects by admin ID
  getProjectsByAdmin: async (_, { adminId }, context) => {
    try {
      // Check authentication
      checkAuth(context);

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid admin ID format");
      }

      const projects = await Project.find({ createdBy: adminId });
      return projects;
    } catch (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }
  },

  // Get projects by student ID
  getProjectsByStudent: async (_, { studentId }, context) => {
    try {
      // Check authentication
      checkAuth(context);

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new Error("Invalid student ID format");
      }

      const projects = await Project.find({ studentsWorkingOn: studentId });
      return projects;
    } catch (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }
  },

  // Create a new project
  createProject: async (_, { input }, context) => {
    try {
      // Check authentication
      const decodedToken = checkAuth(context);

      // Only admins can create projects
      if (decodedToken.role !== "admin") {
        throw new Error("Not authorized to create projects");
      }

      // Find the admin record for the authenticated user
      const admin = await Admin.findOne({ user_id: decodedToken.userId });
      if (!admin) {
        throw new Error("Admin record not found for authenticated user");
      }

      // Set the createdBy field to the admin's ID if not provided
      if (!input.createdBy) {
        input.createdBy = admin.id;
      }

      // Validate input data
      const { errors: inputErrors, valid: inputValid } =
        validateProjectInput(input);
      if (!inputValid) {
        throw new Error(`Validation error: ${JSON.stringify(inputErrors)}`);
      }

      // Validate references to other entities
      const { errors: refErrors, valid: refValid } = await validateReferences(
        input
      );
      if (!refValid) {
        throw new Error(
          `Reference validation error: ${JSON.stringify(refErrors)}`
        );
      }

      // Set default status if not provided
      if (!input.status) {
        input.status = "Pending";
      }

      // Create new project
      const project = new Project(input);
      return await project.save();
    } catch (error) {
      throw new Error(`Error creating project: ${error.message}`);
    }
  },

  // Update a project
  updateProject: async (_, { id, input }, context) => {
    try {
      // Check authentication
      const decodedToken = checkAuth(context);

      // Only admins can update projects
      if (decodedToken.role !== "admin") {
        throw new Error("Not authorized to update projects");
      }

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid project ID format");
      }

      // Check if project exists
      const existingProject = await Project.findById(id);
      if (!existingProject) {
        throw new Error("Project not found");
      }

      // Only validate fields that are being updated
      const fieldsToValidate = {};
      if (input.projectName !== undefined)
        fieldsToValidate.projectName = input.projectName;
      if (input.projectDescription !== undefined)
        fieldsToValidate.projectDescription = input.projectDescription;
      if (input.startDate !== undefined)
        fieldsToValidate.startDate = input.startDate;
      if (input.endDate !== undefined) fieldsToValidate.endDate = input.endDate;
      if (input.status !== undefined) fieldsToValidate.status = input.status;

      // Add start date for end date validation if needed
      if (
        input.endDate !== undefined &&
        input.startDate === undefined &&
        existingProject.startDate
      ) {
        fieldsToValidate.startDate = existingProject.startDate;
      }

      if (Object.keys(fieldsToValidate).length > 0) {
        const { errors: inputErrors, valid: inputValid } =
          validateProjectInput(fieldsToValidate);
        if (!inputValid) {
          throw new Error(`Validation error: ${JSON.stringify(inputErrors)}`);
        }
      }

      // Validate references if they're being updated
      const refsToValidate = {};
      if (input.createdBy !== undefined)
        refsToValidate.createdBy = input.createdBy;
      if (input.studentsWorkingOn !== undefined)
        refsToValidate.studentsWorkingOn = input.studentsWorkingOn;

      if (Object.keys(refsToValidate).length > 0) {
        const { errors: refErrors, valid: refValid } = await validateReferences(
          refsToValidate
        );
        if (!refValid) {
          throw new Error(
            `Reference validation error: ${JSON.stringify(refErrors)}`
          );
        }
      }

      // Update the project
      const updatedProject = await Project.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
      });

      return updatedProject;
    } catch (error) {
      throw new Error(`Error updating project: ${error.message}`);
    }
  },

  // Delete a project
  deleteProject: async (_, { id }, context) => {
    try {
      // Check authentication
      const decodedToken = checkAuth(context);

      // Only admins can delete projects
      if (decodedToken.role !== "admin") {
        throw new Error("Not authorized to delete projects");
      }

      // Validate ID format
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid project ID format");
      }

      // Check if project exists
      const existingProject = await Project.findById(id);
      if (!existingProject) {
        throw new Error("Project not found");
      }

      // Check if there are tasks associated with this project
      const associatedTasks = await Task.find({ assignedProject: id });
      if (associatedTasks.length > 0) {
        throw new Error(
          "Cannot delete project with associated tasks. Please delete or reassign tasks first."
        );
      }

      // Delete the project
      const deletedProject = await Project.findByIdAndDelete(id);
      return deletedProject;
    } catch (error) {
      throw new Error(`Error deleting project: ${error.message}`);
    }
  },
};

module.exports = projectResolvers;
