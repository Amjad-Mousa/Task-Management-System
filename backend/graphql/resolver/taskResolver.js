const Task = require("../../models/taskModel");
const Admin = require("../../models/adminModel");
const Student = require("../../models/studentModel");
const Project = require("../../models/projectModel");
const { checkAuth } = require("../../middleware/auth");
const mongoose = require("mongoose");

const validateTaskInput = (input) => {
  const errors = {};

  // Title validation
  if (!input.title) {
    errors.title = "Task title is required";
  } else if (input.title.trim().length < 3) {
    errors.title = "Task title must be at least 3 characters";
  } else if (input.title.trim().length > 100) {
    errors.title = "Task title cannot exceed 100 characters";
  }

  // Description validation
  if (!input.description) {
    errors.description = "Task description is required";
  } else if (input.description.trim().length < 10) {
    errors.description = "Description must be at least 10 characters";
  }

  // Due date validation
  if (!input.dueDate) {
    errors.dueDate = "Due date is required";
  } else {
    const dueDate = new Date(input.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.dueDate = "Invalid due date format";
    }
  }

  // Status validation
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

// Validate references to other entities
const validateReferences = async (input) => {
  const errors = {};

  // Validate admin reference
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

  // Validate student reference
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

  // Validate project reference
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

  // Validate creator admin reference
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
const getAllTasks = async () => {
  try {
    const tasks = await Task.find();
    return tasks;
  } catch (error) {
    throw new Error(`Error fetching tasks: ${error.message}`);
  }
};
const getTasksByProject = async (_, { projectId }) => {
  try {
    const tasks = await Task.find({ assignedProjectId: projectId });
    return tasks;
  } catch (error) {
    throw new Error(`Error fetching tasks: ${error.message}`);
  }
};
const getRecentTasks = async (_, { limit }) => {
  try {
    const tasks = await Task.find().sort({ updatedAt: -1 }).limit(limit);
    return tasks;
  } catch (error) {
    throw new Error(`Error fetching recent tasks: ${error.message}`);
  }
};
const createTask = async (_, { input }, context) => {
  try {
    // Check authentication
    const decodedToken = checkAuth(context);

    // Only admins can create tasks
    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to create tasks");
    }

    // Validate input data
    const { errors: inputErrors, valid: inputValid } = validateTaskInput(input);
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
      input.status = "Not Started";
    }

    // Create new task
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
const updateTask = async (_, { id, input }, context) => {
  try {
    // Check authentication
    const decodedToken = checkAuth(context);

    // Only admins and students can update tasks
    if (decodedToken.role !== "admin" && decodedToken.role !== "student") {
      throw new Error("Not authorized to update tasks");
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid task ID format");
    }

    // Check if task exists
    const existingTask = await Task.findById(id);
    if (!existingTask) {
      throw new Error("Task not found");
    }

    // Only validate fields that are being updated
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

    // Validate references if they're being updated
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

    // Prepare update object
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

    // Update the task
    const updatedTask = await Task.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return updatedTask;
  } catch (error) {
    throw new Error(`Error updating task: ${error.message}`);
  }
};
const deleteTask = async (_, { id }, context) => {
  try {
    // Check authentication
    const decodedToken = checkAuth(context);

    // Only admins can delete tasks
    if (decodedToken.role !== "admin") {
      throw new Error("Not authorized to delete tasks");
    }

    // Delete the task
    const deletedTask = await Task.findByIdAndDelete(id);
    return deletedTask;
  } catch (error) {
    throw new Error(`Error deleting task: ${error.message}`);
  }
};

module.exports = {
  getRecentTasks,
  getTaskById,
  getAllTasks,
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
};
