import { useState, useEffect, useCallback, useRef } from "react";
import { Card, Button, Input } from "../ui";
import { useSocket, SocketProvider } from "../../Context/SocketContext";
import { useGraphQL } from "../../Context/GraphQLContext";
import {
  CREATE_MESSAGE_MUTATION,
  GET_MESSAGES_BETWEEN_USERS_QUERY,
  MARK_ALL_MESSAGES_AS_READ_MUTATION
} from "../../graphql/queries";

/**
 * @file ChatInterface.jsx - Shared chat interface component with real-time messaging
 * @module components/shared/ChatInterface
 */

/**
 * Inner ChatInterface component that uses the Socket.IO context
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.users - Array of user objects with id and name properties
 * @param {Object} [props.initialMessages={}] - Initial messages object keyed by user ID
 * @returns {React.ReactElement} Rendered ChatInterface component
 */
const ChatInterfaceInner = ({ users, initialMessages = {} }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [loadingMessages, setLoadingMessages] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Get GraphQL context for saving messages to database
  const { executeQuery } = useGraphQL();

  // Get socket context
  const {
    connected,
    joinChat,
    sendMessage,
    sendTypingStatus,
    markMessagesAsRead,
    onReceiveMessage,
    onUserTyping
  } = useSocket();

  // Get current user from storage
  const [currentLoggedInUser, setCurrentLoggedInUser] = useState(() => {
    try {
      const sessionUser = sessionStorage.getItem("user")
        ? JSON.parse(sessionStorage.getItem("user"))
        : null;
      const localUser = localStorage.getItem("user")
        ? JSON.parse(localStorage.getItem("user"))
        : null;

      const user = sessionUser || localUser;

      // Validate user object has required fields
      if (!user || !user.id) {
        console.warn("Invalid user data in storage:", user);
        return null;
      }

      return user;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  });

  // Generate a unique chat ID for the conversation between current user and selected user
  const getChatId = useCallback((userId1, userId2) => {
    // Sort IDs to ensure the same chat ID regardless of who initiates
    const sortedIds = [userId1, userId2].sort();
    return `chat_${sortedIds[0]}_${sortedIds[1]}`;
  }, []);

  // Listen for storage changes (user login/logout)
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const sessionUser = sessionStorage.getItem("user")
          ? JSON.parse(sessionStorage.getItem("user"))
          : null;
        const localUser = localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user"))
          : null;

        const user = sessionUser || localUser;

        // Validate user object has required fields
        if (!user || !user.id) {
          console.warn("Invalid user data in storage after change:", user);
          setCurrentLoggedInUser(null);
          return;
        }

        setCurrentLoggedInUser(user);
      } catch (error) {
        console.error("Error handling storage change:", error);
        setCurrentLoggedInUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load messages when a user is selected
  useEffect(() => {
    if (!currentUser || !currentLoggedInUser?.id) return;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const response = await executeQuery(GET_MESSAGES_BETWEEN_USERS_QUERY, {
          userId: currentUser
        });

        if (response.messagesBetweenUsers) {
          const formattedMessages = response.messagesBetweenUsers.map(msg => ({
            id: msg.id || `db_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            text: msg.content,
            sender: msg.sender.id === currentLoggedInUser.id ? "sent" : "received",
            timestamp: msg.timestamp,
            read: msg.read,
            fromDatabase: true // Mark as loaded from database
          }));

          setMessages(prev => ({
            ...prev,
            [currentUser]: formattedMessages
          }));
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();

    // Mark messages as read when selecting a user
    if (currentUser && currentLoggedInUser?.id) {
      markMessagesAsRead(currentUser, currentLoggedInUser.id);

      // Also mark as read via GraphQL for redundancy
      executeQuery(MARK_ALL_MESSAGES_AS_READ_MUTATION, {
        senderId: currentUser
      }).then(result => {
        console.log("Messages marked as read via GraphQL:", result);
      }).catch(error => {
        console.error("Error marking messages as read via GraphQL:", error);
      });
    }
  }, [currentUser, currentLoggedInUser?.id, executeQuery, markMessagesAsRead]);

  // Join the chat room when a user is selected
  useEffect(() => {
    if (connected && currentUser && currentLoggedInUser?.id) {
      const chatId = getChatId(currentLoggedInUser.id, currentUser);
      joinChat(chatId);
    }
  }, [connected, currentUser, currentLoggedInUser?.id, joinChat, getChatId]);

  // Listen for incoming messages
  useEffect(() => {
    if (!connected || !currentLoggedInUser?.id) {
      console.log("Not listening for messages:", { connected, currentLoggedInUserId: currentLoggedInUser?.id });
      return;
    }

    console.log("Setting up message listener for user:", currentLoggedInUser.id);

    const handleReceiveMessage = (message) => {
      console.log("Received message:", message);

      // Check if the message is relevant to the current user
      const isForCurrentUser = message.senderId === currentUser || message.receiverId === currentUser;
      const isForLoggedInUser = message.senderId === currentLoggedInUser.id || message.receiverId === currentLoggedInUser.id;

      console.log("Message relevance:", {
        isForCurrentUser,
        isForLoggedInUser,
        currentUser,
        currentLoggedInUserId: currentLoggedInUser.id
      });

      // Only add the message if it's for the current chat
      if (isForCurrentUser && isForLoggedInUser) {
        console.log("Processing message for chat with:", currentUser);

        setMessages((prev) => {
          // Check if this message is already in the state (to prevent duplication)
          const existingMessages = prev[currentUser] || [];

          // If the message has an ID, check if we already have it
          if (message.id) {
            const isDuplicate = existingMessages.some(
              msg => msg.id === message.id ||
                    (msg.text === message.text &&
                     msg.timestamp === message.timestamp &&
                     msg.sender === (message.senderId === currentLoggedInUser.id ? "sent" : "received"))
            );

            // Skip adding if it's a duplicate
            if (isDuplicate) {
              console.log("Skipping duplicate message:", message.id);
              return prev;
            }
          }

          // If it's a new message, add it to the state
          const updatedMessages = {
            ...prev,
            [currentUser]: [...existingMessages, {
              id: message.id || `socket_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              text: message.text,
              sender: message.senderId === currentLoggedInUser.id ? "sent" : "received",
              timestamp: message.timestamp
            }],
          };

          console.log("Updated messages state:", updatedMessages);
          return updatedMessages;
        });

        // If this is a received message, mark it as read
        if (message.senderId !== currentLoggedInUser.id) {
          markMessagesAsRead(message.senderId, currentLoggedInUser.id);
        }
      }
    };

    // Subscribe to receive messages
    const unsubscribe = onReceiveMessage(handleReceiveMessage);
    console.log("Subscribed to receive messages");

    return () => {
      console.log("Unsubscribing from message listener");
      unsubscribe();
    };
  }, [connected, currentUser, currentLoggedInUser?.id, onReceiveMessage, markMessagesAsRead]);

  // Listen for typing status updates
  useEffect(() => {
    if (!connected) return;

    const handleUserTyping = ({ userId, isTyping }) => {
      if (userId === currentUser) {
        setTypingUsers((prev) => ({
          ...prev,
          [userId]: isTyping,
        }));
      }
    };

    // Subscribe to typing status updates
    const unsubscribe = onUserTyping(handleUserTyping);

    return () => {
      unsubscribe();
    };
  }, [connected, currentUser, onUserTyping]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentUser]);

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentUser || !currentLoggedInUser?.id) {
      return;
    }

    const timestamp = new Date().toISOString();
    // Generate a unique message ID to prevent duplication
    const messageId = `local_${currentLoggedInUser.id}_${Date.now()}`;

    // Add message to local state immediately for responsive UI
    const newMessage = {
      id: messageId, // Add unique ID to identify this message
      text: messageInput,
      sender: "sent",
      timestamp,
      isLocal: true // Mark as locally added to prevent duplication
    };

    setMessages((prev) => ({
      ...prev,
      [currentUser]: [...(prev[currentUser] || []), newMessage],
    }));

    // Clear input and typing status immediately for better UX
    const messageCopy = messageInput;
    setMessageInput("");
    setIsTyping(false);
    clearTimeout(typingTimeoutRef.current);

    // Create message object for Socket.IO
    const messageObj = {
      id: messageId, // Include the same ID in the socket message
      text: messageCopy,
      senderId: currentLoggedInUser.id,
      senderName: currentLoggedInUser.username || currentLoggedInUser.name,
      receiverId: currentUser,
      timestamp,
    };

    // Make sure we're in the chat room
    const chatId = getChatId(currentLoggedInUser.id, currentUser);
    joinChat(chatId);

    // Send message via socket for real-time display to the specific user
    if (connected) {
      sendMessage(chatId, messageObj);
      sendTypingStatus(chatId, currentLoggedInUser.id, false);
    }

    // Save message to database using GraphQL (regardless of socket connection)
    try {
      // Create input for GraphQL mutation
      const input = {
        content: messageCopy,
        receiverId: currentUser
      };

      // Execute GraphQL mutation to save message
      await executeQuery(CREATE_MESSAGE_MUTATION, { input });
    } catch (error) {
      console.error("Error saving message to database:", error);
      // Could add a visual indicator that the message failed to save
    }
  };

  return (
    <div className="flex h-[calc(100vh-160px)]">
      <div className="w-72 mr-4">
        <Card className="h-full">
          <h3 className="text-xl font-semibold mb-4">Chat Users</h3>
          <div className="overflow-y-auto h-[calc(100%-40px)] pr-2">
            <ul className="space-y-1">
              {users.map((user) => (
                <li
                  key={user.id}
                  onClick={() => setCurrentUser(user.id)}
                  className={`p-3 cursor-pointer rounded-lg transition-colors ${
                    currentUser === user.id
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center mr-3">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      {user.role && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="flex-1 flex flex-col">
        <Card className="mb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {currentUser && (
                <div className="w-10 h-10 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center mr-3">
                  {users
                    .find((u) => u.id === currentUser)
                    ?.name.charAt(0)
                    .toUpperCase()}
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">
                  {currentUser
                    ? `Chatting with ${
                        users.find((u) => u.id === currentUser)?.name
                      }`
                    : "Select a user to start chatting"}
                </h3>
                {currentUser && users.find((u) => u.id === currentUser)?.role && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {users.find((u) => u.id === currentUser)?.role.charAt(0).toUpperCase() +
                     users.find((u) => u.id === currentUser)?.role.slice(1)}
                  </p>
                )}
              </div>
            </div>

            {/* User role indicator */}
            {currentUser && users.find((u) => u.id === currentUser)?.role && (
              <div className="flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {users.find((u) => u.id === currentUser)?.role.charAt(0).toUpperCase() +
                   users.find((u) => u.id === currentUser)?.role.slice(1)}
                </span>
              </div>
            )}
          </div>
        </Card>

        <Card className="flex-1 mb-4 overflow-hidden">
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {loadingMessages && (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {currentUser &&
              messages[currentUser]?.map((msg, index) => (
                <div
                  key={msg.id || index}
                  className={`flex flex-col ${
                    msg.sender === "received" ? "items-start" : "items-end"
                  }`}
                >
                  <div
                    className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${
                      msg.sender === "received"
                        ? "bg-gray-200 dark:bg-gray-700"
                        : "bg-blue-600 text-white"
                    }`}
                  >
                    <p className="break-words">{msg.text}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 px-2">
                    {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
                  </p>
                </div>
              ))}

            {/* Show typing indicator */}
            {currentUser && typingUsers[currentUser] && (
              <div className="flex items-start">
                <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Reference for auto-scrolling */}
            <div ref={messagesEndRef} />

            {!currentUser && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-5xl mb-4">💬</div>
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    Select a user to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <div className="my-4">
                <Input
                  type="text"
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value);

                    // Handle typing status
                    if (connected && currentUser && currentLoggedInUser?.id) {
                      // Only send typing status if not already typing
                      if (!isTyping) {
                        setIsTyping(true);
                        const chatId = getChatId(currentLoggedInUser.id, currentUser);
                        sendTypingStatus(chatId, currentLoggedInUser.id, true);
                      }

                      // Clear previous timeout
                      if (typingTimeoutRef.current) {
                        clearTimeout(typingTimeoutRef.current);
                      }

                      // Set timeout to stop typing status after 2 seconds of inactivity
                      typingTimeoutRef.current = setTimeout(() => {
                        if (connected && currentUser && currentLoggedInUser?.id) {
                          setIsTyping(false);
                          const chatId = getChatId(currentLoggedInUser.id, currentUser);
                          sendTypingStatus(chatId, currentLoggedInUser.id, false);
                        }
                      }, 2000);
                    }
                  }}
                  placeholder="Type your message..."
                  className="w-full mb-0 py-3 px-4 text-base pr-4"
                  disabled={!currentUser}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
              </div>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!currentUser}
              className="px-6 py-3 rounded-md"
              variant="primary"
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              }
            >
              Send
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

/**
 * Wrapper component that provides Socket.IO context to the ChatInterface
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.users - Array of user objects with id and name properties
 * @param {Object} [props.initialMessages={}] - Initial messages object keyed by user ID
 * @returns {React.ReactElement} Rendered ChatInterface component with Socket.IO context
 */
const ChatInterface = (props) => {
  return (
    <SocketProvider>
      <ChatInterfaceInner {...props} />
    </SocketProvider>
  );
};

export default ChatInterface;
