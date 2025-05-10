import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./layout/AuthLayout";
import Input from "./ui/Input";
import Button from "./ui/Button";
import useForm from "../hooks/useForm";
import useAuth from "../hooks/useAuth";

/**
 * SignUp component for user registration
 */
export default function SignUp() {
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, clearAuth, error: authError } = useAuth();

  // Set the page title and clear any existing session
  useEffect(() => {
    document.title = "Sign Up - Task Manager";

    // Clear any existing authentication session
    const clearSession = async () => {
      await clearAuth();
    };

    clearSession();
  }, [clearAuth]);

  // Update message when auth error changes
  useEffect(() => {
    if (authError) {
      setMessage({ text: authError, type: "error" });
    }
  }, [authError]);

  // Form validation function
  const validateForm = (values) => {
    const errors = {};

    if (values.isStudent && !values.universityId.trim()) {
      errors.universityId = "Please enter your University ID";
    }

    if (!values.email || !values.email.includes("@")) {
      errors.email = "Please enter a valid email address";
    }

    return errors;
  };

  // Initialize form with useForm hook
  const { values, handleChange, handleSubmit, errors } = useForm(
    {
      username: "",
      email: "",
      password: "",
      isStudent: false,
      universityId: "",
    },
    validateForm,
    onSubmit
  );

  // Form submission handler
  async function onSubmit(formData) {
    setMessage({ type: "", text: "" });
    setIsLoading(true);

    try {
      // Create user object
      const user = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        isStudent: formData.isStudent,
        universityId: formData.isStudent ? formData.universityId : null,
      };

      // Register user
      const success = await signUp(user);

      if (success) {
        // Show success message
        setMessage({ type: "success", text: "Sign Up Successful!" });

        // Redirect to sign in page after delay
        setTimeout(() => {
          navigate("/signin");
        }, 1500);
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: error.message || "An error occurred during sign up",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Sign Up"
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
          type="email"
          label="Email"
          name="email"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
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
              name="isStudent"
              checked={values.isStudent}
              onChange={handleChange}
              className="mr-2"
            />
            I am a student
          </label>
        </div>

        {values.isStudent && (
          <Input
            type="text"
            label="University ID"
            name="universityId"
            value={values.universityId}
            onChange={handleChange}
            error={errors.universityId}
            required
          />
        )}

        <Button type="submit" variant="primary" fullWidth disabled={isLoading}>
          {isLoading ? "Signing Up..." : "Sign Up"}
        </Button>
      </form>

      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <Link to="/signin" className="text-blue-500 hover:underline">
          Login here
        </Link>
      </p>
    </AuthLayout>
  );
}
