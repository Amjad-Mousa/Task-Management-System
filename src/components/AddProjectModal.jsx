import { useState, useEffect, useContext } from "react";
import { DarkModeContext } from "../Context/DarkModeContext";

const generateId = () => "_" + Math.random().toString(36).substr(2, 9);

const AddProjectModal = ({ isOpen, onClose, onAddProject }) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [projectCategory, setProjectCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [projectStatus, setProjectStatus] = useState("In Progress");
  const [errorMessage, setErrorMessage] = useState("");

  const studentsList = [
    "Student 1",
    "Student 2",
    "Student 3",
    "Student 4",
    "Student 5",
  ];

  // Reset form when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setProjectTitle("");
      setProjectDescription("");
      setSelectedStudents([]);
      setProjectCategory("");
      setStartDate("");
      setEndDate("");
      setProjectStatus("In Progress");
      setErrorMessage("");
    }
  }, [isOpen]);

  const handleStudentSelect = (student) => {
    setSelectedStudents((prev) =>
      prev.includes(student)
        ? prev.filter((s) => s !== student)
        : [...prev, student]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !projectTitle ||
      !projectDescription ||
      !selectedStudents.length ||
      !projectCategory ||
      !startDate ||
      !endDate
    ) {
      setErrorMessage("Please fill out all required fields");
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
      tasks: [],
    };

    onAddProject(newProject);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-4xl p-8 rounded-lg shadow-xl relative ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            Add New Project
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-600 text-white rounded-md">
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-8 max-h-[75vh] overflow-y-auto pr-2"
        >
          {/* Project Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Project Title *</label>
            <input
              type="text"
              value={projectTitle}
              onChange={(e) => setProjectTitle(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-800"
              }`}
              placeholder="Enter project title"
            />
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Project Description *
            </label>
            <textarea
              value={projectDescription}
              onChange={(e) => setProjectDescription(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md h-32 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-800"
              }`}
              placeholder="Enter project description"
            />
          </div>

          {/* Students List */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Select Students *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {studentsList.map((student) => (
                <label
                  key={student}
                  className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedStudents.includes(student)}
                    onChange={() => handleStudentSelect(student)}
                    className={`form-checkbox h-4 w-4 text-blue-500 rounded focus:ring-blue-500 ${
                      isDarkMode
                        ? "border-gray-600 bg-gray-700"
                        : "border-gray-300 bg-white"
                    }`}
                  />
                  <span>{student}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Project Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Project Category *
            </label>
            <select
              value={projectCategory}
              onChange={(e) => setProjectCategory(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-800"
              }`}
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
              <label className="block text-sm font-medium">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-800"
                }`}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">End Date *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-800"
                }`}
              />
            </div>
          </div>

          {/* Project Status */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Project Status *
            </label>
            <select
              value={projectStatus}
              onChange={(e) => setProjectStatus(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-800"
              }`}
            >
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                isDarkMode
                  ? "bg-gray-700 hover:bg-gray-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Add Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;
