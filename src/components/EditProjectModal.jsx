import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../Context/DarkModeContext";

/**
 * EditProjectModal component for updating existing projects
 */
const EditProjectModal = ({ isOpen, onClose, onUpdateProject, project }) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [projectCategory, setProjectCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [projectStatus, setProjectStatus] = useState("Not Started");
  const [errorMessage, setErrorMessage] = useState("");
  const [dateErrors, setDateErrors] = useState({ startDate: "", endDate: "" });
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  // This would ideally come from an API or database
  // For demo purposes, we'll generate a larger list
  const generateStudentsList = () => {
    const students = [];
    for (let i = 1; i <= 100; i++) {
      students.push(`Student ${i}`);
    }
    return students;
  };

  const studentsList = generateStudentsList();

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayFormatted = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // Validate dates
  const validateDates = () => {
    let isValid = true;
    const newDateErrors = { startDate: "", endDate: "" };

    // Validate start date is today or in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);

    // Only validate start date is in the future for new projects
    // For existing projects, we allow the original start date
    if (!project.id && startDateObj < today) {
      newDateErrors.startDate = "Start date must be today or in the future";
      isValid = false;
    }

    // Validate end date is after start date
    const endDateObj = new Date(endDate);
    endDateObj.setHours(0, 0, 0, 0);

    if (endDateObj < startDateObj) {
      newDateErrors.endDate = "End date must be after start date";
      isValid = false;
    }

    setDateErrors(newDateErrors);
    return isValid;
  };

  // Initialize form with project data when modal opens
  useEffect(() => {
    if (isOpen && project) {
      setProjectTitle(project.title || "");
      setProjectDescription(project.description || "");
      setSelectedStudents(project.students || []);
      setProjectCategory(project.category || "");
      setStartDate(project.startDate || "");
      setEndDate(project.endDate || "");
      setProjectStatus(project.status || "Not Started");
      setErrorMessage("");
      setDateErrors({ startDate: "", endDate: "" });
    }
  }, [isOpen, project]);

  const handleStudentSelect = (student) => {
    setSelectedStudents((prev) =>
      prev.includes(student)
        ? prev.filter((s) => s !== student)
        : [...prev, student]
    );
    // Keep the dropdown open after selection
  };

  // Filter students based on search query
  const filteredStudents = studentsList.filter((student) =>
    student.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  // Toggle the dropdown
  const toggleStudentDropdown = () => {
    setShowStudentDropdown(!showStudentDropdown);
  };

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showStudentDropdown &&
        !event.target.closest(".student-dropdown-container")
      ) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStudentDropdown]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reset error messages
    setErrorMessage("");
    setDateErrors({ startDate: "", endDate: "" });

    // Check required fields
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

    // Validate dates
    if (!validateDates()) {
      // If there are date validation errors, show the general error message
      setErrorMessage("Please fix the date errors before submitting");
      return;
    }

    // Set progress based on status
    let progressValue = 0;
    if (projectStatus === "Completed") {
      progressValue = 100; // Green progress bar
    } else if (projectStatus === "In Progress") {
      progressValue = 60; // Yellow progress bar (> 50)
    } else if (projectStatus === "Pending") {
      progressValue = 25; // Gray progress bar (special case in Projects.jsx)
    } else if (projectStatus === "Not Started") {
      progressValue = 0; // Red progress bar
    }

    const updatedProject = {
      ...project,
      title: projectTitle,
      description: projectDescription,
      students: selectedStudents,
      category: projectCategory,
      startDate,
      endDate,
      status: projectStatus,
      progress: progressValue,
      lastUpdated: new Date().toISOString(),
    };

    onUpdateProject(updatedProject);
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
            Edit Project
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
              rows={4}
              className={`w-full px-4 py-2 border rounded-md resize-none ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-800"
              }`}
              placeholder="Enter project description"
            ></textarea>
          </div>

          {/* Project Category */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Project Category *
            </label>
            <input
              type="text"
              value={projectCategory}
              onChange={(e) => setProjectCategory(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white"
                  : "bg-gray-50 border-gray-300 text-gray-800"
              }`}
              placeholder="E.g., Development, Design, Research"
            />
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
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Students List - Searchable Dropdown */}
          <div className="space-y-2 student-dropdown-container relative">
            <label className="block text-sm font-medium">
              Select Students * ({selectedStudents.length} selected)
            </label>

            {/* Selected Students Pills */}
            {selectedStudents.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedStudents.map((student) => (
                  <div
                    key={student}
                    className={`px-2 py-1 rounded-full text-sm flex items-center gap-1 ${
                      isDarkMode
                        ? "bg-blue-800 text-white"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    <span>{student}</span>
                    <button
                      type="button"
                      onClick={() => handleStudentSelect(student)}
                      className="text-xs font-bold hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearchQuery}
                onChange={(e) => setStudentSearchQuery(e.target.value)}
                onClick={() => setShowStudentDropdown(true)}
                className={`w-full px-4 py-2 border rounded-md ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white"
                    : "bg-gray-50 border-gray-300 text-gray-800"
                }`}
              />
              <button
                type="button"
                onClick={toggleStudentDropdown}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                {showStudentDropdown ? "▲" : "▼"}
              </button>
            </div>

            {/* Dropdown List */}
            {showStudentDropdown && (
              <div
                className={`absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded-md shadow-lg ${
                  isDarkMode
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
              >
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <div
                      key={student}
                      onClick={() => handleStudentSelect(student)}
                      className={`px-4 py-2 cursor-pointer flex items-center ${
                        selectedStudents.includes(student)
                          ? isDarkMode
                            ? "bg-blue-900"
                            : "bg-blue-100"
                          : isDarkMode
                          ? "hover:bg-gray-700"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      <span>{student}</span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    No students found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Start Date *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  // Clear error when user changes the value
                  if (dateErrors.startDate) {
                    setDateErrors({ ...dateErrors, startDate: "" });
                  }
                }}
                className={`w-full px-4 py-2 border rounded-md ${
                  dateErrors.startDate
                    ? "border-red-500"
                    : isDarkMode
                    ? "border-gray-600"
                    : "border-gray-300"
                } ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-800"
                }`}
              />
              {dateErrors.startDate && (
                <p className="text-red-500 text-xs mt-1">
                  {dateErrors.startDate}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium">End Date *</label>
              <input
                type="date"
                value={endDate}
                min={startDate || getTodayFormatted()} // End date must be at least the start date
                onChange={(e) => {
                  setEndDate(e.target.value);
                  // Clear error when user changes the value
                  if (dateErrors.endDate) {
                    setDateErrors({ ...dateErrors, endDate: "" });
                  }
                }}
                className={`w-full px-4 py-2 border rounded-md ${
                  dateErrors.endDate
                    ? "border-red-500"
                    : isDarkMode
                    ? "border-gray-600"
                    : "border-gray-300"
                } ${
                  isDarkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-50 text-gray-800"
                }`}
              />
              {dateErrors.endDate && (
                <p className="text-red-500 text-xs mt-1">
                  {dateErrors.endDate}
                </p>
              )}
            </div>
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
              Update Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditProjectModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdateProject: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired,
};

export default EditProjectModal;
