import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DarkModeContext } from '../Context/DarkModeContext';
import DarkModeToggle from './DarkModeToggle';

const AdminChat = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(DarkModeContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
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
        { id: 10, name: "Saeed Salam" }
      ];
      setUsers(fetchedUsers);
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const initialMessages = {
      1: [{ text: "Salam Alykourn", sender: "received" }]
    };
    setMessages(initialMessages);
  }, []);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentUser) return;

    const newMessage = {
      text: messageInput,
      sender: "sent",
      timestamp: new Date().toISOString()
    };

    setMessages(prev => ({
      ...prev,
      [currentUser]: [...(prev[currentUser] || []), newMessage]
    }));

    setMessageInput('');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/signin');
  };

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
      {/*Admin sidebar*/}
      <div className={`w-64 p-4 flex flex-col border-r relative ${
        isDarkMode
          ? 'bg-gray-800 text-white border-gray-700'
          : 'bg-white text-gray-800 border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Admin Chat</h2>
          <DarkModeToggle />
        </div>

        {/* Admin user text box*/}
        <ul className="flex-1 overflow-y-auto mb-4">
          {users.map(user => (
            <li
              key={user.id}
              onClick={() => setCurrentUser(user.id)}
              className={`p-2 cursor-pointer rounded-lg mb-1 ${
                currentUser === user.id
                  ? 'bg-blue-600 text-white'
                  : isDarkMode
                    ? 'hover:bg-gray-700'
                    : 'hover:bg-gray-200'
              }`}
            >
              {user.name}
            </li>
          ))}
        </ul>

        {/*Nav bar*/}
        <nav className={`space-y-2 border-t pt-4 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <Link to="/home" className={`flex items-center p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
            <span className="mr-2">🏠</span> Home
          </Link>
          <Link to="/projects" className={`flex items-center p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
            <span className="mr-2">📂</span> Projects
          </Link>
          <Link to="/tasks" className={`flex items-center p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}>
            <span className="mr-2">✅</span> Tasks
          </Link>
          <Link to="/chat" className="flex items-center p-2 rounded-lg bg-blue-600 text-white">
            <span className="mr-2">💬</span> Chat
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-4 p-2 bg-red-600 rounded-lg hover:bg-red-500"
        >
          <span className="mr-2">🚪</span> Logout
        </button>
      </div>

      <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>

        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className="text-lg font-semibold">
            {currentUser
              ? `Chatting with ${users.find(u => u.id === currentUser)?.name}`
              : "Select a user to start chatting"}
          </h3>
        </div>

        {/* Messages area*/}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentUser && messages[currentUser]?.map((msg, index) => (
            <div
              key={index}
              className={`max-w-[70%] p-3 rounded-lg ${
                msg.sender === 'received'
                  ? isDarkMode ? 'bg-gray-800 self-start' : 'bg-gray-200 self-start'
                  : 'bg-blue-600 text-white self-end'
              }`}
            >
              <p>{msg.text}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          ))}
        </div>

        {/* Enter message*/}
        <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className={`flex-1 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-800 text-white border-gray-700'
                  : 'bg-white text-gray-800 border border-gray-300'
              }`}
              disabled={!currentUser}
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50"
              disabled={!currentUser}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminChat;
