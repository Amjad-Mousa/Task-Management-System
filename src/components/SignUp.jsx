import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { DarkModeContext } from "../Context/DarkModeContext";
import DarkModeToggle from "./DarkModeToggle";

export default function SignUp() {
  const { isDarkMode } = useContext(DarkModeContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const [universityId, setUniversityId] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const navigate = useNavigate();

  // Set the page title using useEffect
  useEffect(() => {
    document.title = "Sign Up - Task Manager"; // Change 'MyApp' to your app's name
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (isStudent && universityId.trim() === "") {
      setMessage({ type: "error", text: "Please enter your University ID." });
      return;
    }

    const user = {
      username,
      password,
      isStudent,
      universityId: isStudent ? universityId : null,
    };

    localStorage.setItem("user", JSON.stringify(user));
    setMessage({ type: "success", text: "Sign Up Successful!" });

    setTimeout(() => {
      navigate("/signin");
    }, 1500);
  };

  return (
    <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className={`p-6 rounded-lg shadow-lg w-80 text-center relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="absolute top-3 right-3">
          <DarkModeToggle />
        </div>
        <h1 className="text-2xl mb-5 font-bold">Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-left">
            <label className={`block mb-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-3 py-2 border rounded ${
                isDarkMode
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-50 text-gray-800 border-gray-300'
              }`}
              required
            />
          </div>
          <div className="mb-4 text-left">
            <label className={`block mb-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded ${
                isDarkMode
                  ? 'bg-gray-700 text-white border-gray-600'
                  : 'bg-gray-50 text-gray-800 border-gray-300'
              }`}
              required
            />
          </div>
          <div className="mb-4 text-left">
            <label className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <input
                type="checkbox"
                checked={isStudent}
                onChange={(e) => setIsStudent(e.target.checked)}
                className="mr-2"
              />
              I am a student
            </label>
          </div>
          {isStudent && (
            <div className="mb-4 text-left">
              <label className={`block mb-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>University ID</label>
              <input
                type="text"
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className={`w-full px-3 py-2 border rounded ${
                  isDarkMode
                    ? 'bg-gray-700 text-white border-gray-600'
                    : 'bg-gray-50 text-gray-800 border-gray-300'
                }`}
              />
            </div>
          )}
          <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold">
            Sign Up
          </button>
        </form>
        {message.text && (
          <div className={`mt-3 text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {message.text}
          </div>
        )}
        <p className={`mt-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Already have an account? <Link to="/signin" className="text-blue-500 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
