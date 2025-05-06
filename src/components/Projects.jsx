import { useState, useEffect, useContext } from "react";
import { DarkModeContext } from "../Context/DarkModeContext";
import DarkModeToggle from "./DarkModeToggle";
import AddProjectModal from "./AddProjectModal";
import Sidebar from "./Sidebar";

const Projects = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    const projectsWithIds = savedProjects.map((project) => ({
      ...project,
      id: project.id || Date.now() + Math.random(),
    }));
    setProjects(projectsWithIds);
  }, []);

  useEffect(() => {
    document.title = "Projects Manager| Task Manager";
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || sessionStorage.getItem("user")
    );
    if (storedUser?.username) {
      setUsername(storedUser.username);
    }
  }, []);

  const filteredProjects = projects.filter((project) => {
    const matchesCategory = filter === "All" || project.category === filter;
    const matchesSearch =
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const confirmDeleteProject = (id) => {
    const updatedProjects = projects.filter((project) => project.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setDeleteMessage("Project deleted successfully!");
    setProjectToDelete(null);
    setTimeout(() => setDeleteMessage(null), 2000);
  };

  const handleAddProject = (newProject) => {
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setDeleteMessage("Project added successfully!");
    setIsAddProjectModalOpen(false);
    setTimeout(() => setDeleteMessage(null), 2000);
  };

  return (
    <div
      className={`flex h-screen ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"
      }`}
    >
      <Sidebar role="admin" username={username} />

      <main
        className={`flex-1 p-6 relative overflow-y-auto ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        {deleteMessage && (
          <div className="fixed bottom-0 left-0 right-0 bg-green-600 text-white text-center py-2 z-50 success-message">
            {deleteMessage}
          </div>
        )}

        <header className="mb-8 w-full">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h1 className="text-2xl font-bold">Projects Overview</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsAddProjectModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 btn-hover-effect tooltip flex items-center gap-2"
                data-tooltip="Create a new project"
              >
                <span>➕</span> <span className="font-medium">Add Project</span>
              </button>
              <DarkModeToggle />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search projects..."
              className={`px-4 py-2 rounded-lg w-full md:w-64 ${
                isDarkMode
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-800 border border-gray-300"
              }`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <select
              className={`px-4 py-2 rounded-lg ${
                isDarkMode
                  ? "bg-gray-800 text-white border-gray-700"
                  : "bg-white text-gray-800 border border-gray-300"
              }`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Machine Learning">Machine Learning</option>
            </select>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className={`p-4 rounded-lg hover:transform hover:scale-105 transition-all dashboard-card ${
                isDarkMode ? "bg-gray-800" : "bg-white shadow-md"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-2 ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {project.title}
              </h3>
              <p
                className={`line-clamp-2 mb-4 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                {project.description}
              </p>

              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-semibold">Students:</span>{" "}
                  {project.students?.join(", ")}
                </p>
                <p>
                  <span className="font-semibold">Category:</span>{" "}
                  {project.category}
                </p>

                <div className="space-y-2">
                  <p className="font-semibold">Progress:</p>
                  <p
                    className={`px-4 py-2 rounded-lg text-white ${
                      project.progress === 100
                        ? "bg-green-600"
                        : project.progress > 50
                        ? "bg-yellow-500"
                        : "bg-red-600"
                    }`}
                  >
                    {project.progress === 100
                      ? "Complete"
                      : project.progress > 50
                      ? "In Progress"
                      : "Not Started"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setSelectedProject(project)}
                  className={`px-3 py-2 rounded-lg ${
                    isDarkMode
                      ? "bg-gray-600 hover:bg-gray-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  View Details
                </button>

                <button
                  onClick={() => setProjectToDelete(project)}
                  className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedProject && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex justify-end z-50">
            <div
              className={`w-full md:w-96 p-6 h-full overflow-y-auto ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Project Details</h2>
                <button
                  onClick={() => setSelectedProject(null)}
                  className={`text-3xl ${
                    isDarkMode ? "hover:text-gray-400" : "hover:text-gray-600"
                  }`}
                >
                  &times;
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3
                    className={`text-xl font-bold mb-2 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  >
                    {selectedProject.title}
                  </h3>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {selectedProject.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Students</h4>
                    <p
                      className={isDarkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      {selectedProject.students?.join(", ")}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Category</h4>
                    <p
                      className={isDarkMode ? "text-gray-300" : "text-gray-600"}
                    >
                      {selectedProject.category}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <h4 className="font-semibold mb-2">Progress</h4>
                    <p
                      className={`px-4 py-2 rounded-lg text-white ${
                        selectedProject.progress === 100
                          ? "bg-green-600"
                          : selectedProject.progress > 50
                          ? "bg-yellow-500"
                          : "bg-red-600"
                      }`}
                    >
                      {selectedProject.progress === 100
                        ? "Complete"
                        : selectedProject.progress > 50
                        ? "In Progress"
                        : "Not Started"}
                    </p>
                  </div>
                </div>

                {selectedProject.tasks?.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-3">Tasks</h4>
                    <ul className="space-y-2">
                      {selectedProject.tasks.map((task, index) => (
                        <li
                          key={index}
                          className={`px-4 py-2 rounded-lg text-white ${
                            task.completed
                              ? "bg-green-600"
                              : isDarkMode
                              ? "bg-gray-700"
                              : "bg-gray-500"
                          }`}
                        >
                          {task.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {projectToDelete && (
          <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
            <div
              className={`p-6 rounded-lg w-full max-w-md ${
                isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
              }`}
            >
              <h2 className="text-xl font-bold mb-4 text-red-500">
                Confirm Deletion
              </h2>
              <p
                className={`mb-6 ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Are you sure you want to delete{" "}
                <strong>{projectToDelete.title}</strong>?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setProjectToDelete(null)}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode
                      ? "bg-gray-600 hover:bg-gray-500 text-white"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeleteProject(projectToDelete.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <AddProjectModal
          isOpen={isAddProjectModalOpen}
          onClose={() => setIsAddProjectModalOpen(false)}
          onAddProject={handleAddProject}
        />
      </main>
    </div>
  );
};

export default Projects;
