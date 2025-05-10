import { buildSchema } from 'graphql';

const adminSchema = buildSchema(`
    type Admin {
        id: ID!
        user_id: ID!
        permissions: [String!]!
        createdAt: String
        updatedAt: String
    }

    type Query {
        getAdmins: [Admin]
        getAdmin(id: ID!): Admin
    }

    type Mutation {
        addAdmin(user_id: ID!, permissions: [String!]!): Admin
        updateAdmin(id: ID!, user_id: ID, permissions: [String!]): Admin
        deleteAdmin(id: ID!): String
    }
`);

export default adminSchema;
