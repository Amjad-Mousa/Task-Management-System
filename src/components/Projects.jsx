import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  useEffect(() => {
    const savedProjects = JSON.parse(localStorage.getItem('projects')) || [];
    const projectsWithIds = savedProjects.map(project => ({
      ...project,
      id: project.id || Date.now() + Math.random() // fallback if no id
    }));
    setProjects(projectsWithIds);
  }, []);

  useEffect(() => {
    document.title = "Projects Manager| Task Manager";
  }, []);

  const filteredProjects = projects.filter(project => {
    const matchesCategory = filter === 'All' || project.category === filter;
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const confirmDeleteProject = (id) => {
    const updatedProjects = projects.filter(project => project.id !== id);
    setProjects(updatedProjects);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    setDeleteMessage("Project deleted successfully!");
    setProjectToDelete(null);
    setTimeout(() => setDeleteMessage(null), 3000);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      <aside className="w-64 bg-gray-800 p-4 flex flex-col">
        <h2 className="text-2xl font-bold mb-8 text-center">Projects Manager</h2>
        <nav className="flex-1 space-y-2">
          <Link to="/home" className="flex items-center p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
            <span className="mr-2">🏠</span> Home
          </Link>
          <Link to="/projects" className="flex items-center p-2 rounded-lg bg-blue-600">
            <span className="mr-2">📂</span> Projects
          </Link>
          <Link to="/tasks" className="flex items-center p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
            <span className="mr-2">✅</span> Tasks
          </Link>
          <Link to="/chat" className="flex items-center p-2 rounded-lg bg-gray-700 hover:bg-gray-600">
            <span className="mr-2">💬</span> Chat
          </Link>
        </nav>

        <button 
          onClick={() => navigate('/signin')}
          className="mt-auto flex items-center p-2 rounded-lg bg-red-600 hover:bg-red-500"
        >
          <span className="mr-2">🚪</span> Logout
        </button>
      </aside>

      <main className="flex-1 p-6">
        {deleteMessage && (
          <div className="fixed top-0 left-0 right-0 bg-green-600 text-white text-center py-2 z-50">
            {deleteMessage}
          </div>
        )}

        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold">Projects Overview</h1>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search projects..."
              className="px-4 py-2 bg-gray-800 rounded-lg w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            
            <select 
              className="px-4 py-2 bg-gray-800 rounded-lg"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile Development">Mobile Development</option>
              <option value="Machine Learning">Machine Learning</option>
            </select>
            
            <button 
              onClick={() => navigate('/add-project')}
              className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-500"
            >
              Add New Project
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(project => (
            <div 
              key={project.id}
              className="p-4 bg-gray-800 rounded-lg hover:transform hover:scale-105 transition-all"
            >
              <h3 className="text-xl font-bold text-blue-400 mb-2">{project.title}</h3>
              <p className="text-gray-300 line-clamp-2 mb-4">{project.description}</p>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Students:</span> {project.students?.join(', ')}</p>
                <p><span className="font-semibold">Category:</span> {project.category}</p>

                <div className="space-y-2">
                  <p className="font-semibold">Progress:</p>
                  <p
                    className={`px-4 py-2 rounded-lg text-white ${
                      project.progress === 100
                        ? 'bg-green-600'
                        : project.progress > 50
                        ? 'bg-yellow-500'
                        : 'bg-red-600'
                    }`}
                  >
                    {project.progress === 100
                      ? 'Complete'
                      : project.progress > 50
                      ? 'In Progress'
                      : 'Not Started'}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <button
                  onClick={() => setSelectedProject(project)}
                  className="px-3 py-2 rounded-lg bg-gray-600 hover:bg-gray-500"
                >
                  View Details
                </button>

                <button
                  onClick={() => setProjectToDelete(project)}
                  className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
            <div className="w-full md:w-96 bg-gray-800 p-6 h-full overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Project Details</h2>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="text-3xl hover:text-gray-400"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">{selectedProject.title}</h3>
                  <p className="text-gray-300">{selectedProject.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Students</h4>
                    <p className="text-gray-300">{selectedProject.students?.join(', ')}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Category</h4>
                    <p className="text-gray-300">{selectedProject.category}</p>
                  </div>
                  
                  <div className="col-span-2">
                    <h4 className="font-semibold mb-2">Progress</h4>
                    <p
                      className={`px-4 py-2 rounded-lg text-white ${
                        selectedProject.progress === 100
                          ? 'bg-green-600'
                          : selectedProject.progress > 50
                          ? 'bg-yellow-500'
                          : 'bg-red-600'
                      }`}
                    >
                      {selectedProject.progress === 100
                        ? 'Complete'
                        : selectedProject.progress > 50
                        ? 'In Progress'
                        : 'Not Started'}
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
                          className={`px-4 py-2 rounded-lg ${task.completed ? 'bg-green-600' : 'bg-gray-700'}`}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-red-500">Confirm Deletion</h2>
              <p className="mb-6 text-gray-300">
                Are you sure you want to delete <strong>{projectToDelete.title}</strong>?
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setProjectToDelete(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeleteProject(projectToDelete.id)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;
