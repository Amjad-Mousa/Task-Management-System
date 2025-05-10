import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull } from 'graphql';

const AdminType = new GraphQLObjectType({
  name: 'Admin',
  fields: () => ({
    id: { type: GraphQLID },
    user_id: { type: GraphQLID },
    permissions: { type: new GraphQLList(GraphQLString) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

const adminQueryFields = {
  getAdmins: {
    type: new GraphQLList(AdminType),
    args: {},
  },
  getAdmin: {
    type: AdminType,
    args: { id: { type: GraphQLID } },
  },
};

const adminMutationFields = {
  addAdmin: {
    type: AdminType,
    args: {
   name: { type: new GraphQLNonNull(GraphQLString) },
    email: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    permissions: { type: new GraphQLList(GraphQLString) }
    },
  },
  updateAdmin: {
    type: AdminType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      user_id: { type: GraphQLID },
      permissions: { type: new GraphQLList(GraphQLString) },
    },
  },
  deleteAdmin: {
    type: GraphQLString,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
  },
};

export { AdminType, adminQueryFields, adminMutationFields };
