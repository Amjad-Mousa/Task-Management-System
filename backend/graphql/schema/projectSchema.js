const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLInt,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInputObjectType,
} = require("graphql");
const { AdminType } = require("./adminSchema");
const { StudentType } = require("./studentSchema");
const { TaskType } = require("./taskSchema");
const projectResolvers = require("../resolver/projectResolver");

// Project Type
const ProjectType = new GraphQLObjectType({
  name: "Project",
  fields: () => ({
    id: { type: GraphQLID },
    projectName: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Name of the project",
    },
    projectCategory: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Category of the project",
    },
    projectDescription: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Description of the project",
    },
    createdBy: {
      type: AdminType,
      description: "Admin who created the project",
      resolve: projectResolvers.getProjectCreatedBy,
    },
    studentsWorkingOn: {
      type: new GraphQLList(StudentType),
      description: "Students working on the project",
      resolve: projectResolvers.getProjectStudentsWorkingOn,
    },
    startDate: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Start date of the project",
    },
    endDate: {
      type: new GraphQLNonNull(GraphQLString),
      description: "End date of the project",
    },
    status: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Status of the project",
    },
    progress: {
      type: new GraphQLNonNull(GraphQLInt),
      description: "Progress of the project",
    },
    tasks: {
      type: new GraphQLList(TaskType),
      description: "Tasks related to the project",
      resolve: projectResolvers.getProjectTasks,
    },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

// Project Query Fields
const projectQueryFields = {
  project: {
    type: ProjectType,
    description: "Get a project by ID",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the project",
      },
    },
    resolve: projectResolvers.getProjectById,
  },
  projects: {
    type: new GraphQLList(ProjectType),
    description: "Get all projects",
    resolve: projectResolvers.getAllProjects,
  },
  projectsByAdmin: {
    type: new GraphQLList(ProjectType),
    description: "Get projects by admin ID",
    args: {
      adminId: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the admin",
      },
    },
    resolve: projectResolvers.getProjectsByAdmin,
  },
  projectsByStudent: {
    type: new GraphQLList(ProjectType),
    description: "Get projects by student ID",
    args: {
      studentId: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the student",
      },
    },
    resolve: projectResolvers.getProjectsByStudent,
  },
};

// Project Mutation Fields
const projectMutationFields = {
  createProject: {
    type: ProjectType,
    description: "Create a new project",
    args: {
      input: {
        type: new GraphQLNonNull(CreateProjectInput),
        description: "Project data for creation",
      },
    },
    resolve: projectResolvers.createProject,
  },
  updateProject: {
    type: ProjectType,
    description: "Update an existing project",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the project to update",
      },
      input: {
        type: new GraphQLNonNull(UpdateProjectInput),
        description: "Project data to update",
      },
    },
    resolve: projectResolvers.updateProject,
  },
  deleteProject: {
    type: ProjectType,
    description: "Delete a project",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the project to delete",
      },
    },
    resolve: projectResolvers.deleteProject,
  },
};

// Input type for creating a project
const CreateProjectInput = new GraphQLInputObjectType({
  name: "CreateProjectInput",
  fields: () => ({
    projectName: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Name of the project",
    },
    projectCategory: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Category of the project",
    },
    projectDescription: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Description of the project",
    },
    createdBy: {
      type: new GraphQLNonNull(GraphQLID),
      description: "ID of the admin who created the project",
    },
    studentsWorkingOn: {
      type: new GraphQLList(GraphQLID),
      description: "IDs of students working on the project",
    },
    startDate: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Start date of the project",
    },
    endDate: {
      type: new GraphQLNonNull(GraphQLString),
      description: "End date of the project",
    },
    status: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Status of the project",
    },
    progress: {
      type: new GraphQLNonNull(GraphQLInt),
      description: "Progress of the project",
    },
  }),
});

// Input type for updating a project
const UpdateProjectInput = new GraphQLInputObjectType({
  name: "UpdateProjectInput",
  fields: () => ({
    projectName: {
      type: GraphQLString,
      description: "Name of the project",
    },
    projectCategory: {
      type: GraphQLString,
      description: "Category of the project",
    },
    projectDescription: {
      type: GraphQLString,
      description: "Description of the project",
    },
    studentsWorkingOn: {
      type: new GraphQLList(GraphQLID),
      description: "IDs of students working on the project",
    },
    startDate: {
      type: GraphQLString,
      description: "Start date of the project",
    },
    endDate: {
      type: GraphQLString,
      description: "End date of the project",
    },
    status: {
      type: GraphQLString,
      description: "Status of the project",
    },
    progress: {
      type: GraphQLInt,
      description: "Progress of the project",
    },
  }),
});

module.exports = {
  ProjectType,
  projectQueryFields,
  projectMutationFields,
  CreateProjectInput,
  UpdateProjectInput,
};
