/**
 * @file SocketContext.jsx - Context provider for Socket.IO connections
 * @module src/Context/SocketContext
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { io } from "socket.io-client";

/**
 * Socket.IO context for managing real-time connections
 * @type {React.Context}
 */
const SocketContext = createContext();

/**
 * Custom hook to use the Socket.IO context
 * @returns {Object} Socket.IO context value
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

/**
 * Custom hook to access the Socket.IO context internals
 * @returns {Object} Socket.IO context internal state and setters
 */
export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }

  // Get the internal state and setters from the SocketProvider component
  return {
    ...context,
    setSocket: context._setSocket,
    setConnected: context._setConnected
  };
};

/**
 * Get current user from storage
 * @returns {Object|null} Current user or null if not logged in
 */
const getCurrentUser = () => {
  try {
    const sessionUser = sessionStorage.getItem("user")
      ? JSON.parse(sessionStorage.getItem("user"))
      : null;
    const localUser = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user"))
      : null;
    return sessionUser || localUser;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Socket.IO Provider component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {JSX.Element} Provider component
 */
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  // Get user from storage directly instead of using useAuth
  const [user, setUser] = useState(getCurrentUser());
  const isAuthenticated = !!user;

  /**
   * Check for user changes in storage
   */
  useEffect(() => {
    const handleStorageChange = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
    };

    // Listen for storage events (for when user logs in/out in another tab)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /**
   * Initialize Socket.IO connection
   */
  useEffect(() => {
    // Only connect if user is authenticated
    if (!isAuthenticated || !user?.id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Create Socket.IO connection with simplified options that work
    const serverUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";
    console.log("Attempting to connect to Socket.IO server at:", serverUrl);

    // Use the exact same configuration that worked with the direct connection
    const socketInstance = io(serverUrl, {
      transports: ['polling', 'websocket'], // Try both polling and websocket
      forceNew: true,
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    // Set up event listeners
    socketInstance.on("connect", () => {
      console.log("Socket connected successfully:", socketInstance.id);
      setConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("Socket disconnected. Reason:", reason);
      setConnected(false);
    });

    socketInstance.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
      console.error("Error details:", error);
      setConnected(false);
    });

    socketInstance.on("error", (error) => {
      console.error("Socket general error:", error);
      setConnected(false);
    });

    socketInstance.io.on("reconnect_attempt", (attempt) => {
      console.log("Socket reconnection attempt:", attempt);
    });

    socketInstance.io.on("reconnect_failed", () => {
      console.error("Socket reconnection failed after all attempts");
    });

    // Listen for welcome message from server
    socketInstance.on("welcome", (data) => {
      console.log("Received welcome message from server:", data);
    });

    // Listen for chat joined confirmation
    socketInstance.on("chat_joined", (data) => {
      console.log("Chat join confirmation:", data);
    });

    // Listen for message errors
    socketInstance.on("message_error", (data) => {
      console.error("Message error from server:", data);
    });

    // Listen for message sent confirmation
    socketInstance.on("message_sent", (data) => {
      console.log("Message sent confirmation:", data);
    });

    // Listen for user joined notification
    socketInstance.on("user_joined", (data) => {
      console.log("User joined notification:", data);
    });

    // Save socket instance
    setSocket(socketInstance);

    // Clean up on unmount
    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, [isAuthenticated, user?.id]);

  /**
   * Join a chat room
   * @param {string} chatId - ID of the chat to join
   */
  const joinChat = useCallback(
    (chatId) => {
      if (socket && connected) {
        socket.emit("join_chat", { chatId });
      }
    },
    [socket, connected]
  );

  /**
   * Send a message to a chat room
   * @param {string} chatId - ID of the chat to send the message to
   * @param {Object} message - Message object to send
   */
  const sendMessage = useCallback(
    (chatId, message) => {
      if (socket && connected) {
        socket.emit("send_message", { chatId, message });
      }
    },
    [socket, connected]
  );

  /**
   * Send typing status to a chat room
   * @param {string} chatId - ID of the chat
   * @param {string} userId - ID of the user who is typing
   * @param {boolean} isTyping - Whether the user is typing
   */
  const sendTypingStatus = useCallback(
    (chatId, userId, isTyping) => {
      if (socket && connected) {
        socket.emit("typing", { chatId, userId, isTyping });
      }
    },
    [socket, connected]
  );

  /**
   * Subscribe to receive messages from a chat room
   * @param {Function} callback - Callback function to handle received messages
   * @returns {Function} Cleanup function to unsubscribe
   */
  const onReceiveMessage = useCallback(
    (callback) => {
      if (!socket) return () => {};

      socket.on("receive_message", callback);

      return () => {
        socket.off("receive_message", callback);
      };
    },
    [socket]
  );

  /**
   * Subscribe to typing status updates
   * @param {Function} callback - Callback function to handle typing status updates
   * @returns {Function} Cleanup function to unsubscribe
   */
  const onUserTyping = useCallback(
    (callback) => {
      if (!socket) return () => {};

      socket.on("user_typing", callback);

      return () => {
        socket.off("user_typing", callback);
      };
    },
    [socket]
  );

  /**
   * Mark messages as read
   * @param {string} senderId - ID of the sender
   * @param {string} receiverId - ID of the receiver
   */
  const markMessagesAsRead = useCallback(
    (senderId, receiverId) => {
      if (socket && connected) {
        console.log("Marking messages as read:", { senderId, receiverId });
        socket.emit("mark_read", { senderId, receiverId });
      }
    },
    [socket, connected]
  );

  /**
   * Subscribe to messages marked as read notifications
   * @param {Function} callback - Callback function to handle marked read notifications
   * @returns {Function} Cleanup function to unsubscribe
   */
  const onMessagesMarkedRead = useCallback(
    (callback) => {
      if (!socket) return () => {};

      socket.on("messages_marked_read", callback);

      return () => {
        socket.off("messages_marked_read", callback);
      };
    },
    [socket]
  );

  // Create context value with internal setters
  const value = useMemo(
    () => ({
      socket,
      connected,
      joinChat,
      sendMessage,
      sendTypingStatus,
      markMessagesAsRead,
      onReceiveMessage,
      onUserTyping,
      onMessagesMarkedRead,
      // Internal setters (prefixed with underscore to indicate they're internal)
      _setSocket: setSocket,
      _setConnected: setConnected
    }),
    [
      socket,
      connected,
      joinChat,
      sendMessage,
      sendTypingStatus,
      markMessagesAsRead,
      onReceiveMessage,
      onUserTyping,
      onMessagesMarkedRead,
    ]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export default SocketContext;

