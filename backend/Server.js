import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

import { GraphQLSchema, GraphQLObjectType } from 'graphql';

import { userQueryFields, userMutationFields } from './GraphQL/Schema/userSchema.js';
import { adminQueryFields, adminMutationFields } from './GraphQL/Schema/adminSchema.js';
import { studentQueryFields, studentMutationFields } from './GraphQL/Schema/studentSchema.js';
import { projectQueryFields, projectMutationFields } from './GraphQL/Schema/projectSchema.js';

import userResolver from './GraphQL/Resolver/userResolver.js';
import adminResolver from './GraphQL/Resolver/adminResolver.js';
import studentResolver from './GraphQL/Resolver/studentResolver.js';
import projectResolver from './GraphQL/Resolver/projectResolver.js';

dotenv.config();

const app = express();
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("✅ Connected to MongoDB");
}).catch((err) => {
  console.error("❌ MongoDB connection error:", err.message);
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQuery',
  fields: {
    ...userQueryFields,
    ...adminQueryFields,
    ...studentQueryFields,
    ...projectQueryFields,
  },
});

const RootMutation = new GraphQLObjectType({
  name: 'RootMutation',
  fields: {
    ...userMutationFields,
    ...adminMutationFields,
    ...studentMutationFields,
    ...projectMutationFields,
  },
});

const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

const rootResolvers = {
  ...userResolver,
  ...adminResolver,
  ...studentResolver,
  ...projectResolver,
};

app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: rootResolvers,
  graphiql: true,
}));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}/graphql`);
});
