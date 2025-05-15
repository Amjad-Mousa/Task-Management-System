/**
 * @file StudentChat.jsx - Student chat interface component
 * @module components/student/StudentChat
 */

import { useState, useEffect } from "react";
import { DashboardLayout } from "../layout";
import { ChatInterface } from "../shared";
import { useGraphQL } from "../../Context/GraphQLContext";
import { GET_USERS_QUERY } from "../../graphql/queries";
import useAuth from "../../hooks/useAuth";

/**
 * StudentChat component for student messaging interface
 * Displays a chat interface with other students
 *
 * @returns {React.ReactElement} Rendered StudentChat component
 */
const StudentChat = () => {
  /**
   * List of users available for chat
   * @type {Array<{id: string, name: string, role: string}>}
   */
  const [users, setUsers] = useState([]);

  /**
   * Initial messages for each chat
   * @type {Object.<string, Array<{text: string, sender: string, timestamp: string}>>}
   */
  const [initialMessages, setInitialMessages] = useState({});

  /**
   * Loading state for users data
   * @type {boolean}
   */
  const [loading, setLoading] = useState(true);

  /**
   * Error state for users data
   * @type {string|null}
   */
  const [error, setError] = useState(null);

  /**
   * GraphQL query executor
   */
  const { executeQuery } = useGraphQL();

  /**
   * Current logged-in user
   */
  const { user: currentUser } = useAuth();

  /**
   * Set document title on component mount
   */
  useEffect(() => {
    document.title = "Student Chat | Task Manager";
  }, []);

  /**
   * Fetch users from the database
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await executeQuery(GET_USERS_QUERY);

        if (response && response.users) {
          // Filter users to get all users except the current user
          const allUsers = response.users
            .filter(user => user.id !== currentUser?.id) // Exclude current user
            .map(user => ({
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role
            }));

          setUsers(allUsers);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");

        // Fallback to dummy data if API fails
        const dummyUsers = [
          { id: 1, name: "Yaseen" },
          { id: 2, name: "Brea Aeesh" },
          { id: 3, name: "Ibn Al-Jawzee" },
          { id: 4, name: "Ibn Malik" },
          { id: 5, name: "Ayman Outom" },
        ];
        setUsers(dummyUsers);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [executeQuery, currentUser?.id]);

  /**
   * Initialize empty messages
   */
  useEffect(() => {
    // Initialize with empty messages
    const messages = {};
    setInitialMessages(messages);
  }, []);

  return (
    <DashboardLayout role="student" title="Chat Dashboard">
      {loading ? (
        <div className="flex justify-center items-center h-[calc(100vh-160px)]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-[calc(100vh-160px)]">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <ChatInterface
          role="student"
          users={users}
          initialMessages={initialMessages}
        />
      )}
    </DashboardLayout>
  );
};

export default StudentChat;
