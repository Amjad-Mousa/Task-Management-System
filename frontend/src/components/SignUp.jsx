import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "./layout/AuthLayout";
import Input from "./ui/Input";
import Button from "./ui/Button";
import useForm from "../hooks/useForm";
import useAuth from "../hooks/useAuth";

/**
 * @file SignUp.jsx - User registration component
 * @module components/SignUp
 */

/**
 * SignUp component for user registration
 * @component
 * @returns {React.ReactElement} Rendered SignUp component
 */
export default function SignUp() {
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signUp, clearAuth, error: authError } = useAuth();

  useEffect(() => {
    document.title = "Sign Up - Task Manager";

    const clearSession = async () => {
      await clearAuth();
    };

    clearSession();
  }, [clearAuth]);

  useEffect(() => {
    if (authError) {
      setMessage({ text: authError, type: "error" });
    }
  }, [authError]);

  const validateForm = (values) => {
    const errors = {};

    if (values.isStudent && !values.universityId.trim()) {
      errors.universityId = "Please enter your University ID";
    }

    if (values.isStudent && !values.major.trim()) {
      errors.major = "Please enter your major";
    }

    if (values.isStudent && !values.year.trim()) {
      errors.year = "Please enter your year of study";
    }

    if (!values.email || !values.email.includes("@")) {
      errors.email = "Please enter a valid email address";
    }

    return errors;
  };

  const { values, handleChange, handleSubmit, errors } = useForm(
    {
      username: "",
      email: "",
      password: "",
      isStudent: false,
      universityId: "",
      major: "",
      year: "",
    },
    validateForm,
    onSubmit
  );

  async function onSubmit(formData) {
    setMessage({ type: "", text: "" });
    setIsLoading(true);

    try {
      const user = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        isStudent: formData.isStudent,
        universityId: formData.isStudent ? formData.universityId : null,
        major: formData.isStudent ? formData.major : null,
        year: formData.isStudent ? formData.year : null,
      };

      const success = await signUp(user);

      if (success) {
        setMessage({ type: "success", text: "Sign Up Successful!" });

        setTimeout(() => {
          navigate("/signin");
        }, 1000);
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
          <>
            <Input
              type="text"
              label="University ID"
              name="universityId"
              value={values.universityId}
              onChange={handleChange}
              error={errors.universityId}
              required
            />

            <Input
              type="text"
              label="Major"
              name="major"
              value={values.major}
              onChange={handleChange}
              error={errors.major}
              required
            />

            <Input
              type="text"
              label="Year of Study"
              name="year"
              value={values.year}
              onChange={handleChange}
              error={errors.year}
              required
            />
          </>
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
