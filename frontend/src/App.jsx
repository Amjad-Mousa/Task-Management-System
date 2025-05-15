/**
 * @file App.jsx - Main application component with routing configuration
 * @module src/App
 */

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

/**
 * Main application component
 * Sets up context providers and defines application routes
 *
 * @returns {React.ReactElement} The rendered application with routing
 */
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
              path="/admin-home"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminHome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-projects"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-tasks"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminTasks />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin-chat"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminChat />
                </ProtectedRoute>
              }
            />

            {/* Student Routes */}
            <Route
              path="/student-home"
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
