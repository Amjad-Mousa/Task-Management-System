import { buildSchema } from 'graphql';

const studentSchema = buildSchema(`
  type Student {
    id: ID!
    user_id: ID!
    universityId: String!
    major: String!
    year: String!
    createdAt: String
    updatedAt: String
  }

  type Query {
    getStudents: [Student]
    getStudent(id: ID!): Student
  }

  type Mutation {
    addStudent(user_id: ID!, universityId: String!): Student
    updateStudent(id: ID!, user_id: ID, universityId: String, major: String, year: String): Student
    deleteStudent(id: ID!): String
  }
`);

export default studentSchema;
