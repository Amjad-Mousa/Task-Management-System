import React from "react";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import {
  AdminHome,
  AdminProjects,
  AdminTasks,
  AdminChat,
} from "./components/admin";
import { StudentHome, StudentTask, StudentChat } from "./components/student";
import { DarkModeProvider } from "./Context/DarkModeContext";
import { GraphQLProvider } from "./Context/GraphQLContext";
import ProtectedRoute from "./components/ProtectedRoutes";
function App() {
  return (
    <DarkModeProvider>
      <GraphQLProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<SignIn />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* Admin Routes */}
            <Route
              path="/home"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/projects"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/tasks"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminChat />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/stu-home"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-task"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentTask />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student-chat"
              element={
                <ProtectedRoute requiredRole="student">
                  <StudentChat />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </GraphQLProvider>
    </DarkModeProvider>
  );
}

export default App;
