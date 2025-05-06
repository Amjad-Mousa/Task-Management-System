import { useEffect, useState, useContext } from "react";
import { DashboardLayout } from "../layout";
import { Card, Select, StatusBadge } from "../ui";
import { DarkModeContext } from "../../Context/DarkModeContext";

/**
 * StudentTask component for student task management
 */
const StudentTask = () => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [sortedTasks, setSortedTasks] = useState([]);
  const [sortBy, setSortBy] = useState("dueDate"); // Sorting by 'dueDate' or 'status'

  useEffect(() => {
    document.title = "Student Tasks | Task Manager";
  }, []);

  useEffect(() => {
    const studentTasks = [
      {
        id: 1,
        title: "Research Report",
        status: "In Progress",
        dueDate: "2025-05-10",
        description:
          "Complete the research report on the assigned topic. Include at least 5 academic sources and follow the APA citation format.",
      },
      {
        id: 2,
        title: "Final Presentation",
        status: "Completed",
        dueDate: "2025-04-20",
        description:
          "Prepare and deliver a 15-minute presentation on your project findings. Include visual aids and be prepared for Q&A.",
      },
      {
        id: 3,
        title: "Project Documentation",
        status: "Pending",
        dueDate: "2025-05-05",
        description:
          "Document all aspects of your project including methodology, findings, and conclusions. Submit in PDF format.",
      },
      {
        id: 4,
        title: "Literature Review",
        status: "Not Started",
        dueDate: "2025-05-15",
        description:
          "Conduct a comprehensive literature review on the research topic. Analyze at least 10 relevant academic papers.",
      },
    ];
    setTasks(studentTasks);
    setSortedTasks(studentTasks); // Initialize sorted tasks
  }, []);

  const handleSort = (sortBy) => {
    const sorted = [...tasks].sort((a, b) => {
      if (sortBy === "dueDate") {
        return new Date(a.dueDate) - new Date(b.dueDate);
      } else if (sortBy === "status") {
        const statusOrder = [
          "Not Started",
          "Pending",
          "In Progress",
          "Completed",
        ];
        return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
      }
      return 0;
    });

    setSortBy(sortBy);
    setSortedTasks(sorted);
  };

  const handleTaskClick = (taskId) => {
    // If the clicked task is already selected, close the details
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask(null);
    } else {
      // Otherwise, show the details for the clicked task
      const task = tasks.find((task) => task.id === taskId);
      setSelectedTask(task);
    }
  };

  const handleCloseDetails = () => {
    setSelectedTask(null);
  };

  return (
    <DashboardLayout role="student" title="Your Tasks">
      {/* Sort Options */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <Select
            name="sortBy"
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            options={[
              { value: "dueDate", label: "Sort by Due Date" },
              { value: "status", label: "Sort by Status" },
            ]}
            className="w-64"
          />
        </div>
      </div>

      {/* Tasks Section */}
      <div className="flex flex-col items-center">
        <Card className="w-full max-w-3xl mb-6">
          <h2 className="text-xl font-semibold mb-4">Task List</h2>
          {sortedTasks.length === 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              No tasks available.
            </p>
          ) : (
            <ul className="space-y-4">
              {sortedTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isSelected={task.id === selectedTask?.id}
                  onClick={() => handleTaskClick(task.id)}
                />
              ))}
            </ul>
          )}
        </Card>

        {/* Task Details Section */}
        {selectedTask && (
          <Card className="w-full max-w-3xl p-4">
            <div className="flex justify-between items-center mb-3 border-b pb-2 dark:border-gray-700">
              <h3 className="text-lg font-semibold">Task Details</h3>
              <button
                onClick={handleCloseDetails}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                }`}
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Title
                </h4>
                <p className="font-medium">{selectedTask.title}</p>
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </h4>
                <StatusBadge status={selectedTask.status} />
              </div>

              <div>
                <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Due Date
                </h4>
                <p>{new Date(selectedTask.dueDate).toLocaleDateString()}</p>
              </div>

              <div className="col-span-2 mt-1">
                <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Description
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedTask.description ||
                    "No description available for this task."}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

/**
 * TaskItem component for displaying a task in the list
 */
const TaskItem = ({ task, isSelected, onClick }) => {
  return (
    <li
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer shadow transition-transform hover:scale-105 border dark:border-gray-700 ${
        isSelected ? "border-blue-500 dark:border-blue-400 border-2" : ""
      }`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{task.title}</h3>
        <StatusBadge status={task.status} />
      </div>
      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
      </div>
    </li>
  );
};

export default StudentTask;
