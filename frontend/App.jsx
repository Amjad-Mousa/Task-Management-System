import "./App.css";
import React from "react";
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

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<AdminHome />} />
          <Route path="/projects" element={<AdminProjects />} />
          <Route path="/tasks" element={<AdminTasks />} />
          <Route path="/chat" element={<AdminChat />} />
          <Route path="/stu-home" element={<StudentHome />} />
          <Route path="/student-task" element={<StudentTask />} />
          <Route path="/student-chat" element={<StudentChat />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
