/**
 * Message Resolver
 *
 * Handles operations related to messages including fetching, creating, and updating message records.
 *
 * @module graphql/resolver/messageResolver
 */
const mongoose = require("mongoose");
const Message = require("../../models/messageModel");
const User = require("../../models/userModel");
const Admin = require("../../models/adminModel");
const Student = require("../../models/studentModel");
const { checkAuth } = require("../../middleware/auth");

/**
 * Get the user details of a message sender
 *
 * @async
 * @param {Object} parent - Parent resolver containing sender data
 * @returns {Promise<Object|null>} User details of the sender or null if not found
 */
const getSenderUser = async (parent) => {
  try {
    if (!parent || !parent.id) return null;
    return await User.findById(parent.id);
  } catch (error) {
    console.error("Error fetching sender user:", error);
    return null;
  }
};

/**
 * Get all messages for the current user
 *
 * @async
 * @param {Object} _ - Parent resolver (not used)
 * @param {Object} _args - Query arguments (not used)
 * @param {Object} context - GraphQL context containing request and response objects
 * @returns {Promise<Array>} List of messages for the current user
 * @throws {Error} If user is not authenticated
 */
const getMessages = async (_, _args, context) => {
  const decodedToken = checkAuth(context);
  const userId = decodedToken.userId;

  try {
    // Find messages where the current user is either the sender or the receiver
    const messages = await Message.find({
      $or: [
        { "sender.id": userId },
        { "receiver.id": userId }
      ]
    }).sort({ timestamp: -1 });

    return messages;
  } catch (error) {
    throw new Error(`Error fetching messages: ${error.message}`);
  }
};

/**
 * Get messages between the current user and another user
 *
 * @async
 * @param {Object} _ - Parent resolver (not used)
 * @param {Object} args - Query arguments
 * @param {string} args.userId - ID of the other user
 * @param {Object} context - GraphQL context containing request and response objects
 * @returns {Promise<Array>} List of messages between the two users
 * @throws {Error} If user is not authenticated or userId is invalid
 */
const getMessagesBetweenUsers = async (_, { userId }, context) => {
  const decodedToken = checkAuth(context);
  const currentUserId = decodedToken.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID");
  }

  try {
    // Find messages where the current user and the specified user are either sender or receiver
    const messages = await Message.find({
      $or: [
        { "sender.id": currentUserId, "receiver.id": userId },
        { "sender.id": userId, "receiver.id": currentUserId }
      ]
    }).sort({ timestamp: 1 });

    return messages;
  } catch (error) {
    throw new Error(`Error fetching messages between users: ${error.message}`);
  }
};

/**
 * Create a new message
 *
 * @async
 * @param {Object} _ - Parent resolver (not used)
 * @param {Object} args - Mutation arguments
 * @param {Object} args.input - Message creation input
 * @param {string} args.input.content - Content of the message
 * @param {string} args.input.receiverId - ID of the message receiver
 * @param {Object} context - GraphQL context containing request and response objects
 * @returns {Promise<Object>} Created message
 * @throws {Error} If user is not authenticated or input is invalid
 */
const createMessage = async (_, { input }, context) => {
  const decodedToken = checkAuth(context);
  const senderId = decodedToken.userId;
  const senderRole = decodedToken.role;

  if (!mongoose.Types.ObjectId.isValid(input.receiverId)) {
    throw new Error("Invalid receiver ID");
  }

  try {
    // Get receiver user to determine their role
    const receiver = await User.findById(input.receiverId);
    if (!receiver) {
      throw new Error("Receiver not found");
    }

    // Create the message
    const message = new Message({
      content: input.content,
      sender: {
        id: senderId,
        role: senderRole.charAt(0).toUpperCase() + senderRole.slice(1) // Capitalize first letter
      },
      receiver: {
        id: input.receiverId,
        role: receiver.role.charAt(0).toUpperCase() + receiver.role.slice(1) // Capitalize first letter
      },
      timestamp: new Date().toISOString(), // Ensure timestamp is in ISO format
      read: false
    });

    return await message.save();
  } catch (error) {
    throw new Error(`Error creating message: ${error.message}`);
  }
};

/**
 * Mark a message as read
 *
 * @async
 * @param {Object} _ - Parent resolver (not used)
 * @param {Object} args - Mutation arguments
 * @param {string} args.id - ID of the message to mark as read
 * @param {Object} context - GraphQL context containing request and response objects
 * @returns {Promise<Object>} Updated message
 * @throws {Error} If user is not authenticated or message not found
 */
const markMessageAsRead = async (_, { id }, context) => {
  const decodedToken = checkAuth(context);
  const userId = decodedToken.userId;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid message ID");
  }

  try {
    // Find the message and ensure the current user is the receiver
    const message = await Message.findOne({
      _id: id,
      "receiver.id": userId
    });

    if (!message) {
      throw new Error("Message not found or you are not authorized to mark it as read");
    }

    // Update the message
    message.read = true;
    return await message.save();
  } catch (error) {
    throw new Error(`Error marking message as read: ${error.message}`);
  }
};

/**
 * Export message resolver functions
 * @type {Object}
 */
module.exports = {
  getSenderUser,
  getMessages,
  getMessagesBetweenUsers,
  createMessage,
  markMessageAsRead
};
