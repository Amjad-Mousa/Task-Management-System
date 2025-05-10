import Project from '../../models/projectModel.js';
import Student from '../../models/studentModel.js';
import Task from '../../models/taskModel.js';
import Admin from '../../models/adminModel.js';

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
    // التحقق من وجود مشروع بنفس العنوان
    const existingProject = await Project.findOne({ Title });
    if (existingProject) {
      throw new Error("Project with this title already exists");
    }

    // البحث عن الـ Admin باستخدام الـ user_id بشكل دقيق
    const admin = await Admin.findOne({ user_id: createdBy });
    if (!admin) {
      throw new Error("Admin not found");
    }

    // تحقق من الطلاب
    const validatedStudents = [];
    for (const studentId of studentsWorkingOn || []) {
      const student = await Student.findById(studentId);
      if (!student) {
        throw new Error(`Student with ID ${studentId} not found`);
      }
      validatedStudents.push(student._id);
    }

    // تحقق من المهام
    const validatedTasks = [];
    for (const taskId of tasks || []) {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error(`Task with ID ${taskId} not found`);
      }
      validatedTasks.push(task._id);
    }

    // إنشاء المشروع الجديد
    const newProject = new Project({
      Title,
      projectDescription,
      createdBy: admin._id,  // الـ admin هنا
      studentsWorkingOn: validatedStudents,
      startDate,
      endDate,
      status,
      progress,
      tasks: validatedTasks,
    });

    // حفظ المشروع الجديد
    return await newProject.save();
  } catch (err) {
    throw new Error("Error adding project: " + err.message);
  }
}

,

  updateProject: async ({ id, Title, projectDescription, createdBy, studentsWorkingOn, startDate, endDate, status, progress, tasks }) => {
    try {
      const project = await Project.findById(id);
      if (!project) {
        throw new Error("Project not found");
      }

      // تحقق من الأدمن
      let adminId = project.createdBy;
      if (createdBy) {
        const admin = await Admin.findById(createdBy);
        if (!admin) {
          throw new Error("Admin not found");
        }
        adminId = admin._id;
      }

      // تحقق من الطلاب
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

      // تحقق من المهام
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

      // تحديث البيانات
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
