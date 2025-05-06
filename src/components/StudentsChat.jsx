/**
 * StudentsChat component for student chat interface
 */
import { useState, useEffect } from "react";
import { DashboardLayout } from "./layout";
import { Card, Button, Input } from "./ui";

const StudentsChat = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState({});

  useEffect(() => {
    document.title = "Student Chat | Task Manager";
    const initialMessages = {
      1: [
        {
          text: "Salam Alykourn",
          sender: "received",
          timestamp: new Date().toISOString(),
        },
      ],
    };
    setMessages(initialMessages);
  }, []);

  const users = [
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

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentUser) return;

    const newMessage = {
      text: messageInput,
      sender: "sent",
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => ({
      ...prev,
      [currentUser]: [...(prev[currentUser] || []), newMessage],
    }));

    setMessageInput("");
  };

  return (
    <DashboardLayout role="student" title="Chat Dashboard">
      <div className="flex flex-1">
        {/* Users List */}
        <div className="w-64 mr-4">
          <Card className="h-full">
            <h3 className="text-lg font-semibold mb-3">Chat Users</h3>
            <ul className="overflow-y-auto">
              {users.map((user) => (
                <li
                  key={user.id}
                  onClick={() => setCurrentUser(user.id)}
                  className={`p-2 cursor-pointer rounded-lg mb-1 ${
                    currentUser === user.id
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {user.name}
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <Card className="mb-4">
            <h3 className="text-lg font-semibold">
              {currentUser
                ? `Chatting with ${
                    users.find((u) => u.id === currentUser)?.name
                  }`
                : "Select a user to start chatting"}
            </h3>
          </Card>

          {/* Messages area */}
          <Card className="flex-1 mb-4 p-4 overflow-y-auto">
            <div className="space-y-4">
              {currentUser &&
                messages[currentUser]?.map((msg, index) => (
                  <div
                    key={index}
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === "received"
                        ? "bg-gray-200 dark:bg-gray-700 self-start"
                        : "bg-blue-600 text-white self-end"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(
                        msg.timestamp || Date.now()
                      ).toLocaleTimeString()}
                    </p>
                  </div>
                ))}

              {!currentUser && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500 dark:text-gray-400">
                    Select a user to start chatting
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Message input */}
          <Card className="p-4">
            <div className="flex gap-2">
              <Input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 mb-0"
                disabled={!currentUser}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!currentUser}
                className="px-4 py-2"
              >
                Send
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentsChat;
