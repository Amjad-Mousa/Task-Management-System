import Project from "../../models/projectModel.js";

const getProjects = async () => {
  try {
    const projects = await Project.find();
    return projects;
  } catch (err) {
    throw new Error(err);
  }
};

const getProject = async ({ id }) => {
  try {
    const project = await Project.findById(id);
    return project;
  } catch (err) {
    throw new Error(err);
  }
};

const createProject = async ({
  projectName,
  projectDescription,
  createdBy,
  studentsWorkingOn,
  startDate,
  endDate,
  status,
  progress,
  tasks,
}) => {
  try {
    const project = await Project.create({
      projectName,
      projectDescription,
      createdBy,
      studentsWorkingOn,
      startDate,
      endDate,
      status,
      progress,
      tasks,
    });
    return project;
  } catch (err) {
    throw new Error(err);
  }
};

const updateProject = async ({
  id,
  projectName,
  projectDescription,
  createdBy,
  studentsWorkingOn,
  startDate,
  endDate,
  status,
  progress,
  tasks,
}) => {
  try {
    const updateData = {};
    if (projectName) updateData.projectName = projectName;
    if (projectDescription) updateData.projectDescription = projectDescription;
    if (createdBy) updateData.createdBy = createdBy;
    if (studentsWorkingOn) updateData.studentsWorkingOn = studentsWorkingOn;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (status) updateData.status = status;
    if (progress !== undefined) updateData.progress = progress;
    if (tasks) updateData.tasks = tasks;

    const project = await Project.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    return project;
  } catch (err) {
    throw new Error(err);
  }
};

const deleteProject = async ({ id }) => {
  try {
    const project = await Project.findByIdAndDelete(id);
    return project;
  } catch (err) {
    throw new Error(err);
  }
};

const resolvers = {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
};

export default resolvers;
