/**
 * Task Resolver
 *
 * Handles operations related to tasks including fetching, creating, updating, and deleting task records.
 *
 * @module graphql/resolver/taskResolver
 */
const Task = require("../../models/taskModel");
const Admin = require("../../models/adminModel");
const Student = require("../../models/studentModel");
const Project = require("../../models/projectModel");
const { checkAuth } = require("../../middleware/auth");
const mongoose = require("mongoose");

/**
 * Validates task input data
 *
 * @param {Object} input - Task input data to validate
 * @returns {Object} Object containing validation errors and validity status
 */
const validateTaskInput = (input) => {
  const errors = {};

  if (!input.title) {
    errors.title = "Task title is required";
  } else if (input.title.trim().length < 3) {
    errors.title = "Task title must be at least 3 characters";
  } else if (input.title.trim().length > 100) {
    errors.title = "Task title cannot exceed 100 characters";
  }

  if (!input.description) {
    errors.description = "Task description is required";
  } else if (input.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }

  if (!input.dueDate) {
    errors.dueDate = "Due date is required";
  } else {
    const dueDate = new Date(input.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.dueDate = "Invalid due date format";
    }
  }

  if (input.status) {
    const validStatuses = [
      "Not Started",
      "In Progress",
      "Completed",
      "Pending",
    ];
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
 * Validates references to other entities in task data
 *
 * @async
 * @param {Object} input - Task input data containing references to validate
 * @returns {Promise<Object>} Object containing validation errors and validity status
 */
const validateReferences = async (input) => {
  const errors = {};

  if (input.assignedAdminId) {
    if (!mongoose.Types.ObjectId.isValid(input.assignedAdminId)) {
      errors.assignedAdminId = "Invalid admin ID format";
    } else {
      const admin = await Admin.findById(input.assignedAdminId);
      if (!admin) {
        errors.assignedAdminId = "Admin not found";
      }
    }
  }

  if (input.assignedStudentId) {
    if (!mongoose.Types.ObjectId.isValid(input.assignedStudentId)) {
      errors.assignedStudentId = "Invalid student ID format";
    } else {
      const student = await Student.findById(input.assignedStudentId);
      if (!student) {
        errors.assignedStudentId = "Student not found";
      }
    }
  }

  if (input.assignedProjectId) {
    if (!mongoose.Types.ObjectId.isValid(input.assignedProjectId)) {
      errors.assignedProjectId = "Invalid project ID format";
    } else {
      const project = await Project.findById(input.assignedProjectId);
      if (!project) {
        errors.assignedProjectId = "Project not found";
      }
    }
  }

  if (input.createdByAdminId) {
    if (!mongoose.Types.ObjectId.isValid(input.createdByAdminId)) {
      errors.createdByAdminId = "Invalid admin ID format";
    } else {
      const admin = await Admin.findById(input.createdByAdminId);
      if (!admin) {
        errors.createdByAdminId = "Admin not found";
      }
    }
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0,
  };
};

/**
 * Get a task by ID
 *
 * @async
 * @param {Object} _ - Parent resolver (not used)
 * @param {Object} params - Query parameters
 * @param {string} params.id - Task ID
 * @returns {Promise<Object>} Task data
 * @throws {Error} If task not found
 */
const getTaskById = async (_, { id }) => {
  try {
    const task = await Task.findById(id);
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  } catch (error) {
    throw new Error(`Error fetching task: ${error.message}`);
  }
};

/**
 * Get all tasks
 *
 * @async
 * @returns {Promise<Array>} List of all tasks
 * @throws {Error} If fetching tasks fails
 */
const getAllTasks = async () => {
  try {
    const tasks = await Task.find();
    return tasks;
  } catch (error) {
    throw new Error(`Error fetching tasks: ${error.message}`);
  }
};

/**
 * Get tasks by project ID
 *
 * @async
 * @param {Object} _ - Parent resolver (not used)
 * @param {Object} params - Query parameters
 * @param {string} params.projectId - Project ID
 * @returns {Promise<Array>} List of tasks associated with the project
 * @throws {Error} If fetching tasks fails
 */
const getTasksByProject = async (_, { projectId }) => {
  try {
    const tasks = await Task.find({ assignedProject: projectId });
    return tasks;
  } catch (error) {
    throw new Error(`Error fetching tasks: ${error.message}`);
  }
};

/**
 * Get recent tasks with limit
 *
 * @async
 * @param {Object} _ - Parent resolver (not used)
 * @param {Object} params - Query parameters
 * @param {number} params.limit - Maximum number of tasks to return
 * @returns {Promise<Array>} List of recent tasks
 * @throws {Error} If fetching tasks fails
 */
const getRecentTasks = async (_, { limit }) => {
  try {
    const tasks = await Task.find().sort({ updatedAt: -1 }).limit(limit);
    return tasks;
  } catch (error) {
    throw new Error(`Error fetching recent tasks: ${error.message}`);
  }
};

/**
 * Create a new task
 *
 * @async
 * @param {Object} _ - Parent resolver (not used)
 * @param {Object} params - Mutation parameters
 * @param {Object} params.input - Task creation input data
 * @param {Object} context - GraphQL context containing request and response objects
 * @returns {Promise<Object>} Newly created task
 * @throws {Error} If user is not authenticated, not authorized, or validation fails
 */
const createTask = async (_, { input }, context) => {
  try {
    const decodedToken = checkAuth(context);

    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to create tasks");
    }

    const { errors: inputErrors, valid: inputValid } = validateTaskInput(input);
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
      input.status = "Not Started";
    }

    const task = new Task({
      title: input.title,
      description: input.description,
      dueDate: new Date(input.dueDate),
      status: input.status,
      assignedAdmin: input.assignedAdminId,
      assignedStudent: input.assignedStudentId,
      assignedProject: input.assignedProjectId,
      createdByAdmin: input.createdByAdminId,
    });

    return await task.save();
  } catch (error) {
    throw new Error(`Error creating task: ${error.message}`);
  }
};

