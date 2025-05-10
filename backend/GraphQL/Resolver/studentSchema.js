import Student from '../../models/studentModel.js';

const studentResolver = {
  getStudents: async () => {
    return await Student.find();
  },
  getStudent: async ({ id }) => {
    return await Student.findById(id);
  },
  addStudent: async ({ user_id, universityId}) => {
    const newStudent = new Student({ user_id, universityId});
    await newStudent.save();
    return newStudent;
  },
  updateStudent: async ({ id, user_id, universityId, major, year }) => {
    return await Student.findByIdAndUpdate(
      id,
      { user_id, universityId, major, year },
      { new: true }
    );
  },
  deleteStudent: async ({ id }) => {
    await Student.findByIdAndDelete(id);
    return "Student deleted successfully";
  }
};

export default studentResolver;
