import './App.css'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import StuHome from './components/StuHome';
import Home from './components/Home';
import Projects from './components/Projects';
import AddProject from './components/AddProject';
import Tasks from './components/Tasks';
import AddTask from './components/AddTask';
import Chat from './components/Chat';
import StudentTask from './components/StudentTask';
import StudentsChat from './components/StudentsChat';
import { DarkModeProvider } from './Context/DarkModeContext';

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
          <Route path="/add-project" element={<AddProject />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/add-task" element={<AddTask />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/stu-home" element={<StuHome />} />
          <Route path="/student-task" element={<StudentTask />} />
          <Route path="/student-chat" element={<StudentsChat />} />
        </Routes>
      </Router>
    </DarkModeProvider>
  );
}

export default App;
