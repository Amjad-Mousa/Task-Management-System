/**
 * Message Repository
 *
 * Handles data access operations for messages.
 * Provides an abstraction layer between the GraphQL resolvers and the database.
 *
 * @module repositories/messageRepository
 */
const mongoose = require("mongoose");
const Message = require("../models/messageModel");
const User = require("../models/userModel");

/**
 * Message Repository
 */
class MessageRepository {
  /**
   * Get all messages for a user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} - Array of messages
   */
  async getMessagesForUser(userId) {
    try {
      return await Message.find({
        $or: [
          { "sender.id": userId },
          { "receiver.id": userId }
        ]
      }).sort({ timestamp: -1 });
    } catch (error) {
      console.error("Error fetching messages for user:", error);
      throw new Error(`Error fetching messages: ${error.message}`);
    }
  }

  /**
   * Get messages between two users
   * @param {string} user1Id - First user ID
   * @param {string} user2Id - Second user ID
   * @returns {Promise<Array>} - Array of messages
   */
  async getMessagesBetweenUsers(user1Id, user2Id) {
    try {
      if (!mongoose.Types.ObjectId.isValid(user1Id) || !mongoose.Types.ObjectId.isValid(user2Id)) {
        throw new Error("Invalid user ID");
      }

      return await Message.findBetweenUsers(user1Id, user2Id);
    } catch (error) {
      console.error("Error fetching messages between users:", error);
      throw new Error(`Error fetching messages between users: ${error.message}`);
    }
  }

  /**
   * Create a new message
   * @param {Object} messageData - Message data
   * @param {string} messageData.content - Message content
   * @param {string} messageData.senderId - Sender ID
   * @param {string} messageData.receiverId - Receiver ID
   * @returns {Promise<Object>} - Created message
   */
  async createMessage(messageData) {
    try {
      if (!mongoose.Types.ObjectId.isValid(messageData.senderId) || 
          !mongoose.Types.ObjectId.isValid(messageData.receiverId)) {
        throw new Error("Invalid user ID");
      }

      // Get sender and receiver to determine their roles
      const [sender, receiver] = await Promise.all([
        User.findById(messageData.senderId),
        User.findById(messageData.receiverId)
      ]);

      if (!sender || !receiver) {
        throw new Error("Sender or receiver not found");
      }

      // Capitalize first letter of role
      const senderRole = sender.role.charAt(0).toUpperCase() + sender.role.slice(1);
      const receiverRole = receiver.role.charAt(0).toUpperCase() + receiver.role.slice(1);

      // Create message
      const message = await Message.createMessage({
        content: messageData.content,
        senderId: messageData.senderId,
        senderRole,
        receiverId: messageData.receiverId,
        receiverRole
      });

      console.log("Message created successfully:", message);
      return message;
    } catch (error) {
      console.error("Error creating message:", error);
      throw new Error(`Error creating message: ${error.message}`);
    }
  }

  /**
   * Mark a message as read
   * @param {string} messageId - Message ID
   * @param {string} userId - User ID (must be the receiver)
   * @returns {Promise<Object>} - Updated message
   */
  async markMessageAsRead(messageId, userId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(messageId) || !mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error("Invalid ID");
      }

      const message = await Message.findOne({
        _id: messageId,
        "receiver.id": userId
      });

      if (!message) {
        throw new Error("Message not found or you are not authorized to mark it as read");
      }

      message.read = true;
      return await message.save();
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw new Error(`Error marking message as read: ${error.message}`);
    }
  }

  /**
   * Mark all messages from a sender to a receiver as read
   * @param {string} senderId - Sender ID
   * @param {string} receiverId - Receiver ID
   * @returns {Promise<Object>} - Update result
   */
  async markAllAsRead(senderId, receiverId) {
    try {
      if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
        throw new Error("Invalid user ID");
      }

      const result = await Message.markAsRead(senderId, receiverId);
      console.log("Messages marked as read:", result);
      return result;
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw new Error(`Error marking messages as read: ${error.message}`);
    }
  }
}

module.exports = new MessageRepository();
