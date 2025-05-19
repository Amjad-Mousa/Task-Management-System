import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLNonNull, GraphQLList } from 'graphql';

const TaskType = new GraphQLObjectType({
  name: 'Task',
  fields: () => ({
    id: { type: GraphQLID },
    title: { type: GraphQLNonNull(GraphQLString) },
    description: { type: GraphQLNonNull(GraphQLString) },
    dueDate: { type: GraphQLNonNull(GraphQLString) },
    status: { type: GraphQLString },
    projectName: { type: GraphQLID },
    createdBy: { type: GraphQLID },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

const taskQueryFields = {
  getTasks: {
    type: new GraphQLList(TaskType),
    args: {},
  },
  getTask: {
    type: TaskType,
    args: { id: { type: GraphQLNonNull(GraphQLID) } },
  },
};

const taskMutationFields = {
  addTask: {
    type: TaskType,
    args: {
      title: { type: GraphQLNonNull(GraphQLString) },
      description: { type: GraphQLNonNull(GraphQLString) },
      dueDate: { type: GraphQLNonNull(GraphQLString) },
      status: { type: GraphQLString },
      projectName: { type: GraphQLNonNull(GraphQLID) },
      createdBy: { type: GraphQLNonNull(GraphQLID) },
    },
  },
  updateTask: {
    type: TaskType,
    args: {
      id: { type: GraphQLNonNull(GraphQLID) },
      title: { type: GraphQLString },
      description: { type: GraphQLString },
      dueDate: { type: GraphQLString },
      status: { type: GraphQLString },
      projectName: { type: GraphQLID },
      createdBy: { type: GraphQLID },
    },
  },
  deleteTask: {
    type: GraphQLString,
    args: {
      id: { type: GraphQLNonNull(GraphQLID) },
    },
  },
};

export { TaskType, taskQueryFields, taskMutationFields };
