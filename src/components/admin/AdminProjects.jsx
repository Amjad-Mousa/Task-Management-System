import { useState, useEffect, useContext } from "react";
import { DarkModeContext } from "../../Context/DarkModeContext";
import { DashboardLayout } from "../layout";
import AddProjectModal from "../AddProjectModal";
import EditProjectModal from "../EditProjectModal";
import {
  getStatusColor,
  sortItems,
  getSearchInputClasses,
  getStatusFromProgress,
  SUCCESS_MESSAGE_TIMEOUT,
} from "../../utils/adminUtils";

const AdminProjects = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "title",
    direction: "asc",
  });

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    const projectsWithIds = savedProjects.map((project) => ({
      ...project,
      id: project.id || Date.now() + Math.random(),
    }));
    setProjects(projectsWithIds);
  }, []);

  useEffect(() => {
    document.title = "Projects Manager | Task Manager";
  }, []);

  // Sort projects function
  const sortProjects = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      const query = searchQuery.toLowerCase();
      return (
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        (project.category && project.category.toLowerCase().includes(query)) ||
        (project.students &&
          project.students.some((student) =>
            student.toLowerCase().includes(query)
          ))
      );
    })
    // Use the shared utility function for sorting
    .sort((a, b) => (sortItems([a, b], sortConfig)[0] === a ? -1 : 1));

  const confirmDeleteProject = (id) => {
    const updatedProjects = projects.filter((project) => project.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setDeleteMessage("Project deleted successfully!");
    setProjectToDelete(null);
    setTimeout(() => setDeleteMessage(null), SUCCESS_MESSAGE_TIMEOUT);
  };

  const handleAddProject = (newProject) => {
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setDeleteMessage("Project added successfully!");
    setIsAddProjectModalOpen(false);
    setTimeout(() => setDeleteMessage(null), SUCCESS_MESSAGE_TIMEOUT);
  };

  const handleUpdateProject = (updatedProject) => {
    const updatedProjects = projects.map((project) =>
      project.id === updatedProject.id ? updatedProject : project
    );
    setProjects(updatedProjects);
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setDeleteMessage("Project updated successfully!");
    setIsEditProjectModalOpen(false);
    setProjectToEdit(null);
    setTimeout(() => setDeleteMessage(null), SUCCESS_MESSAGE_TIMEOUT);
  };

  return (
    <DashboardLayout
      role="admin"
      title="Projects Overview"
      successMessage={deleteMessage}
    >
      <div className="flex flex-col md:flex-row justify-between items-center w-full mb-6">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search projects (title, category, students)..."
            className={getSearchInputClasses(isDarkMode) + " w-full md:w-96"}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            className={`px-4 py-2 rounded-lg ${
              isDarkMode
                ? "bg-gray-800 text-white border-gray-700"
                : "bg-white text-gray-800 border border-gray-300"
            }`}
            value={sortConfig.key}
            onChange={(e) => sortProjects(e.target.value)}
          >
            <option value="title">Sort by Title</option>
            <option value="category">Sort by Category</option>
            <option value="progress">Sort by Progress</option>
          </select>

          <button
            onClick={() => sortProjects(sortConfig.key)}
            className={`px-3 py-2 rounded-lg flex items-center gap-1 ${
              isDarkMode
                ? "bg-gray-700 text-white hover:bg-gray-600"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
            title={`Sort ${
              sortConfig.direction === "asc" ? "Descending" : "Ascending"
            }`}
          >
            <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
            <span>Sort Order</span>
          </button>
        </div>

        <button
          onClick={() => setIsAddProjectModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 btn-hover-effect tooltip flex items-center gap-2"
          data-tooltip="Create a new project"
        >
          <span>➕</span> <span className="font-medium">Add Project</span>
        </button>
      </div>

      {/* Table Header for Sorting */}
      <div
        className={`w-full mb-4 p-3 rounded-lg grid grid-cols-3 gap-4 ${
          isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-700"
        }`}
      >
        <div
          className="cursor-pointer flex items-center gap-1 font-medium justify-start"
          onClick={() => sortProjects("title")}
        >
          Title
          {sortConfig.key === "title" && (
            <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
          )}
        </div>
        <div
          className="cursor-pointer flex items-center gap-1 font-medium justify-center"
          onClick={() => sortProjects("category")}
        >
          Category
          {sortConfig.key === "category" && (
            <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
          )}
        </div>
        <div
          className="cursor-pointer flex items-center gap-1 font-medium justify-end"
          onClick={() => sortProjects("progress")}
        >
          Progress
          {sortConfig.key === "progress" && (
            <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            className={`p-4 rounded-lg hover:transform hover:scale-105 transition-all dashboard-card cursor-pointer ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow-md"
            }`}
          >
            <div onClick={() => setSelectedProject(project)}>
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
                    className={`px-4 py-2 rounded-lg text-white w-full text-center ${getStatusColor(
                      getStatusFromProgress(project.progress, project.status),
                      isDarkMode
                    )}`}
                  >
                    {getStatusFromProgress(project.progress, project.status)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProjectToEdit(project);
                  setIsEditProjectModalOpen(true);
                }}
                className={`px-3 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProjectToDelete(project);
                }}
                className={`px-3 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-red-300"
                    : "bg-gray-200 hover:bg-gray-300 text-red-600"
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProject && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div
            className={`p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Students</h4>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {selectedProject.students?.join(", ")}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Category</h4>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {selectedProject.category}
                  </p>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <h4 className="font-semibold mb-2">Progress</h4>
                  <p
                    className={`px-4 py-2 rounded-lg text-white w-full text-center ${getStatusColor(
                      getStatusFromProgress(
                        selectedProject.progress,
                        selectedProject.status
                      ),
                      isDarkMode
                    )}`}
                  >
                    {getStatusFromProgress(
                      selectedProject.progress,
                      selectedProject.status
                    )}
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

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-600 hover:bg-gray-500 text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Close
              </button>
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
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-red-300"
                    : "bg-gray-200 hover:bg-gray-300 text-red-600"
                }`}
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

      {projectToEdit && (
        <EditProjectModal
          isOpen={isEditProjectModalOpen}
          onClose={() => {
            setIsEditProjectModalOpen(false);
            setProjectToEdit(null);
          }}
          onUpdateProject={handleUpdateProject}
          project={projectToEdit}
        />
      )}
    </DashboardLayout>
  );
};

export default AdminProjects;
