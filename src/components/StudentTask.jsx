import { useEffect, useState } from "react";
import { DashboardLayout } from "./layout";
import { Card, Button, Select, StatusBadge } from "./ui";

/**
 * StudentTask component for student task management
 */
const StuTask = () => {
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
      },
      {
        id: 2,
        title: "Final Presentation",
        status: "Completed",
        dueDate: "2025-04-20",
      },
      {
        id: 3,
        title: "Project Documentation",
        status: "Pending",
        dueDate: "2025-05-05",
      },
      {
        id: 4,
        title: "Literature Review",
        status: "Not Started",
        dueDate: "2025-05-15",
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
    const task = tasks.find((task) => task.id === taskId);
    setSelectedTask(task);
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
          <Card className="w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Task Details</h3>
              <Button variant="danger" size="sm" onClick={handleCloseDetails}>
                Close
              </Button>
            </div>
            <div className="space-y-2">
              <p>
                <strong>Title:</strong> {selectedTask.title}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <StatusBadge status={selectedTask.status} />
              </p>
              <p>
                <strong>Due Date:</strong>{" "}
                {new Date(selectedTask.dueDate).toLocaleDateString()}
              </p>
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
      className={`p-4 rounded-lg cursor-pointer shadow transition-transform hover:scale-105 border ${
        isSelected ? "border-blue-500 border-2" : ""
      }`}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{task.title}</h3>
        <StatusBadge status={task.status} />
      </div>
      <div className="mt-2 text-sm">
        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
      </div>
    </li>
  );
};

export default StuTask;
