/**
 * Message Model
 *
 * Represents a message in the system for communication between users.
 * Messages can be direct messages between users or related to specific projects.
 *
 * @module models/messageModel
 */
const mongoose = require("mongoose");

/**
 * Message Schema
 *
 * @typedef {Object} MessageSchema
 * @property {mongoose.Schema.Types.ObjectId} [project] - Optional reference to the Project the message is related to
 * @property {Object} sender - Information about the message sender
 * @property {mongoose.Schema.Types.ObjectId} sender.id - ID of the sender (User ID)
 * @property {string} sender.role - Role of the sender (either "Student" or "Admin")
 * @property {Object} receiver - Information about the message receiver
 * @property {mongoose.Schema.Types.ObjectId} receiver.id - ID of the receiver (User ID)
 * @property {string} receiver.role - Role of the receiver (either "Student" or "Admin")
 * @property {string} content - The content of the message
 * @property {Date} timestamp - When the message was sent
 * @property {boolean} read - Whether the message has been read by the receiver
 */
const messageSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: false,
    index: true,
  },
  sender: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    role: {
      type: String,
      enum: ["Student", "Admin"],
      required: true,
    },
  },
  receiver: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    role: {
      type: String,
      enum: ["Student", "Admin"],
      required: true,
    },
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  read: {
    type: Boolean,
    default: false,
  },
});

/**
 * Create indexes for efficient querying
 */
messageSchema.index({ project: 1, timestamp: -1 });
messageSchema.index({ "sender.id": 1, timestamp: -1 });
messageSchema.index({ "receiver.id": 1, timestamp: -1 });
messageSchema.index({ "sender.id": 1, "receiver.id": 1, timestamp: -1 });

/**
 * Message Model
 * @type {mongoose.Model<MessageSchema>}
 */
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
