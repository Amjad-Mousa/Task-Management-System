/**
 * Message Model
 *
 * Represents a message in the system for communication between admins and students.
 * Messages are associated with specific projects.
 *
 * @module models/messageModel
 */
const mongoose = require("mongoose");

/**
 * Message Schema
 *
 * @typedef {Object} MessageSchema
 * @property {mongoose.Schema.Types.ObjectId} project - Reference to the Project the message is related to
 * @property {Object} sender - Information about the message sender
 * @property {mongoose.Schema.Types.ObjectId} sender.id - ID of the sender (either Admin or Student)
 * @property {string} sender.role - Role of the sender (either "Student" or "Admin")
 * @property {string} content - The content of the message
 * @property {Date} timestamp - When the message was sent
 */
const messageSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
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

/**
 * Message Model
 * @type {mongoose.Model<MessageSchema>}
 */
const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
