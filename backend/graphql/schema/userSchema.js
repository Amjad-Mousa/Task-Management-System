import { gql } from "graphql-tag";
import { buildSchema } from "graphql";

const typeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
  }

  type Query {
    getUsers: [User!]!
    getUser(id: ID!): User!
  }

  type Mutation {
    createUser(
      name: String!
      email: String!
      password: String!
      role: String!
    ): User!
    updateUser(id: ID!, name: String, email: String, role: String): User!
    deleteUser(id: ID!): User!
  }
`;

const userSchema = buildSchema(typeDefs.loc.source.body);

export default userSchema;
