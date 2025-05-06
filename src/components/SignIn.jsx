import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "./layout/AuthLayout";
import Input from "./ui/Input";
import Button from "./ui/Button";
import useForm from "../hooks/useForm";
import useAuth from "../hooks/useAuth";

/**
 * SignIn component for user authentication
 */
export default function SignIn() {
  const [message, setMessage] = useState({ text: "", type: "" });
  const { signIn } = useAuth();

  // Set page title
  useEffect(() => {
    document.title = "Sign In - Task Manager";
  }, []);

  // Initialize form with useForm hook
  const { values, handleChange, handleSubmit } = useForm(
    {
      username: "",
      password: "",
      staySignedIn: false,
    },
    null, // No validation function for now
    onSubmit // Submit handler
  );

  // Form submission handler
  function onSubmit(formData) {
    setMessage({ text: "", type: "" });

    const fakeStudent = { username: "student", password: "student123" };
    const fakeAdmin = { username: "admin", password: "admin123" };

    let user = null;

    if (
      formData.username === fakeStudent.username &&
      formData.password === fakeStudent.password
    ) {
      user = { role: "student", username: formData.username, isStudent: true };
      setMessage({ text: "Sign In Successful!", type: "success" });

      // Sign in with the useAuth hook
      setTimeout(() => {
        signIn(user, formData.staySignedIn);
      }, 1500);
    } else if (
      formData.username === fakeAdmin.username &&
      formData.password === fakeAdmin.password
    ) {
      user = { role: "admin", username: formData.username, isStudent: false };
      setMessage({ text: "Sign In Successful!", type: "success" });

      // Sign in with the useAuth hook
      setTimeout(() => {
        signIn(user, formData.staySignedIn);
      }, 1500);
    } else {
      setMessage({ text: "Invalid username or password.", type: "error" });
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

        <Button type="submit" variant="primary" fullWidth>
          Sign In
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
