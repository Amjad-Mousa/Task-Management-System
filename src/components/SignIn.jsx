import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate(); // Using useNavigate correctly

  // Set the page title using useEffect
  useEffect(() => {
    document.title = "Sign In - Task Manager "; // Change 'MyApp' to your app's name
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const fakeStudent = { username: "student", password: "student123" };
    const fakeAdmin = { username: "admin", password: "admin123" };

    let user = null;

    if (username === fakeStudent.username && password === fakeStudent.password) {
      user = { role: "student", username };
      setMessage({ text: "Sign In Successful!", type: "success" });
      setTimeout(() => {
        navigate("/stu-home"); // Navigate after timeout
      }, 1500);
    } else if (username === fakeAdmin.username && password === fakeAdmin.password) {
      user = { role: "admin", username };
      setMessage({ text: "Sign In Successful!", type: "success" });
      setTimeout(() => {
        navigate("/home"); // Navigate after timeout
      }, 1500);
    } else {
      setMessage({ text: "Invalid username or password.", type: "error" });
      return;
    }

    const storage = staySignedIn ? localStorage : sessionStorage;
    storage.setItem("user", JSON.stringify(user)); // Store user data
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-80 text-center">
        <h1 className="text-2xl mb-5 font-bold">Sign In</h1>
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
                checked={staySignedIn}
                onChange={(e) => setStaySignedIn(e.target.checked)}
                className="mr-2"
              />
              Stay Signed In
            </label>
          </div>
          <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-semibold">
            Sign In
          </button>
        </form>
        {message.text && (
          <div className={`mt-3 text-sm ${message.type === "success" ? "text-green-400" : "text-red-400"}`}>
            {message.text}
          </div>
        )}
        <p className="mt-4 text-sm text-gray-300">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">Create new account</Link>
        </p>
      </div>
    </div>
  );
}
