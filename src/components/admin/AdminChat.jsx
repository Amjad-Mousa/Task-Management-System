import { useState, useEffect } from "react";
import { DashboardLayout } from "../layout";
import { ChatInterface } from "../shared";

/**
 * AdminChat component for admin chat interface
 */
const AdminChat = () => {
  const [users, setUsers] = useState([]);
  const [initialMessages, setInitialMessages] = useState({});

  useEffect(() => {
    document.title = "Admin Chat | Task Manager";
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = [
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
      setUsers(fetchedUsers);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
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
    <DashboardLayout role="admin" title="Chat Dashboard">
      <ChatInterface
        role="admin"
        users={users}
        initialMessages={initialMessages}
      />
    </DashboardLayout>
  );
};

export default AdminChat;
