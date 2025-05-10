import Project from '../../models/projectModel.js';
import Student from '../../models/studentModel.js';
import Task from '../../models/taskModel.js';
import Admin from '../../models/adminModel.js';
import mongoose from 'mongoose';

const projectResolvers = {
  getProjects: async () => {
    try {
      return await Project.find().populate('createdBy studentsWorkingOn tasks');
    } catch (err) {
      throw new Error("Error fetching projects: " + err.message);
    }
  },

  getProject: async ({ id }) => {
    try {
      const project = await Project.findById(id).populate('createdBy studentsWorkingOn tasks');
      if (!project) {
        throw new Error("Project not found");
      }
      return project;
    } catch (err) {
      throw new Error("Error fetching project: " + err.message);
    }
  },

  addProject: async ({ Title, projectDescription, createdBy, studentsWorkingOn, startDate, endDate, status, progress, tasks }) => {
    try {
      const existingProject = await Project.findOne({ Title });
      if (existingProject) {
        throw new Error("Project with this title already exists");
      }

      // ✅ تأكد من الأدمن
      let admin = await Admin.findById(createdBy);
      if (!admin) {
        admin = new Admin({ name: "Default Admin", email: "admin@example.com" });
        await admin.save();
      }

      // ✅ تأكد من الطلاب
      const validatedStudents = [];
      for (const studentId of studentsWorkingOn || []) {
        let student = await Student.findById(studentId);
        if (!student) {
          student = new Student({ major: "Unknown", year: "1", universityId: "N/A" });
          await student.save();
        }
        validatedStudents.push(student._id);
      }

      // ✅ تأكد من المهام
      const validatedTasks = [];
      for (const taskId of tasks || []) {
        let task = await Task.findById(taskId);
        if (!task) {
          task = new Task({ title: "New Task" });
          await task.save();
        }
        validatedTasks.push(task._id);
      }

    const newProject = new Project({
  Title,
  projectDescription,
  createdBy: new mongoose.Types.ObjectId(createdBy), // تحويل الـ ID إلى ObjectId
  studentsWorkingOn: studentsWorkingOn.map(student => new mongoose.Types.ObjectId(student)), // تحويل الـ IDs الخاصة بالطلاب إلى ObjectId
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

  updateProject: async ({ id, Title, projectDescription, createdBy, studentsWorkingOn, startDate, endDate, status, progress, tasks }) => {
    try {
      const project = await Project.findById(id);
      if (!project) {
        throw new Error("Project not found");
      }

      // ✅ تحقق من الأدمن
      let adminId = project.createdBy;
      if (createdBy) {
        let admin = await Admin.findById(createdBy);
        if (!admin) {
          admin = new Admin({ name: "Default Admin", email: "admin@example.com" });
          await admin.save();
        }
        adminId = admin._id;
      }

      // ✅ تحقق من الطلاب
      let validatedStudents = project.studentsWorkingOn;
      if (studentsWorkingOn && studentsWorkingOn.length > 0) {
        validatedStudents = [];
        for (const studentId of studentsWorkingOn) {
          let student = await Student.findById(studentId);
          if (!student) {
            student = new Student({ major: "Unknown", year: "1", universityId: "N/A" });
            await student.save();
          }
          validatedStudents.push(student._id);
        }
      }

      // ✅ تحقق من المهام
      let validatedTasks = project.tasks;
      if (tasks && tasks.length > 0) {
        validatedTasks = [];
        for (const taskId of tasks) {
          let task = await Task.findById(taskId);
          if (!task) {
            task = new Task({ title: "New Task" });
            await task.save();
          }
          validatedTasks.push(task._id);
        }
      }

      // ⬇ تحديث القيم
      project.Title = Title || project.Title;
      project.projectDescription = projectDescription || project.projectDescription;
      project.createdBy = adminId;
      project.studentsWorkingOn = validatedStudents;
      project.startDate = startDate || project.startDate;
      project.endDate = endDate || project.endDate;
      project.status = status || project.status;
      project.progress = progress || project.progress;
      project.tasks = validatedTasks;

      return await project.save();
    } catch (err) {
      throw new Error("Error updating project: " + err.message);
    }
  },

  deleteProject: async ({ id }) => {
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
