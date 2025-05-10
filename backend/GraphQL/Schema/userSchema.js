import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList } from 'graphql';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    email: { type: GraphQLString },
    role: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

const userQueryFields = {
  getUsers: {
    type: new GraphQLList(UserType),
    args: {},
  },
  getUser: {
    type: UserType,
    args: { id: { type: GraphQLID } },
  },
};

const userMutationFields = {
  addUser: {
    type: UserType,
    args: {
      name: { type: GraphQLString },
      email: { type: GraphQLString },
      password: { type: GraphQLString },
      role: { type: GraphQLString },
    },
  },
  updateUser: {
    type: UserType,
    args: {
      id: { type: GraphQLID },
      name: { type: GraphQLString },
      email: { type: GraphQLString },
      password: { type: GraphQLString },
      role: { type: GraphQLString },
    },
  },
  deleteUser: {
    type: GraphQLString,
    args: { id: { type: GraphQLID } },
  },
};

export { UserType, userQueryFields, userMutationFields };

