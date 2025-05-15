/**
 * Project Resolver
 *
 * Handles operations related to projects including fetching, creating, updating, and deleting project records.
 *
 * @module graphql/resolver/projectResolver
 */
const Project = require("../../models/projectModel");
const Admin = require("../../models/adminModel");
const Student = require("../../models/studentModel");
const Task = require("../../models/taskModel");
const { checkAuth } = require("../../middleware/auth");
const mongoose = require("mongoose");

/**
 * Validates project input data
 *
 * @param {Object} input - Project input data to validate
 * @returns {Object} Object containing validation errors and validity status
 */
const validateProjectInput = (input) => {
  const errors = {};

  if (!input.projectName) {
    errors.projectName = "Project name is required";
  } else if (input.projectName.trim().length < 3) {
    errors.projectName = "Project name must be at least 3 characters";
  } else if (input.projectName.trim().length > 100) {
    errors.projectName = "Project name cannot exceed 100 characters";
  }

  if (!input.projectDescription) {
    errors.projectDescription = "Project description is required";
  } else if (input.projectDescription.trim().length < 10) {
    errors.projectDescription = "Description must be at least 10 characters";
  }

  if (input.startDate) {
    const startDate = new Date(input.startDate);
    if (isNaN(startDate.getTime())) {
      errors.startDate = "Invalid start date format";
    }
  }

  if (input.endDate) {
    const endDate = new Date(input.endDate);
    if (isNaN(endDate.getTime())) {
      errors.endDate = "Invalid end date format";
    }

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

/**
 * Validates references to other entities in project data
 *
 * @async
 * @param {Object} input - Project input data containing references to validate
 * @returns {Promise<Object>} Object containing validation errors and validity status
 */
const validateReferences = async (input) => {
  const errors = {};

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

/**
 * Project resolvers for GraphQL operations
 * @type {Object}
 */
const projectResolvers = {
  /**
   * Get all projects
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} _args - Query arguments (not used)
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Array>} List of all projects
   * @throws {Error} If user is not authenticated
   */
  getAllProjects: async (_, _args, context) => {
    checkAuth(context);
    return await Project.find();
  },

  /**
   * Get tasks associated with a project
   *
   * @async
   * @param {Object} parent - Parent resolver containing project data
   * @returns {Promise<Array>} List of task IDs associated with the project
   */
  getProjectTasks: async (parent) => {
    try {
      if (!parent.id) return [];

      const tasks = await Task.find({ assignedProject: parent.id }).select(
        "_id"
      );
      return tasks.map((task) => task._id);
    } catch (error) {
      console.error("Error fetching project tasks:", error);
      return [];
    }
  },

  /**
   * Get the admin who created the project
   *
   * @async
   * @param {Object} parent - Parent resolver containing project data
   * @returns {Promise<Object|null>} Admin who created the project or null if not found
   */
  getProjectCreatedBy: async (parent) => {
    try {
      if (!parent.createdBy) return null;
      return await Admin.findById(parent.createdBy);
    } catch (error) {
      console.error("Error fetching project creator:", error);
      return null;
    }
  },

  /**
   * Get students working on the project
   *
   * @async
   * @param {Object} parent - Parent resolver containing project data
   * @returns {Promise<Array>} List of students working on the project
   */
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

  /**
   * Get a single project by ID
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Query parameters
   * @param {string} params.id - Project ID
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Project data
   * @throws {Error} If user is not authenticated or project not found
   */
  getProjectById: async (_, { id }, context) => {
    try {
      checkAuth(context);

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

  /**
   * Get projects by admin ID
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Query parameters
   * @param {string} params.adminId - Admin ID
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Array>} List of projects created by the admin
   * @throws {Error} If user is not authenticated or admin ID is invalid
   */
  getProjectsByAdmin: async (_, { adminId }, context) => {
    try {
      checkAuth(context);

      if (!mongoose.Types.ObjectId.isValid(adminId)) {
        throw new Error("Invalid admin ID format");
      }

      const projects = await Project.find({ createdBy: adminId });
      return projects;
    } catch (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }
  },

  /**
   * Get projects by student ID
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Query parameters
   * @param {string} params.studentId - Student ID
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Array>} List of projects the student is working on
   * @throws {Error} If user is not authenticated or student ID is invalid
   */
  getProjectsByStudent: async (_, { studentId }, context) => {
    try {
      checkAuth(context);

      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        throw new Error("Invalid student ID format");
      }

      const projects = await Project.find({ studentsWorkingOn: studentId });
      return projects;
    } catch (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }
  },

  /**
   * Create a new project
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Mutation parameters
   * @param {Object} params.input - Project creation input data
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Newly created project
   * @throws {Error} If user is not authenticated, not authorized, or validation fails
   */
  createProject: async (_, { input }, context) => {
    try {
      const decodedToken = checkAuth(context);

      if (decodedToken.role !== "admin") {
        throw new Error("Not authorized to create projects");
      }

      const admin = await Admin.findOne({ user_id: decodedToken.userId });
      if (!admin) {
        throw new Error("Admin record not found for authenticated user");
      }

      if (!input.createdBy) {
        input.createdBy = admin.id;
      }

      const { errors: inputErrors, valid: inputValid } =
        validateProjectInput(input);
      if (!inputValid) {
        throw new Error(`Validation error: ${JSON.stringify(inputErrors)}`);
      }

      const { errors: refErrors, valid: refValid } = await validateReferences(
        input
      );
      if (!refValid) {
        throw new Error(
          `Reference validation error: ${JSON.stringify(refErrors)}`
        );
      }

      if (!input.status) {
        input.status = "Pending";
      }

      const project = new Project(input);
      return await project.save();
    } catch (error) {
      throw new Error(`Error creating project: ${error.message}`);
    }
  },

  /**
   * Update an existing project
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Mutation parameters
   * @param {string} params.id - Project ID
   * @param {Object} params.input - Project update input data
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Updated project
   * @throws {Error} If user is not authenticated, not authorized, or validation fails
   */
  updateProject: async (_, { id, input }, context) => {
    try {
      const decodedToken = checkAuth(context);

      if (decodedToken.role !== "admin") {
        throw new Error("Not authorized to update projects");
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid project ID format");
      }

      const existingProject = await Project.findById(id);
      if (!existingProject) {
        throw new Error("Project not found");
      }

      const fieldsToValidate = {};
      if (input.projectName !== undefined)
        fieldsToValidate.projectName = input.projectName;
      if (input.projectDescription !== undefined)
        fieldsToValidate.projectDescription = input.projectDescription;
      if (input.startDate !== undefined)
        fieldsToValidate.startDate = input.startDate;
      if (input.endDate !== undefined) fieldsToValidate.endDate = input.endDate;
      if (input.status !== undefined) fieldsToValidate.status = input.status;

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

      const updatedProject = await Project.findByIdAndUpdate(id, input, {
        new: true,
        runValidators: true,
      });

      return updatedProject;
    } catch (error) {
      throw new Error(`Error updating project: ${error.message}`);
    }
  },

  /**
   * Delete a project
   *
   * @async
   * @param {Object} _ - Parent resolver (not used)
   * @param {Object} params - Mutation parameters
   * @param {string} params.id - Project ID
   * @param {Object} context - GraphQL context containing request and response objects
   * @returns {Promise<Object>} Deleted project
   * @throws {Error} If user is not authenticated, not authorized, or project has associated tasks
   */
  deleteProject: async (_, { id }, context) => {
    try {
      const decodedToken = checkAuth(context);

      if (decodedToken.role !== "admin") {
        throw new Error("Not authorized to delete projects");
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid project ID format");
      }

      const existingProject = await Project.findById(id);
      if (!existingProject) {
        throw new Error("Project not found");
      }

      const associatedTasks = await Task.find({ assignedProject: id });
      if (associatedTasks.length > 0) {
        throw new Error(
          "Cannot delete project with associated tasks. Please delete or reassign tasks first."
        );
      }

      const deletedProject = await Project.findByIdAndDelete(id);
      return deletedProject;
    } catch (error) {
      throw new Error(`Error deleting project: ${error.message}`);
    }
  },
};

/**
 * Export project resolver functions
 * @type {Object}
 */
module.exports = projectResolvers;
