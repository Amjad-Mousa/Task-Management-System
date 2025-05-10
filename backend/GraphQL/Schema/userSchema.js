import {buildSchema} from 'graphql';

const userSchema = buildSchema(`
    type User{
    id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: String
    updatedAt: String
    }

    type Query{
        getUsers: [User]
        getUser(id: ID!): User
    }
        
    type Mutation{
    addUser(name: String!, email: String!, password: String!, role: String!): User
    updateUser(id: ID!, name: String, email: String, password: String, role: String): User
    deleteUser(id: ID!): String
    }
    `);
    export default userSchema;

