import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

const generateId = () => '_' + Math.random().toString(36).substr(2, 9);

const AddProject = () => {
  const navigate = useNavigate();
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [projectCategory, setProjectCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [projectStatus, setProjectStatus] = useState('In Progress');
  const [errorMessage, setErrorMessage] = useState('');

  const studentsList = ['Student 1', 'Student 2', 'Student 3', 'Student 4', 'Student 5'];

  useEffect(() => {
    document.title = "AddProject | Task Manager";
  }, []);

  const handleStudentSelect = (student) => {
    setSelectedStudents(prev =>
      prev.includes(student)
        ? prev.filter(s => s !== student)
        : [...prev, student]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!projectTitle || !projectDescription || !selectedStudents.length ||
      !projectCategory || !startDate || !endDate) {
      setErrorMessage('Please fill out all required fields');
      return;
    }

    const newProject = {
      id: generateId(), 
      title: projectTitle,
      description: projectDescription,
      students: selectedStudents,
      category: projectCategory,
      startDate,
      endDate,
      status: projectStatus,
      progress: 0,
      tasks: []
    };

    const existingProjects = JSON.parse(localStorage.getItem('projects')) || [];
    localStorage.setItem('projects', JSON.stringify([...existingProjects, newProject]));

    navigate('/projects');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-6">
      <div className="max-w-2xl mx-auto bg-gray-800 p-6 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-blue-500 mb-6 text-center">Add New Project</h1>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-600 text-white rounded-md">{errorMessage}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Project Title</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter project title"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Project Description</label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent h-32"
              placeholder="Enter project description"
            />
          </div>

          {/* Students List */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Select Students</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {studentsList.map(student => (
                <label
                  key={student}
                  className="flex items-center space-x-2 p-2 bg-gray-700 rounded-md hover:bg-gray-600 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student)}
                    onChange={() => handleStudentSelect(student)}
                    className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-600 bg-gray-700 focus:ring-blue-500"
                  />
                  <span>{student}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Project Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Project Category</label>
            <select
              value={projectCategory}
              onChange={(e) => setProjectCategory(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Machine Learning">Machine Learning</option>
            </select>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              />
            </div>
          </div>

          {/* Project Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Project Status</label>
            <select
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors duration-200"
          >
            Add Project
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProject;
