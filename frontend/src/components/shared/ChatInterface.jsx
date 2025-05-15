import { useState } from "react";
import { Card, Button, Input } from "../ui";

/**
 * @file ChatInterface.jsx - Shared chat interface component
 * @module components/shared/ChatInterface
 */

/**
 * Shared ChatInterface component for both admin and student chat interfaces
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.users - Array of user objects with id and name properties
 * @param {Object} [props.initialMessages={}] - Initial messages object keyed by user ID
 * @returns {React.ReactElement} Rendered ChatInterface component
 */
const ChatInterface = ({ users, initialMessages = {} }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState(initialMessages);

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
                    <span className="font-medium">{user.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      <div className="flex-1 flex flex-col">
        <Card className="mb-4">
          <div className="flex items-center">
            {currentUser && (
              <div className="w-10 h-10 rounded-full bg-blue-500 dark:bg-blue-600 text-white flex items-center justify-center mr-3">
                {users
                  .find((u) => u.id === currentUser)
                  ?.name.charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <h3 className="text-xl font-semibold">
              {currentUser
                ? `Chatting with ${
                    users.find((u) => u.id === currentUser)?.name
                  }`
                : "Select a user to start chatting"}
            </h3>
          </div>
        </Card>

        <Card className="flex-1 mb-4 overflow-hidden">
          <div className="h-full overflow-y-auto p-6 space-y-4">
            {currentUser &&
              messages[currentUser]?.map((msg, index) => (
                <div
                  key={index}
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
                  onChange={(e) => setMessageInput(e.target.value)}
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

export default ChatInterface;
