const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
} = require("graphql");
const { UserType } = require("./userSchema");
const studentResolvers = require("../resolver/studentResolver");

// Student Type
const StudentType = new GraphQLObjectType({
  name: "Student",
  fields: () => ({
    id: { type: GraphQLID },
    user_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "Reference to the User model",
    },
    user: {
      type: UserType,
      description: "User details for this student",
      resolve: studentResolvers.getStudentUser,
    },
    universityId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "University ID of the student",
    },
    major: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Major/field of study",
    },
    year: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Year of study",
    },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});

// Input type for creating a new student
const CreateStudentInput = new GraphQLInputObjectType({
  name: "CreateStudentInput",
  fields: () => ({
    user_id: {
      type: new GraphQLNonNull(GraphQLID),
      description: "User ID to associate with this student",
    },
    universityId: {
      type: new GraphQLNonNull(GraphQLString),
      description: "University ID of the student",
    },
    major: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Major/field of study",
    },
    year: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Year of study",
    },
  }),
});

// Input type for updating a student
const UpdateStudentInput = new GraphQLInputObjectType({
  name: "UpdateStudentInput",
  fields: () => ({
    universityId: {
      type: GraphQLString,
      description: "University ID of the student",
    },
    major: {
      type: GraphQLString,
      description: "Major/field of study",
    },
    year: {
      type: GraphQLString,
      description: "Year of study",
    },
  }),
});

// Student Query Fields
const studentQueryFields = {
  students: {
    type: new GraphQLList(StudentType),
    description: "Get all students",
    resolve: studentResolvers.students,
  },
  // Add getAllStudents alias for frontend compatibility
  getAllStudents: {
    type: new GraphQLList(StudentType),
    description: "Get all students (alias for students query)",
    resolve: studentResolvers.students,
  },
  student: {
    type: StudentType,
    description: "Get a student by ID",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the student to retrieve",
      },
    },
    resolve: studentResolvers.student,
  },
  studentByUserId: {
    type: StudentType,
    description: "Get a student by user ID",
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: "User ID of the student to retrieve",
      },
    },
    resolve: studentResolvers.studentByUserId,
  },
};

// Student Mutation Fields
const studentMutationFields = {
  createStudent: {
    type: StudentType,
    description: "Create a new student",
    args: {
      input: {
        type: new GraphQLNonNull(CreateStudentInput),
        description: "Student data for creation",
      },
    },
    resolve: studentResolvers.createStudent,
  },
  updateStudent: {
    type: StudentType,
    description: "Update an existing student",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the student to update",
      },
      input: {
        type: new GraphQLNonNull(UpdateStudentInput),
        description: "Student data to update",
      },
    },
    resolve: studentResolvers.updateStudent,
  },
  deleteStudent: {
    type: StudentType,
    description: "Delete a student",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the student to delete",
      },
    },
    resolve: studentResolvers.deleteStudent,
  },
};

// Export types and schema components
module.exports = {
  StudentType,
  studentQueryFields,
  studentMutationFields,
  CreateStudentInput,
  UpdateStudentInput,
};
