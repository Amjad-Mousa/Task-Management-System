  import Project from '../../models/projectModel.js';
  import Student from '../../models/studentModel.js';
  import Task from '../../models/taskModel.js';
  import Admin from '../../models/adminModel.js';

  const projectResolvers = {
    getProjects: async () => {
      try {
        return await Project.find()
          .populate('createdBy', 'name email')
          .populate('studentsWorkingOn', 'name email')
          .populate('tasks', 'title status');
      } catch (err) {
        throw new Error("Error fetching projects: " + err.message);
      }
    },

    getProject: async (_, { id }) => {
      try {
        const project = await Project.findById(id)
          .populate('createdBy', 'name email')
          .populate('studentsWorkingOn', 'name email')
          .populate('tasks', 'title status');
        if (!project) {
          throw new Error("Project not found");
        }
        return project;
      } catch (err) {
        throw new Error("Error fetching project: " + err.message);
      }
    },

    addProject: async ( _, { Title, projectDescription, createdBy, studentsWorkingOn, startDate, endDate, status, progress, tasks }) => {
      try {
    
        const existingProject = await Project.findOne({ Title });
        if (existingProject) {
          throw new Error("Project with this title already exists");
        }

        if (new Date(endDate) <= new Date(startDate)) {
          throw new Error("End date must be after start date");
        }

        const newProject = new Project({
          Title,
          projectDescription,
          createdBy,
          studentsWorkingOn,
          startDate,
          endDate,
          status,
          progress,
          tasks,
        });

        return await newProject.save();
      } catch (err) {
        throw new Error("Error adding project: " + err.message);
      }
    },

    updateProject: async (_, args) => {
      try {
        const {
          id,
          Title,
          projectDescription,
          createdBy,
          studentsWorkingOn,
          startDate,
          endDate,
          status,
          progress,
          tasks
        } = args;

        const project = await Project.findById(id);
        if (!project) {
          throw new Error("Project not found");
        }

        let adminId = project.createdBy;
        if (createdBy) {
          const admin = await Admin.findById(createdBy);
          if (!admin) {
            throw new Error("Admin not found");
          }
          adminId = admin._id;
        }

        let validatedStudents = project.studentsWorkingOn;
        if (studentsWorkingOn && studentsWorkingOn.length > 0) {
          validatedStudents = [];
          for (const studentId of studentsWorkingOn) {
            const student = await Student.findById(studentId);
            if (!student) {
              throw new Error(`Student with ID ${studentId} not found`);
            }
            validatedStudents.push(student._id);
          }
        }

        let validatedTasks = project.tasks;
        if (tasks && tasks.length > 0) {
          validatedTasks = [];
          for (const taskId of tasks) {
            const task = await Task.findById(taskId);
            if (!task) {
              throw new Error(`Task with ID ${taskId} not found`);
            }
            validatedTasks.push(task._id);
          }
        }

        if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
          throw new Error("End date must be after start date");
        }

        project.Title = Title || project.Title;
        project.projectDescription = projectDescription || project.projectDescription;
        project.createdBy = adminId;
        project.studentsWorkingOn = validatedStudents;
        project.startDate = startDate || project.startDate;
        project.endDate = endDate || project.endDate;
        project.status = status || project.status;
        if (progress !== undefined) project.progress = progress;
        project.tasks = validatedTasks;

        return await project.save();
      } catch (err) {
        throw new Error("Error updating project: " + err.message);
      }
    },

    deleteProject: async (_, { id }) => {
      try {
        const project = await Project.findById(id);
        if (!project) {
          throw new Error("Project not found");
        }

        await Project.findByIdAndDelete(id);
        return "Project deleted successfully";
      } catch (err) {
        throw new Error("Error deleting project: " + err.message);
      }
    },
  };

  export default projectResolvers;
