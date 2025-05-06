import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { DarkModeContext } from "../Context/DarkModeContext";
import DarkModeToggle from "./DarkModeToggle";
import Sidebar from "./Sidebar";

const AdminChat = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(DarkModeContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    document.title = "Chat | Task Manager";
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
    const initialMessages = {
      1: [{ text: "Salam Alykourn", sender: "received" }],
    };
    setMessages(initialMessages);
  }, []);

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

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/signin");
  };

  return (
    <div
      className={`flex h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"
      }`}
    >
      <Sidebar
        role="admin"
        username={
          currentUser ? users.find((u) => u.id === currentUser)?.name : "Admin"
        }
      />

      <main
        className={`flex-1 flex flex-col relative ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <header className="mb-8 p-6">
          <div className="flex items-center justify-between w-full mb-4">
            <h1 className="text-2xl font-bold">Chat Dashboard</h1>
            <DarkModeToggle />
          </div>
        </header>

        <div className="flex flex-1 px-6">
          <div className="w-64 mr-4">
            <h3 className="text-lg font-semibold mb-3">Chat Users</h3>
            <ul className="overflow-y-auto mb-4 bg-white dark:bg-gray-800 rounded-lg shadow p-2">
              {users.map((user) => (
                <li
                  key={user.id}
                  onClick={() => setCurrentUser(user.id)}
                  className={`p-2 cursor-pointer rounded-lg mb-1 ${
                    currentUser === user.id
                      ? "bg-blue-600 text-white"
                      : isDarkMode
                      ? "hover:bg-gray-700"
                      : "hover:bg-gray-200"
                  }`}
                >
                  {user.name}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-4">
              <h3 className="text-lg font-semibold mb-2">
                {currentUser
                  ? `Chatting with ${
                      users.find((u) => u.id === currentUser)?.name
                    }`
                  : "Select a user to start chatting"}
              </h3>
            </div>

            {/* Messages area*/}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-800 rounded-lg shadow mb-4">
              {currentUser &&
                messages[currentUser]?.map((msg, index) => (
                  <div
                    key={index}
                    className={`max-w-[70%] p-3 rounded-lg ${
                      msg.sender === "received"
                        ? isDarkMode
                          ? "bg-gray-700 self-start"
                          : "bg-gray-200 self-start"
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

            {/* Enter message*/}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Type your message..."
                  className={`flex-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDarkMode
                      ? "bg-gray-700 text-white border-gray-600"
                      : "bg-gray-50 text-gray-800 border border-gray-300"
                  }`}
                  disabled={!currentUser}
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 btn-hover-effect disabled:opacity-50"
                  disabled={!currentUser}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminChat;
