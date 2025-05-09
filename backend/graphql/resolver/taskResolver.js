import Task from "../../models/taskModel.js";

const getTasks = async () => {
  try {
    const tasks = await Task.find();
    return tasks;
  } catch (err) {
    throw new Error(err);
  }
};

const getTask = async ({ id }) => {
  try {
    const task = await Task.findById(id);
    return task;
  } catch (err) {
    throw new Error(err);
  }
};

const getTasksByProject = async ({ projectId }) => {
  try {
    const tasks = await Task.find({ projectName: projectId });
    return tasks;
  } catch (err) {
    throw new Error(err);
  }
};

const getTasksByStudent = async ({ studentId }) => {
  try {
    const tasks = await Task.find({ studentsWorkingOn: studentId });
    return tasks;
  } catch (err) {
    throw new Error(err);
  }
};

const createTask = async ({
  title,
  description,
  dueDate,
  status,
  assignedUser,
  studentsWorkingOn,
  projectName,
  createdBy,
}) => {
  try {
    const task = await Task.create({
      title,
      description,
      dueDate,
      status: status || "Pending",
      assignedUser,
      studentsWorkingOn: studentsWorkingOn || [],
      projectName,
      createdBy,
    });
    return task;
  } catch (err) {
    throw new Error(err);
  }
};

const updateTask = async ({
  id,
  title,
  description,
  dueDate,
  status,
  assignedUser,
  studentsWorkingOn,
}) => {
  try {
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (dueDate) updateData.dueDate = dueDate;
    if (status) updateData.status = status;
    if (assignedUser) updateData.assignedUser = assignedUser;
    if (studentsWorkingOn) updateData.studentsWorkingOn = studentsWorkingOn;

    const task = await Task.findByIdAndUpdate(id, updateData, { new: true });
    return task;
  } catch (err) {
    throw new Error(err);
  }
};

const deleteTask = async ({ id }) => {
  try {
    const task = await Task.findByIdAndDelete(id);
    return task;
  } catch (err) {
    throw new Error(err);
  }
};

const resolvers = {
  getTasks,
  getTask,
  getTasksByProject,
  getTasksByStudent,
  createTask,
  updateTask,
  deleteTask,
};

export default resolvers;