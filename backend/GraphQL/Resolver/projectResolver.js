
import Project from '../../models/projectModel.js';
import Admin from '../../models/adminModel.js';
import Student from '../../models/studentModel.js';
import Task from '../../models/taskModel.js';

const projectResolvers = {
  getProjects: async () => await Project.find(),
  getProject: async ({ id }) => {
    const project = await Project.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    return project;
  },
  addProject: async ({ Title, projectDescription, createdBy, studentsWorkingOn, startDate, endDate, status, progress, tasks }) => {
    const project = await Project.findOne({ Title });
    if (project) {
      throw new Error("Project with this title already exists");
    }   
    const newProject = new Project({ Title, projectDescription, createdBy, studentsWorkingOn, startDate, endDate, status, progress, tasks });
    return await newProject.save();
  },
  updateProject: async ({ id, Title, projectDescription, createdBy, studentsWorkingOn, startDate, endDate, status, progress, tasks }) => {
    const project = await Project.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    return await Project.findByIdAndUpdate(id, { Title, projectDescription, createdBy, studentsWorkingOn, startDate, endDate, status, progress, tasks }, { new: true });
  },
  deleteProject: async ({ id }) => {
    const project = await Project.findById(id);
    if (!project) {
      throw new Error("Project not found");
    }
    await Project.findByIdAndDelete(id);
    return "Project deleted successfully";
  },
};

export default projectResolvers;


