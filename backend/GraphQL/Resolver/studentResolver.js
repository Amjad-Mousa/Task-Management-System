import Student from '../../models/studentModel.js';
import User from '../../models/userModel.js';

const studentResolvers = {
  getStudents: async () => {
    return await Student.find();
  },
  getStudent: async ({ id }) => {
    const student = await Student.findById(id);
    if (!student) throw new Error("Student not found");
    return student;
  },
  addStudent: async ({ name, email, password, universityId, major, year }) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new Error("User with this email already exists");

    const newUser = new User({
      name,
      email,
      password,
      role: 'student',
    });
    await newUser.save();

    const newStudent = new Student({
      user_id: newUser._id,
      universityId,
      major,
      year,
    });
    await newStudent.save();

    return newStudent;
  },
  updateStudent: async ({ id, user_id, universityId, major, year }) => {
    const student = await Student.findById(id);
    if (!student) throw new Error("Student not found");

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { user_id, universityId, major, year },
      { new: true }
    );
    return updatedStudent;
  },
  deleteStudent: async ({ id }) => {
    const student = await Student.findById(id);
    if (!student) throw new Error("Student not found");

    await Student.findByIdAndDelete(id);
    return "Student deleted successfully";
  },
};

export default studentResolvers;
