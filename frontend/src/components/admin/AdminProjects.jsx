/**
 * @file AdminProjects.jsx - Admin projects management component
 * @module components/admin/AdminProjects
 */

import {
  useState,
  useContext,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { DarkModeContext } from "../../Context/DarkModeContext";
import { useProjects } from "../../hooks/useProjects";
import { DashboardLayout } from "../layout";
import ProjectFormModal from "../ProjectFormModal";
import { FixedSizeGrid as Grid } from "react-window";
import AutoSizer from "react-virtualized-auto-sizer";
import {
  getStatusColor,
  sortItems,
  getSearchInputClasses,
  getStatusFromProgress,
  SUCCESS_MESSAGE_TIMEOUT,
  formatDate,
} from "../../utils/adminUtils";

/**
 * AdminProjects component for project management interface
 * Provides functionality to view, create, edit, and delete projects
 * Uses virtualized grid for efficient rendering of project cards
 *
 * @returns {React.ReactElement} Rendered AdminProjects component
 */
const AdminProjects = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  } = useProjects();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "projectName",
    direction: "asc",
  });

  /**
   * Reference to the virtualized grid component
   * @type {React.RefObject}
   */
  const gridRef = useRef(null);

  /**
   * Fetches projects and sets up refresh interval
   * @returns {Function} Cleanup function to clear interval
   */
  useEffect(() => {
    fetchProjects();

    const refreshInterval = setInterval(() => {
      fetchProjects(true);
    }, 5 * 60 * 1000);

    document.title = "Projects Manager | Task Manager";

    return () => clearInterval(refreshInterval);
  }, [fetchProjects]);

  /**
   * Toggles sort direction or sets new sort key
   * @param {string} key - The field to sort by
   */
  const sortProjects = useCallback(
    (key) => {
      let direction = "asc";
      if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
      }
      setSortConfig({ key, direction });
    },
    [sortConfig]
  );

  // Filter and sort projects - memoized for better performance
  const filteredProjects = useMemo(() => {
    // First filter projects
    const filtered = projects.filter((project) => {
      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase().trim();
      return (
        (project.projectName &&
          project.projectName.toLowerCase().includes(query)) ||
        (project.projectDescription &&
          project.projectDescription.toLowerCase().includes(query)) ||
        (project.projectCategory &&
          project.projectCategory.toLowerCase().includes(query)) ||
        (project.studentsWorkingOn &&
          project.studentsWorkingOn.some(
            (student) =>
              student.user &&
              student.user.name &&
              student.user.name.toLowerCase().includes(query)
          ))
      );
    });

    // Then sort the filtered projects
    return sortItems([...filtered], sortConfig);
  }, [projects, searchQuery, sortConfig]);

  /**
   * Handles project deletion with confirmation
   * @param {string} id - The ID of the project to delete
   * @returns {Promise<void>}
   */
  const confirmDeleteProject = async (id) => {
    try {
      // Show a loading state in the modal
      setIsDeleting(true);

      // Delete the project
      await deleteProject(id);

      // Show success message
      setDeleteMessage("Project deleted successfully!");

      // Auto-close the modal after a short delay
      setTimeout(() => {
        setProjectToDelete(null);
        setIsDeleting(false);
      }, 500);

      // Clear success message after a timeout
      setTimeout(() => setDeleteMessage(null), SUCCESS_MESSAGE_TIMEOUT);
    } catch (err) {
      setDeleteMessage("Failed to delete project. Please try again.");
      setIsDeleting(false);
      setTimeout(() => setDeleteMessage(null), SUCCESS_MESSAGE_TIMEOUT);
    }
  };

  /**
   * Handles project form submission for create or update
   * @param {Object} projectData - The project data to submit
   * @param {string} [projectData.id] - Project ID (for updates)
   * @param {Object} projectData.input - Project input data
   * @returns {Promise<Object|null>} The API response or null if error
   */
  const handleProjectSubmit = async (projectData) => {
    try {
      let response;
      let successMessage;

      if (projectToEdit) {
        // Update existing project
        response = await updateProject(projectData.id, projectData.input);
        successMessage = "Project updated successfully!";
      } else {
        // Add new project
        response = await addProject(projectData.input);
        successMessage = "Project added successfully!";
      }

      // Close the modal
      setIsProjectModalOpen(false);
      setProjectToEdit(null);

      // Show success message
      setDeleteMessage(successMessage);
      setTimeout(() => setDeleteMessage(null), SUCCESS_MESSAGE_TIMEOUT);

      return response;
    } catch (err) {
      console.error("Error submitting project:", err);
      setDeleteMessage("Failed to save project. Please try again.");
      setTimeout(() => setDeleteMessage(null), SUCCESS_MESSAGE_TIMEOUT);
      return null;
    }
  };

  /**
   * Project Card Component for virtualized grid rendering
   * @param {Object} props - Component props
   * @param {Object} props.project - Project data object
   * @param {Object} props.style - Style object from react-window
   * @returns {React.ReactElement} Rendered project card
   */
  const ProjectCard = useCallback(
    ({ project, style }) => {
      // Get student count
      const studentCount = project.studentsWorkingOn
        ? project.studentsWorkingOn.filter(
            (student) => student.user && student.user.name
          ).length
        : 0;

      // Get status display
      const statusDisplay = getStatusFromProgress(
        project.progress,
        project.status
      );

      // Get status color class
      const statusColorClass = getStatusColor(statusDisplay, isDarkMode);

      return (
        <div style={style} className="p-2">
          <div
            className={`rounded-lg hover:transform hover:scale-105 transition-all dashboard-card cursor-pointer overflow-hidden h-full ${
              isDarkMode ? "bg-gray-800" : "bg-white shadow-md"
            }`}
          >
            {/* Card Content */}
            <div
              onClick={() => setSelectedProject(project)}
              className="p-5"
              role="button"
              aria-label={`View details for ${project.projectName}`}
            >
              <h3
                className={`text-xl font-bold mb-4 ${
                  isDarkMode ? "text-blue-400" : "text-blue-600"
                }`}
              >
                {project.projectName}
              </h3>

              <div className="flex flex-col gap-3">
                <div
                  className={`flex items-center ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <span className="font-medium w-24">Category:</span>
                  <span>{project.projectCategory}</span>
                </div>
                <div
                  className={`flex items-center ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <span className="font-medium w-24">Students:</span>
                  <span>{studentCount}</span>
                </div>
                <div className="mt-2">
                  <span className="font-medium mb-1 block">Progress:</span>
                  <div
                    className={`px-3 py-2 rounded-lg text-center ${statusColorClass}`}
                  >
                    {statusDisplay}
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer with Buttons */}
            <div
              className={`flex justify-between mt-2 p-3 border-t ${
                isDarkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProjectToEdit(project);
                  setIsProjectModalOpen(true);
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-blue-600 hover:bg-blue-500 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
                aria-label={`Edit ${project.projectName}`}
              >
                Edit
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setProjectToDelete(project);
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-red-300/80"
                    : "bg-red-100 hover:bg-red-200 text-red-700 border border-red-200"
                }`}
                aria-label={`Delete ${project.projectName}`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      );
    },
    [
      isDarkMode,
      setSelectedProject,
      setProjectToEdit,
      setIsProjectModalOpen,
      setProjectToDelete,
    ]
  );

  return (
    <DashboardLayout
      role="admin"
      title="Projects Overview"
      successMessage={deleteMessage}
      isLoading={loading}
      errorMessage={error}
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
            <option value="projectName">Sort by Title</option>
            <option value="projectCategory">Sort by Category</option>
            <option value="progress">Sort by Progress</option>
            <option value="status">Sort by Status</option>
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
          onClick={() => {
            setProjectToEdit(null);
            setIsProjectModalOpen(true);
          }}
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
          onClick={() => sortProjects("projectName")}
        >
          Title
          {sortConfig.key === "projectName" && (
            <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
          )}
        </div>
        <div
          className="cursor-pointer flex items-center gap-1 font-medium justify-center"
          onClick={() => sortProjects("projectCategory")}
        >
          Category
          {sortConfig.key === "projectCategory" && (
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

      <div className="w-full" style={{ height: "calc(100vh - 280px)" }}>
        <AutoSizer>
          {({ height, width }) => {
            // Dynamically calculate columns based on width
            const calculatedColumnCount =
              width < 768 ? 1 : width < 1024 ? 2 : 3;

            // Calculate item dimensions
            const columnWidth = width / calculatedColumnCount;
            const rowHeight = 320; // Fixed height for each card

            // Calculate row count based on number of items and columns
            const rowCount = Math.ceil(
              filteredProjects.length / calculatedColumnCount
            );

            return (
              <Grid
                ref={gridRef}
                columnCount={calculatedColumnCount}
                columnWidth={columnWidth}
                height={height}
                rowCount={rowCount}
                rowHeight={rowHeight}
                width={width}
                itemData={filteredProjects}
                overscanRowCount={2} // Render additional rows for smoother scrolling
                overscanColumnCount={1} // Render additional columns for smoother scrolling
              >
                {({ columnIndex, rowIndex, style }) => {
                  const index = rowIndex * calculatedColumnCount + columnIndex;
                  if (index >= filteredProjects.length) {
                    return null; // Return null for empty cells
                  }
                  const project = filteredProjects[index];
                  return <ProjectCard project={project} style={style} />;
                }}
              </Grid>
            );
          }}
        </AutoSizer>
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
                  {selectedProject.projectName}
                </h3>
                <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                  {selectedProject.projectDescription}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Students</h4>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {selectedProject.studentsWorkingOn &&
                    selectedProject.studentsWorkingOn.length > 0
                      ? selectedProject.studentsWorkingOn
                          .filter(
                            (student) => student.user && student.user.name
                          )
                          .map((student) => student.user.name)
                          .join(", ")
                      : "No students assigned"}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Category</h4>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {selectedProject.projectCategory}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Start Date</h4>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {formatDate(selectedProject.startDate)}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">End Date</h4>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    {formatDate(selectedProject.endDate)}
                  </p>
                </div>

                <div className="col-span-1 md:col-span-2">
                  <h4 className="font-semibold mb-2">Progress</h4>
                  <p
                    className={`px-4 py-2 rounded-lg w-full text-center ${getStatusColor(
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

              {selectedProject.tasks && selectedProject.tasks.length > 0 && (
                <div>
                  <h4 className="text-lg font-semibold mb-3">Tasks</h4>
                  <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                    This project has {selectedProject.tasks.length} associated
                    tasks.
                  </p>
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
            <h2
              className={`text-xl font-bold mb-4 ${
                isDarkMode ? "text-blue-400" : "text-blue-600"
              }`}
            >
              Confirm Deletion
            </h2>
            <p
              className={`mb-6 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Are you sure you want to delete this project?
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
                disabled={isDeleting}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-red-300/80"
                    : "bg-red-100 hover:bg-red-200 text-red-700 border border-red-200"
                } ${isDeleting ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setProjectToEdit(null);
        }}
        onSubmit={handleProjectSubmit}
        project={projectToEdit}
      />
    </DashboardLayout>
  );
};

export default AdminProjects;
