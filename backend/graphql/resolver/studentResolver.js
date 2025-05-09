import Student from "../../models/studentModel.js";

const getStudents = async () => {
  try {
    const students = await Student.find();
    return students;
  } catch (err) {
    throw new Error(err);
  }
};

const getStudent = async ({ id }) => {
  try {
    const student = await Student.findById(id);
    return student;
  } catch (err) {
    throw new Error(err);
  }
};

const getStudentByUserId = async ({ userId }) => {
  try {
    const student = await Student.findOne({ user_id: userId });
    return student;
  } catch (err) {
    throw new Error(err);
  }
};

const createStudent = async ({ user_id, universityId, major, year }) => {
  try {
    const student = await Student.create({
      user_id,
      universityId,
      major,
      year,
    });
    return student;
  } catch (err) {
    throw new Error(err);
  }
};

const updateStudent = async ({ id, universityId, major, year }) => {
  try {
    const updateData = {};
    if (universityId) updateData.universityId = universityId;
    if (major) updateData.major = major;
    if (year) updateData.year = year;

    const student = await Student.findByIdAndUpdate(id, updateData, { new: true });
    return student;
  } catch (err) {
    throw new Error(err);
  }
};

const deleteStudent = async ({ id }) => {
  try {
    const student = await Student.findByIdAndDelete(id);
    return student;
  } catch (err) {
    throw new Error(err);
  }
};

const resolvers = {
  getStudents,
  getStudent,
  getStudentByUserId,
  createStudent,
  updateStudent,
  deleteStudent,
};

export default resolvers;