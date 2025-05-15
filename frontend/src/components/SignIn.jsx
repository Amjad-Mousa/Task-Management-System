import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "./layout/AuthLayout";
import Input from "./ui/Input";
import Button from "./ui/Button";
import useForm from "../hooks/useForm";
import useAuth from "../hooks/useAuth";

/**
 * @file SignIn.jsx - User authentication component
 * @module components/SignIn
 */

/**
 * SignIn component for user authentication
 * @component
 * @returns {React.ReactElement} Rendered SignIn component
 */
export default function SignIn() {
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isAuthenticated, error: authError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Sign In - Task Manager";

    if (isAuthenticated) {
      const user = JSON.parse(
        localStorage.getItem("user") || sessionStorage.getItem("user") || "{}"
      );
      if (user.role === "admin") {
        navigate("/admin-home");
      } else if (user.role === "student") {
        navigate("/student-home");
      }
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (authError) {
      setMessage({ text: authError, type: "error" });
    }
  }, [authError]);

  const { values, handleChange, handleSubmit } = useForm(
    {
      username: "",
      password: "",
      staySignedIn: false,
    },
    null,
    onSubmit
  );

  async function onSubmit(formData) {
    setMessage({ text: "", type: "" });
    setIsLoading(true);

    try {
      const success = await signIn(formData, formData.staySignedIn);

      if (success) {
        setMessage({ text: "Sign In Successful!", type: "success" });
      }
    } catch (error) {
      setMessage({
        text: error.message || "An error occurred during sign in",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Sign In"
      message={message.text}
      messageType={message.type}
    >
      <form onSubmit={handleSubmit}>
        <Input
          type="text"
          label="Username"
          name="username"
          value={values.username}
          onChange={handleChange}
          required
        />

        <Input
          type="password"
          label="Password"
          name="password"
          value={values.password}
          onChange={handleChange}
          required
        />

        <div className="mb-4 text-left">
          <label className="text-sm flex items-center">
            <input
              type="checkbox"
              name="staySignedIn"
              checked={values.staySignedIn}
              onChange={handleChange}
              className="mr-2"
            />
            Stay Signed In
          </label>
        </div>

        <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>
      </form>

      <p className="mt-4 text-sm">
        Don't have an account?{" "}
        <Link to="/signup" className="text-blue-500 hover:underline">
          Create new account
        </Link>
      </p>
    </AuthLayout>
  );
}
