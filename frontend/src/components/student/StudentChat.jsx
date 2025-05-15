/**
 * @file StudentChat.jsx - Student chat interface component
 * @module components/student/StudentChat
 */

import { useState, useEffect } from "react";
import { DashboardLayout } from "../layout";
import { ChatInterface } from "../shared";

/**
 * StudentChat component for student messaging interface
 * Displays a chat interface with other students
 *
 * @returns {React.ReactElement} Rendered StudentChat component
 */
const StudentChat = () => {
  /**
   * List of users available for chat
   * @type {Array<{id: number, name: string}>}
   */
  const [users, setUsers] = useState([]);

  /**
   * Initial messages for each chat
   * @type {Object.<number, Array<{text: string, sender: string, timestamp: string}>>}
   */
  const [initialMessages, setInitialMessages] = useState({});

  /**
   * Initialize chat data on component mount
   */
  useEffect(() => {
    document.title = "Student Chat | Task Manager";

    // Set users
    const studentUsers = [
      { id: 1, name: "Yaseen" },
      { id: 2, name: "Brea Aeesh" },
      { id: 3, name: "Ibn Al-Jawzee" },
      { id: 4, name: "Ibn Malik" },
      { id: 5, name: "Ayman Outom" },
      { id: 6, name: "Salah Salah" },
      { id: 7, name: "Yahya Leader" },
      { id: 8, name: "Salam Kareem" },
      { id: 9, name: "Isaac Nasir" },
      { id: 10, name: "Saeed Salam" },
    ];
    setUsers(studentUsers);

    // Set initial messages
    const messages = {
      1: [
        {
          text: "Salam Alykourn",
          sender: "received",
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setInitialMessages(messages);
  }, []);

  return (
    <DashboardLayout role="student" title="Chat Dashboard">
      <ChatInterface
        role="student"
        users={users}
        initialMessages={initialMessages}
      />
    </DashboardLayout>
  );
};

export default StudentChat;
