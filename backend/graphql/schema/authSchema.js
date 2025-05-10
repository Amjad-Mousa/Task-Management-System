const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLNonNull,
  GraphQLBoolean,
  GraphQLInputObjectType
} = require('graphql');
const { UserType } = require('./userSchema');
const authResolvers = require('../resolver/authResolver');

// Auth Response Type
const AuthResponseType = new GraphQLObjectType({
  name: 'AuthResponse',
  fields: () => ({
    user: { type: UserType },
    success: { type: GraphQLBoolean },
    message: { type: GraphQLString }
  })
});

// Login Input Type
const LoginInput = new GraphQLInputObjectType({
  name: 'LoginInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(GraphQLString) },
    password: { type: new GraphQLNonNull(GraphQLString) },
    rememberMe: { type: GraphQLBoolean }
  })
});

// Auth Query Fields
const authQueryFields = {
  me: {
    type: UserType,
    resolve: authResolvers.me
  }
};

// Auth Mutation Fields
const authMutationFields = {
  login: {
    type: AuthResponseType,
    args: {
      input: { type: new GraphQLNonNull(LoginInput) }
    },
    resolve: authResolvers.login
  },
  logout: {
    type: AuthResponseType,
    resolve: authResolvers.logout
  }
};

module.exports = {
  AuthResponseType,
  LoginInput,
  authQueryFields,
  authMutationFields
};
