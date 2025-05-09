import { gql } from "graphql-tag";
import { buildSchema } from "graphql";

const typeDefs = gql`
  type Admin {
    id: ID! # This is the _id field created by MongoDB
    user_id: ID! # This is a reference to the User model
    permissions: [String!]!
  }

  type Query {
    getAdmins: [Admin!]!
    getAdmin(id: ID!): Admin!
  }

  type Mutation {
    createAdmin(user_id: ID!, permissions: [String!]!): Admin!
    updateAdmin(id: ID!, permissions: [String!]!): Admin!
    deleteAdmin(id: ID!): Admin!
  }
`;

const adminSchema = buildSchema(typeDefs.loc.source.body);

export default adminSchema;
