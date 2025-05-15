import { useState, useCallback } from "react";
import { useGraphQL } from "../Context/GraphQLContext";
import useAuth from "./useAuth";
import {
  GET_MESSAGES_QUERY,
  GET_MESSAGES_BETWEEN_USERS_QUERY,
  CREATE_MESSAGE_MUTATION,
  MARK_MESSAGE_AS_READ_MUTATION,
} from "../graphql/queries";

/**
 * Custom hook for managing messages with GraphQL
 * @returns {Object} Message management functions and state
 */
export const useMessages = () => {
  const { executeQuery } = useGraphQL();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cache expiration time for messages (1 minute)
  const MESSAGES_CACHE_EXPIRATION = 60 * 1000;

  /**
   * Fetch all messages for the current user
   * @param {boolean} forceRefresh - Whether to bypass cache and force a refresh
   * @returns {Promise<Array>} List of messages
   */
  const fetchMessages = useCallback(
    async (forceRefresh = false) => {
      if (!user?.id) return [];

      try {
        setLoading(true);
        setError(null);

        const data = await executeQuery(
          GET_MESSAGES_QUERY,
          {},
          true,
          !forceRefresh,
          MESSAGES_CACHE_EXPIRATION
        );

        if (data && data.messages) {
          setMessages(data.messages);
          return data.messages;
        }
        return [];
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages. Please try again.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [executeQuery, user?.id]
  );

  /**
   * Fetch messages between the current user and another user
   * @param {string} userId - ID of the other user
   * @param {boolean} forceRefresh - Whether to bypass cache and force a refresh
   * @returns {Promise<Array>} List of messages between the two users
   */
  const fetchMessagesBetweenUsers = useCallback(
    async (userId, forceRefresh = false) => {
      if (!user?.id || !userId) return [];

      try {
        setLoading(true);
        setError(null);

        const data = await executeQuery(
          GET_MESSAGES_BETWEEN_USERS_QUERY,
          { userId },
          true,
          !forceRefresh,
          MESSAGES_CACHE_EXPIRATION
        );

        if (data && data.messagesBetweenUsers) {
          return data.messagesBetweenUsers;
        }
        return [];
      } catch (err) {
        console.error("Error fetching messages between users:", err);
        setError("Failed to load conversation. Please try again.");
        return [];
      } finally {
        setLoading(false);
      }
    },
    [executeQuery, user?.id]
  );

  /**
   * Send a message to another user
   * @param {string} content - Content of the message
   * @param {string} receiverId - ID of the message receiver
   * @returns {Promise<Object|null>} Created message or null if failed
   */
  const sendMessage = useCallback(
    async (content, receiverId) => {
      if (!user?.id || !receiverId || !content.trim()) return null;

      try {
        setLoading(true);
        setError(null);

        const data = await executeQuery(
          CREATE_MESSAGE_MUTATION,
          {
            input: {
              content,
              receiverId,
            },
          },
          true,
          false // Don't use cache for mutations
        );

        if (data && data.createMessage) {
          return data.createMessage;
        }
        return null;
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message. Please try again.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [executeQuery, user?.id]
  );

  /**
   * Mark a message as read
   * @param {string} messageId - ID of the message to mark as read
   * @returns {Promise<boolean>} Whether the operation was successful
   */
  const markMessageAsRead = useCallback(
    async (messageId) => {
      if (!user?.id || !messageId) return false;

      try {
        const data = await executeQuery(
          MARK_MESSAGE_AS_READ_MUTATION,
          { id: messageId },
          true,
          false // Don't use cache for mutations
        );

        return !!(data && data.markMessageAsRead);
      } catch (err) {
        console.error("Error marking message as read:", err);
        return false;
      }
    },
    [executeQuery, user?.id]
  );

  return {
    messages,
    loading,
    error,
    fetchMessages,
    fetchMessagesBetweenUsers,
    sendMessage,
    markMessageAsRead,
  };
};
