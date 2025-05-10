import Task from '../../models/taskModel.js';

const taskResolvers = {
  getTasks: async () => {
    return await Task.find();
  },
  getTask: async ({ id }) => {
    const task = await Task.findById(id);
    if (!task) throw new Error("Task not found");
    return task;
  },
  addTask: async ({ title, description, dueDate, status, projectName, createdBy }) => {
    const existingTask = await Task.findOne({ title });
    if (existingTask) throw new Error("Task with this title already exists");
    const newTask = new Task({
      title,
      description,
      dueDate,
      status,
      projectName,
      createdBy,
    });
    await newTask.save();
    return newTask;
  },
  updateTask: async ({ id, ...args }) => {
    const task = await Task.findById(id);
    if (!task) throw new Error("Task not found");
    const updated = await Task.findByIdAndUpdate(id, args, { new: true });
    if (!updated) throw new Error("Task not found");
    return updated;
  },
  deleteTask: async ({ id }) => {
    const deleted = await Task.findByIdAndDelete(id);
    if (!deleted) throw new Error("Task not found");
    return "Task deleted successfully";
  },
};

export default taskResolvers;
