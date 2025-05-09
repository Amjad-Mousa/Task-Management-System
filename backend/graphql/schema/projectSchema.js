import { gql } from "graphql-tag";
import { buildSchema } from "graphql";

const typeDefs = gql`
  enum ProjectStatus {
    Pending
    In_Progress
    Completed
  }

  type Project {
    id: ID! # This is the _id field created by MongoDB
    projectName: String!
    projectDescription: String!
    createdBy: ID!
    studentsWorkingOn: [ID!]
    startDate: String!
    endDate: String!
    status: ProjectStatus!
    progress: Int!
    tasks: [ID!]
    createdAt: String
    updatedAt: String
  }

  type Query {
    getProjects: [Project!]!
    getProject(id: ID!): Project!
  }

  type Mutation {
    createProject(
      projectName: String!
      projectDescription: String!
      createdBy: ID!
      studentsWorkingOn: [ID!]
      startDate: String!
      endDate: String!
      status: ProjectStatus
      progress: Int
      tasks: [ID!]
    ): Project!

    updateProject(
      id: ID!
      projectName: String
      projectDescription: String
      createdBy: ID
      studentsWorkingOn: [ID!]
      startDate: String
      endDate: String
      status: ProjectStatus
      progress: Int
      tasks: [ID!]
    ): Project!

    deleteProject(id: ID!): Project!
  }
`;

const projectSchema = buildSchema(typeDefs.loc.source.body);

export default projectSchema;
