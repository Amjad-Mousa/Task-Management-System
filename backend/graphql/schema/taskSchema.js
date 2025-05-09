import { gql } from "graphql-tag";
import { buildSchema } from "graphql";

const typeDefs = gql`
  enum TaskStatus {
    Pending
    In_Progress
    Completed
  }

  type Task {
    id: ID!
    title: String!
    description: String!
    dueDate: String!
    status: TaskStatus!
    assignedUser: ID!
    studentsWorkingOn: [ID!]
    projectName: ID!
    createdBy: ID!
    createdAt: String
    updatedAt: String
  }

  type Query {
    getTasks: [Task!]!
    getTask(id: ID!): Task!
    getTasksByProject(projectId: ID!): [Task!]!
    getTasksByStudent(studentId: ID!): [Task!]!
  }

  type Mutation {
    createTask(
      title: String!
      description: String!
      dueDate: String!
      status: TaskStatus
      assignedUser: ID!
      studentsWorkingOn: [ID!]
      projectName: ID!
      createdBy: ID!
    ): Task!

    updateTask(
      id: ID!
      title: String
      description: String
      dueDate: String
      status: TaskStatus
      assignedUser: ID
      studentsWorkingOn: [ID!]
      projectName: ID
    ): Task!

    deleteTask(id: ID!): Task!
  }
`;

const taskSchema = buildSchema(typeDefs.loc.source.body);

export default taskSchema;
