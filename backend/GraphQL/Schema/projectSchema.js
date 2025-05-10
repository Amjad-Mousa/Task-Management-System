import { GraphQLObjectType, GraphQLString, GraphQLID, GraphQLList, GraphQLNonNull, GraphQLInt } from 'graphql';
import { AdminType } from './adminSchema.js';
import { StudentType } from './studentSchema.js';
import { TaskType } from './taskSchema.js';
import projectResolvers from '../Resolver/projectResolver.js';

const ProjectType = new GraphQLObjectType({
  name: 'Project',
  fields: () => ({
    id: { type: GraphQLID },
    Title: { type: GraphQLString },
    projectDescription: { type: GraphQLString },
    createdBy: { type: AdminType },
    studentsWorkingOn: { type: new GraphQLList(StudentType) },
    startDate: { type: GraphQLString },
    endDate: { type: GraphQLString },
    status: { type: GraphQLString },
    progress: { type: GraphQLInt },
    tasks: { type: new GraphQLList(TaskType) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

const projectQueryFields = {
  getProjects: {
    type: new GraphQLList(ProjectType),
    args: {},
    resolve: projectResolvers.getProjects
  },
  getProject: {
    type: ProjectType,
    args: { id: { type: GraphQLID } },
    resolve: projectResolvers.getProject
  },
};

const projectMutationFields = {
  addProject: {
    type: ProjectType,
    args: {
      Title: { type: new GraphQLNonNull(GraphQLString) },
      projectDescription: { type: new GraphQLNonNull(GraphQLString) },
      createdBy: { type: new GraphQLNonNull(GraphQLID) },
      studentsWorkingOn: { type: new GraphQLList(GraphQLID) },
      startDate: { type: new GraphQLNonNull(GraphQLString) },
      endDate: { type: new GraphQLNonNull(GraphQLString) },
      status: { type: new GraphQLNonNull(GraphQLString) },
      progress: { type: new GraphQLNonNull(GraphQLInt) },
      tasks: { type: new GraphQLList(GraphQLID) },
    },
    resolve: projectResolvers.addProject
  },
  updateProject: {
    type: ProjectType,
    args: {
      id: { type: new GraphQLNonNull(GraphQLID) },
      Title: { type: GraphQLString },
      projectDescription: { type: GraphQLString },
      createdBy: { type: GraphQLID },
      studentsWorkingOn: { type: new GraphQLList(GraphQLID) },
      startDate: { type: GraphQLString },
      endDate: { type: GraphQLString },
      status: { type: GraphQLString },
      progress: { type: GraphQLInt },
      tasks: { type: new GraphQLList(GraphQLID) },
    },
    resolve: projectResolvers.updateProject
  },
  deleteProject: {
    type: GraphQLString,
    args: { id: { type: new GraphQLNonNull(GraphQLID) } },
    resolve: projectResolvers.deleteProject
  },
};

export { ProjectType, projectQueryFields, projectMutationFields };
