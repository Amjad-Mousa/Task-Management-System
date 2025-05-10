import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull } from 'graphql';

const StudentType = new GraphQLObjectType({
  name: 'Student',
  fields: () => ({
    id: { type: GraphQLID },
    user_id: { type: GraphQLID },
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
    args: {},
  },
  getStudent: {
    type: StudentType,
    args: { id: { type: GraphQLID } },
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
  },
  deleteStudent: {
    type: GraphQLString,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
    },
  },
};

export { StudentType, studentQueryFields, studentMutationFields };
