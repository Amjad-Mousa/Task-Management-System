/**
 * Message Schema
 *
 * Defines GraphQL types, queries, and mutations for message operations.
 *
 * @module graphql/schema/messageSchema
 */
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLList,
  GraphQLInputObjectType,
} = require("graphql");
const { UserType } = require("./userSchema");
const messageResolvers = require("../resolver/messageResolver");

/**
 * GraphQL Message Sender Type
 * Represents a message sender in the system
 * @type {GraphQLObjectType}
 */
const MessageSenderType = new GraphQLObjectType({
  name: "MessageSender",
  fields: () => ({
    id: {
      type: GraphQLID,
      description: "ID of the sender",
    },
    role: {
      type: GraphQLString,
      description: "Role of the sender (Student or Admin)",
    },
    user: {
      type: UserType,
      description: "User details of the sender",
      resolve: messageResolvers.getSenderUser,
    },
  }),
});

/**
 * GraphQL Message Type
 * Represents a message in the system
 * @type {GraphQLObjectType}
 */
const MessageType = new GraphQLObjectType({
  name: "Message",
  fields: () => ({
    id: {
      type: GraphQLID,
      description: "Unique identifier for the message",
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Content of the message",
    },
    sender: {
      type: MessageSenderType,
      description: "Sender of the message",
    },
    timestamp: {
      type: GraphQLString,
      description: "Timestamp when the message was sent",
    },
    read: {
      type: GraphQLBoolean,
      description: "Whether the message has been read",
    },
  }),
});

/**
 * GraphQL Input Type for creating a new message
 * @type {GraphQLInputObjectType}
 */
const CreateMessageInput = new GraphQLInputObjectType({
  name: "CreateMessageInput",
  fields: () => ({
    content: {
      type: new GraphQLNonNull(GraphQLString),
      description: "Content of the message",
    },
    receiverId: {
      type: new GraphQLNonNull(GraphQLID),
      description: "ID of the message receiver",
    },
  }),
});

/**
 * GraphQL Query Fields for message operations
 * @type {Object}
 */
const messageQueryFields = {
  messages: {
    type: new GraphQLList(MessageType),
    description: "Get all messages for the current user",
    resolve: messageResolvers.getMessages,
  },
  messagesBetweenUsers: {
    type: new GraphQLList(MessageType),
    description: "Get messages between the current user and another user",
    args: {
      userId: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the other user",
      },
    },
    resolve: messageResolvers.getMessagesBetweenUsers,
  },
};

/**
 * GraphQL Response Type for operations that return success/message
 * @type {GraphQLObjectType}
 */
const OperationResponseType = new GraphQLObjectType({
  name: "OperationResponse",
  fields: () => ({
    success: {
      type: GraphQLBoolean,
      description: "Whether the operation was successful",
    },
    message: {
      type: GraphQLString,
      description: "Message describing the result of the operation",
    },
  }),
});

/**
 * GraphQL Mutation Fields for message operations
 * @type {Object}
 */
const messageMutationFields = {
  createMessage: {
    type: MessageType,
    description: "Create a new message",
    args: {
      input: {
        type: new GraphQLNonNull(CreateMessageInput),
        description: "Message data for creation",
      },
    },
    resolve: messageResolvers.createMessage,
  },
  markMessageAsRead: {
    type: MessageType,
    description: "Mark a message as read",
    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the message to mark as read",
      },
    },
    resolve: messageResolvers.markMessageAsRead,
  },
  markAllMessagesAsRead: {
    type: OperationResponseType,
    description: "Mark all messages from a sender as read",
    args: {
      senderId: {
        type: new GraphQLNonNull(GraphQLID),
        description: "ID of the sender whose messages to mark as read",
      },
    },
    resolve: messageResolvers.markAllMessagesAsRead,
  },
};

/**
 * Export message schema components
 * @type {Object}
 */
module.exports = {
  MessageType,
  messageQueryFields,
  messageMutationFields,
  CreateMessageInput,
  OperationResponseType,
};
