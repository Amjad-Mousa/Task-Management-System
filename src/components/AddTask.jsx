import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AddTask = () => {
  const navigate = useNavigate();
  const [projects] = useState(['Website Redesign', 'Mobile App Development', 'E-commerce Platform']);
  const [students] = useState(['All Yaseen', 'Braz Aeesh', 'Ibn Al-Jawzee', 'Ibn Malik', 'Ayman Oulom']);
  const [formData, setFormData] = useState({
    project: '',
    taskName: '',
    assignedStudent: '',
    status: '',
    dueDate: ''
  });
  
  useEffect(() => {
    document.title = "AddTask | Task Manager";
  }, []);
  
  const [message, setMessage] = useState({ text: '', color: 'red' });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!Object.values(formData).every(field => field.trim())) {
      setMessage({ text: 'Please fill out all fields', color: 'red' });
      return;
    }

    const formattedStatus = formData.status
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    const newTask = {
      id: Date.now(),
      ...formData,
      status: formattedStatus
    };

    const existingTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    localStorage.setItem('tasks', JSON.stringify([...existingTasks, newTask]));
    
    setMessage({ text: 'Task added successfully!', color: 'green' });
    
    setTimeout(() => {
      navigate('/tasks');
    }, 2000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-500">Create New Task</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Project Title</label>
            <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Task Name</label>
            <input
              type="text"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              placeholder="Enter task name"
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Assigned Student</label>
            <select
              name="assignedStudent"
              value={formData.assignedStudent}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student} value={student}>{student}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            >
              <option value="">Select status</option>
              <option value="notStarted">Not Started</option>
              <option value="inProgress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              required
            />
          </div>

          {message.text && (
            <div className={`p-2 rounded-md text-center text-white bg-${message.color}-600`}>
              {message.text}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Add Task
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTask;