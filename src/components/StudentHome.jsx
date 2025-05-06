import { useEffect, useState } from "react";
import { DashboardLayout } from "./layout";
import { Card, StatusBadge } from "./ui";

/**
 * StudentHome component for student dashboard
 */
const StudentHome = () => {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    document.title = "Student Dashboard | Task Manager";
  }, []);

  // Dashboard statistics
  const stats = {
    projectsCount: 5,
    tasksCount: 10,
    finishedProjectsCount: 2,
  };

  // Load student tasks
  useEffect(() => {
    const studentTasks = [
      { id: 1, title: "Research Report", status: "In Progress" },
      { id: 2, title: "Final Presentation", status: "Completed" },
      { id: 3, title: "Project Documentation", status: "Pending" },
      { id: 4, title: "Literature Review", status: "Not Started" },
    ];
    setTasks(studentTasks);
  }, []);

  if (!tasks) {
    return <div>Loading tasks...</div>;
  }

  return (
    <DashboardLayout role="student" showWelcomeMessage={true}>
      {/* Stats Cards */}
      <div className="flex justify-center mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <StatCard title="Number of Projects" value={stats.projectsCount} />
          <StatCard title="Number of Tasks" value={stats.tasksCount} />
          <StatCard
            title="Number of Finished Projects"
            value={stats.finishedProjectsCount}
          />
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex justify-center mb-6">
        <Card className="w-full max-w-4xl">
          <h2 className="text-xl font-semibold mb-4 text-center">Your Tasks</h2>
          <ul className="space-y-3">
            {tasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </ul>
        </Card>
      </div>
    </DashboardLayout>
  );
};

/**
 * StatCard component for displaying statistics
 */
const StatCard = ({ title, value }) => {
  return (
    <Card className="text-center p-4">
      <p className="text-lg">{title}</p>
      <span className="text-2xl font-bold">{value}</span>
    </Card>
  );
};

/**
 * TaskItem component for displaying a task
 */
const TaskItem = ({ task }) => {
  return (
    <li className="p-4 rounded-lg border">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{task.title}</h3>
        <StatusBadge status={task.status} />
      </div>
    </li>
  );
};

export default StudentHome;
