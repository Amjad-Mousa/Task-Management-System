import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignUp() {
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
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80 text-center">
        <h1 className="text-2xl mb-5 font-bold">Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 text-left">
            <label className="block mb-1 text-sm text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
              required
            />
          </div>
          <div className="mb-4 text-left">
            <label className="block mb-1 text-sm text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
              required
            />
          </div>
          <div className="mb-4 text-left">
            <label className="text-sm text-gray-300">
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
              <label className="block mb-1 text-sm text-gray-300">University ID</label>
              <input
                type="text"
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
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
        <p className="mt-4 text-sm text-gray-300">
          Already have an account? <Link to="/signin" className="text-blue-500 hover:underline">Login here</Link>
        </p>
      </div>
    </div>
  );
}
