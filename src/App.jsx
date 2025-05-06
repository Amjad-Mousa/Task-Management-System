import "./App.css";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import StudentHome from "./components/StudentHome";
import Home from "./components/Home";
import Projects from "./components/Projects";
import Tasks from "./components/Tasks";
import AdminChat from "./components/AdminChat";
import StudentTask from "./components/StudentTask";
import StudentsChat from "./components/StudentsChat";
import { DarkModeProvider } from "./Context/DarkModeContext";

function App() {
  return (
    <DarkModeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SignIn />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/chat" element={<AdminChat />} />
          <Route path="/stu-home" element={<StudentHome />} />
          <Route path="/student-task" element={<StudentTask />} />
          <Route path="/student-chat" element={<StudentsChat />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
