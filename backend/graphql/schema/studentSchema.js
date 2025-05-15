import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull } from 'graphql';
import { UserType } from './userSchema.js';
import Student from '../../models/studentModel.js';
import User from '../../models/userModel.js';

const StudentType = new GraphQLObjectType({
  name: 'Student',
  fields: () => ({
    id: { type: GraphQLID },
    user_id: { type: GraphQLID },
    user: {
      type: UserType,
      resolve: async (parent) => {
        return await User.findById(parent.user_id);
      },
    },
    universityId: { type: GraphQLString },
    major: { type: GraphQLString },
    year: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

const studentQueryFields = {
  getStudents: {
    type: new GraphQLList(StudentType),
    resolve: async () => await Student.find(),
  },
  getStudent: {
    type: StudentType,
    args: { id: { type: GraphQLID } },
    resolve: async (_, { id }) => await Student.findById(id),
  },
};

const studentMutationFields = {
  addStudent: {
    type: StudentType,
    args: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      email: { type: new GraphQLNonNull(GraphQLString) },
      password: { type: new GraphQLNonNull(GraphQLString) },
      universityId: { type: new GraphQLNonNull(GraphQLString) },
      major: { type: new GraphQLNonNull(GraphQLString) },
      year: { type: new GraphQLNonNull(GraphQLString) },
    },
    resolve: async (_, { name, email, password, universityId, major, year }) => {
      const newUser = new User({ name, email, password });
      await newUser.save();

      const newStudent = new Student({
        user_id: newUser._id,
        universityId,
        major,
        year,
      });
      return await newStudent.save();
    },
  },
  updateStudent: {
    type: StudentType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      user_id: { type: GraphQLID },
      universityId: { type: GraphQLString },
      major: { type: GraphQLString },
      year: { type: GraphQLString },
    },
    resolve: async (_, { id, user_id, universityId, major, year }) => {
      return await Student.findByIdAndUpdate(id, { user_id, universityId, major, year }, { new: true });
    },
  },
  deleteStudent: {
    type: GraphQLString,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    resolve: async (_, { id }) => {
      await Student.findByIdAndDelete(id);
      return 'Student deleted successfully';
    },
  },
};

export { StudentType, studentQueryFields, studentMutationFields };
