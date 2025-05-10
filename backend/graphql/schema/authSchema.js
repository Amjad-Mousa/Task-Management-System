import { gql } from "graphql-tag";

const typeDefs = gql`
  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Query {
    getCurrentUser: User!
  }

  extend type Mutation {
    login(username: String!, password: String!): AuthPayload!
    register(
      name: String!
      email: String!
      password: String!
      role: String!
      universityId: String
      major: String
      year: String
    ): AuthPayload!
    logout: Boolean!
  }
`;

export default typeDefs;