/**
 * Update an existing task
 *
 * @async
 * @param {Object} _ - Parent resolver (not used)
 * @param {Object} params - Mutation parameters
 * @param {string} params.id - Task ID
 * @param {Object} params.input - Task update input data
 * @param {Object} context - GraphQL context containing request and response objects
 * @returns {Promise<Object>} Updated task
 * @throws {Error} If user is not authenticated, not authorized, or validation fails
 */
const updateTask = async (_, { id, input }, context) => {
  try {
    const decodedToken = checkAuth(context);

    if (decodedToken.role !== "admin" && decodedToken.role !== "student") {
      throw new Error("Not authorized to update tasks");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid task ID format");
    }

    const existingTask = await Task.findById(id);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    const fieldsToValidate = {};
    if (input.title !== undefined) fieldsToValidate.title = input.title;
    if (input.description !== undefined)
      fieldsToValidate.description = input.description;
    if (input.dueDate !== undefined) fieldsToValidate.dueDate = input.dueDate;
    if (input.status !== undefined) fieldsToValidate.status = input.status;

    if (Object.keys(fieldsToValidate).length > 0) {
      const { errors: inputErrors, valid: inputValid } =
        validateTaskInput(fieldsToValidate);
      if (!inputValid) {
        throw new Error(`Validation error: ${JSON.stringify(inputErrors)}`);
      }
    }

    const refsToValidate = {};
    if (input.assignedAdminId !== undefined)
      refsToValidate.assignedAdminId = input.assignedAdminId;
    if (input.assignedStudentId !== undefined)
      refsToValidate.assignedStudentId = input.assignedStudentId;
    if (input.assignedProjectId !== undefined)
      refsToValidate.assignedProjectId = input.assignedProjectId;

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

    const updateData = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined)
      updateData.description = input.description;
    if (input.dueDate !== undefined)
      updateData.dueDate = new Date(input.dueDate);
    if (input.status !== undefined) updateData.status = input.status;
    if (input.assignedAdminId !== undefined)
      updateData.assignedAdmin = input.assignedAdminId;
    if (input.assignedStudentId !== undefined)
      updateData.assignedStudent = input.assignedStudentId;
    if (input.assignedProjectId !== undefined)
      updateData.assignedProject = input.assignedProjectId;

    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return updatedTask;
  } catch (error) {
    throw new Error(`Error updating task: ${error.message}`);
  }
};

/**
 * Delete a task
 *
 * @async
 * @param {Object} _ - Parent resolver (not used)
 * @param {Object} params - Mutation parameters
 * @param {string} params.id - Task ID
 * @param {Object} context - GraphQL context containing request and response objects
 * @returns {Promise<Object>} Deleted task
 * @throws {Error} If user is not authenticated or not authorized
 */
const deleteTask = async (_, { id }, context) => {
  try {
    const decodedToken = checkAuth(context);

    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to delete tasks");
    }

    const deletedTask = await Task.findByIdAndDelete(id);
    return deletedTask;
  } catch (error) {
    throw new Error(`Error deleting task: ${error.message}`);
  }
};

/**
 * Get the admin assigned to a task
 *
 * @async
 * @param {Object} parent - Parent resolver containing task data
 * @returns {Promise<Object|null>} Admin assigned to the task or null if not found
 */
const getTaskAssignedAdmin = async (parent) => {
  try {
    if (!parent.assignedAdmin) return null;
    return await Admin.findById(parent.assignedAdmin);
  } catch (error) {
    console.error("Error fetching task assigned admin:", error);
    return null;
  }
};

/**
 * Get the student assigned to a task
 *
 * @async
 * @param {Object} parent - Parent resolver containing task data
 * @returns {Promise<Object|null>} Student assigned to the task or null if not found
 */
const getTaskAssignedStudent = async (parent) => {
  try {
    if (!parent.assignedStudent) return null;
    return await Student.findById(parent.assignedStudent);
  } catch (error) {
    console.error("Error fetching task assigned student:", error);
    return null;
  }
};

/**
 * Get the project assigned to a task
 *
 * @async
 * @param {Object} parent - Parent resolver containing task data
 * @returns {Promise<string|null>} Project ID assigned to the task or null if not found
 */
const getTaskAssignedProject = async (parent) => {
  try {
    if (!parent.assignedProject) return null;
    return parent.assignedProject; // Return just the ID since we're using GraphQLID type
  } catch (error) {
    console.error("Error fetching task assigned project:", error);
    return null;
  }
};

/**
 * Get the admin who created the task
 *
 * @async
 * @param {Object} parent - Parent resolver containing task data
 * @returns {Promise<Object|null>} Admin who created the task or null if not found
 */
const getTaskCreatedByAdmin = async (parent) => {
  try {
    if (!parent.createdByAdmin) return null;
    return await Admin.findById(parent.createdByAdmin);
  } catch (error) {
    console.error("Error fetching task created by admin:", error);
    return null;
  }
};

/**
 * Export task resolver functions
 * @type {Object}
 */
module.exports = {
  getRecentTasks,
  getTaskById,
  getAllTasks,
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  getTaskAssignedAdmin,
  getTaskAssignedStudent,
  getTaskAssignedProject,
  getTaskCreatedByAdmin,
};
