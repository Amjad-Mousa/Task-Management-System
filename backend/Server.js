/**
 * Task Management System Server
 *
 * Main server file that sets up Express with GraphQL, MongoDB connection,
 * Socket.IO for real-time chat, and necessary middleware for the Task Management System.
 *
 * @module server
 */

const express = require("express");
const mongoose = require("mongoose");
const { createHandler } = require("graphql-http/lib/use/express");
const { GraphQLSchema, GraphQLObjectType } = require("graphql");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Import query and mutation fields from schema files
const {
  userQueryFields,
  userMutationFields,
} = require("./graphql/schema/userSchema");
const {
  authQueryFields,
  authMutationFields,
} = require("./graphql/schema/authSchema");
const {
  studentQueryFields,
  studentMutationFields,
} = require("./graphql/schema/studentSchema");
const {
  adminQueryFields,
  adminMutationFields,
} = require("./graphql/schema/adminSchema");
const {
  projectQueryFields,
  projectMutationFields,
} = require("./graphql/schema/projectSchema");
const {
  taskQueryFields,
  taskMutationFields,
} = require("./graphql/schema/taskSchema");
const {
  messageQueryFields,
  messageMutationFields,
} = require("./graphql/schema/messageSchema");

/**
 * Express application instance
 * @type {express.Application}
 */
const app = express();

/**
 * Create HTTP server with Express app
 * @type {http.Server}
 */
const server = http.createServer(app);

/**
 * Initialize Socket.IO with the HTTP server
 * @type {SocketIO.Server}
 */
// Socket.IO setup with specific origin
console.log("Setting up Socket.IO server with specific origin");

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow both ports
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true // Enable credentials
  },
  transports: ['polling', 'websocket'], // Try polling first, then websocket
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 30000
});

/**
 * Configure CORS middleware to allow credentials and specify allowed origin
 * This is essential for cross-domain requests with authentication
 */
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"], // Allow both ports
    credentials: true, // Enable credentials
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/**
 * Add cookie-parser middleware to parse cookies in requests
 * Required for session-based authentication
 */
app.use(cookieParser());

/**
 * Connect to MongoDB database using connection string from environment variables
 * @returns {Promise} MongoDB connection promise
 */
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(console.error);

/**
 * Define GraphQL Root Query type
 * Combines all query fields from different schema modules
 * @type {GraphQLObjectType}
 */
const RootQuery = new GraphQLObjectType({
  name: "RootQuery",
  fields: {
    ...userQueryFields,
    ...authQueryFields,
    ...studentQueryFields,
    ...adminQueryFields,
    ...projectQueryFields,
    ...taskQueryFields,
    ...messageQueryFields,
  },
});

/**
 * Define GraphQL Root Mutation type
 * Combines all mutation fields from different schema modules
 * @type {GraphQLObjectType}
 */
const RootMutation = new GraphQLObjectType({
  name: "RootMutation",
  fields: {
    ...userMutationFields,
    ...authMutationFields,
    ...studentMutationFields,
    ...adminMutationFields,
    ...projectMutationFields,
    ...taskMutationFields,
    ...messageMutationFields,
  },
});

/**
 * Create the GraphQL schema with query and mutation types
 * @type {GraphQLSchema}
 */
const schema = new GraphQLSchema({
  query: RootQuery,
  mutation: RootMutation,
});

/**
 * Set up GraphQL HTTP handler at /graphql endpoint
 * Includes context with request and response objects for authentication
 */
app.use("/graphql", (req, res, next) => {
  const handler = createHandler({
    schema,
    context: () => {
      // Include both request and response in context
      return { req: { ...req, res } };
    },
    formatError: (error) => {
      console.error(error);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  });

  handler(req, res, next);
});

/**
 * Serve Ruru GraphQL IDE at the root endpoint
 * Provides a visual interface for exploring and testing the GraphQL API
 */
const { ruruHTML } = require("ruru/server");
app.get("/", (_req, res) => {
  res.type("html");
  res.end(ruruHTML({ endpoint: "/graphql" }));
});

/**
 * Set up Socket.IO event handlers for real-time chat
 */
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Send a welcome message to confirm connection
  socket.emit("welcome", { message: "Connected to chat server successfully!" });

  // Handle errors
  socket.on("error", (error) => {
    console.error(`Socket ${socket.id} error:`, error);
  });

  // Join a chat room (based on conversation between two users)
  socket.on("join_chat", (data) => {
    try {
      const { chatId } = data;
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat: ${chatId}`);

      // Confirm to the client that they joined the chat
      socket.emit("chat_joined", { chatId, success: true });
    } catch (error) {
      console.error(`Error joining chat:`, error);
      socket.emit("chat_joined", { success: false, error: error.message });
    }
  });

  // Handle sending messages
  socket.on("send_message", (data) => {
    try {
      const { chatId, message } = data;
      console.log(`Received message for chat ${chatId}:`, message);

      // Broadcast the message to all users in the chat room
      io.to(chatId).emit("receive_message", message);
      console.log(`Message broadcast to chat ${chatId}`);
    } catch (error) {
      console.error(`Error sending message:`, error);
      socket.emit("message_error", { error: error.message });
    }
  });

  // Handle marking messages as read
  socket.on("mark_read", (data) => {
    try {
      const { senderId, receiverId } = data;
      console.log(`Marking messages as read from ${senderId} to ${receiverId}`);

      // Notify the sender that their messages have been read
      io.emit("messages_marked_read", { senderId, receiverId });
    } catch (error) {
      console.error(`Error marking messages as read:`, error);
    }
  });

  // Handle user typing status
  socket.on("typing", (data) => {
    try {
      const { chatId, userId, isTyping } = data;
      // Broadcast typing status to other users in the chat
      socket.to(chatId).emit("user_typing", { userId, isTyping });
    } catch (error) {
      console.error(`Error with typing status:`, error);
    }
  });

  // Handle ping (for testing connection)
  socket.on("ping", (callback) => {
    console.log(`Received ping from ${socket.id}`);
    if (typeof callback === 'function') {
      callback({ status: "ok", time: new Date().toISOString() });
    } else {
      socket.emit("pong", { status: "ok", time: new Date().toISOString() });
    }
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`);
  });
});

/**
 * Start the HTTP server on the specified port
 * @listens {number} process.env.PORT - Port number from environment variables
 */
server.listen(process.env.PORT, () => {
  console.log(`Server running at http://localhost:${process.env.PORT}`);
  console.log(`GraphQL endpoint: http://localhost:${process.env.PORT}/graphql`);
  console.log(`Socket.IO enabled for real-time chat`);
});
