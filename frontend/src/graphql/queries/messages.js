/**
 * GraphQL queries and mutations related to messages
 */

/**
 * Query to get all messages for the current user
 */
export const GET_MESSAGES_QUERY = `
  query GetMessages {
    messages {
      id
      content
      sender {
        id
        role
        user {
          id
          name
          email
        }
      }
      timestamp
      read
    }
  }
`;

/**
 * Query to get messages between the current user and another user
 */
export const GET_MESSAGES_BETWEEN_USERS_QUERY = `
  query GetMessagesBetweenUsers($userId: ID!) {
    messagesBetweenUsers(userId: $userId) {
      id
      content
      sender {
        id
        role
        user {
          id
          name
          email
        }
      }
      timestamp
      read
    }
  }
`;

/**
 * Mutation to create a new message
 */
export const CREATE_MESSAGE_MUTATION = `
  mutation CreateMessage($input: CreateMessageInput!) {
    createMessage(input: $input) {
      id
      content
      sender {
        id
        role
      }
      timestamp
      read
    }
  }
`;

/**
 * Mutation to mark a message as read
 */
export const MARK_MESSAGE_AS_READ_MUTATION = `
  mutation MarkMessageAsRead($id: ID!) {
    markMessageAsRead(id: $id) {
      id
      read
    }
  }
`;

/**
 * Mutation to mark all messages from a sender as read
 */
export const MARK_ALL_MESSAGES_AS_READ_MUTATION = `
  mutation MarkAllMessagesAsRead($senderId: ID!) {
    markAllMessagesAsRead(senderId: $senderId) {
      success
      message
    }
  }
`;
