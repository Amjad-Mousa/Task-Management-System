import { gql } from "graphql-tag";
import { buildSchema } from "graphql";

const typeDefs = gql`
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
    getStudents: [Student!]!
    getStudent(id: ID!): Student!
    getStudentByUserId(userId: ID!): Student
  }

  type Mutation {
    createStudent(
      user_id: ID!
      universityId: String!
      major: String!
      year: String!
    ): Student!
    
    updateStudent(
      id: ID!
      universityId: String
      major: String
      year: String
    ): Student!
    
    deleteStudent(id: ID!): Student!
  }
`;

const studentSchema = buildSchema(typeDefs.loc.source.body);

export default studentSchema;