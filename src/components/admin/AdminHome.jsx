import { useEffect, useState } from "react";
import DashboardChart from "../DashboardChart";
import { DashboardLayout } from "../layout";
import { StatCard } from "../shared";

/**
 * AdminHome component for admin dashboard
 */
const AdminHome = () => {
  const [selectedStat, setSelectedStat] = useState(null);

  useEffect(() => {
    document.title = "Admin Dashboard | Task Manager";
  }, []);

  // Dashboard statistics
  const stats = {
    projectsCount: 5,
    studentsCount: 20,
    tasksCount: 10,
    finishedProjectsCount: 2,
  };

  // Map stat titles to their index in the chart
  const statIndexMap = {
    Projects: 0,
    Students: 1,
    Tasks: 2,
    "Finished Projects": 3,
  };

  // Handle stat card click
  const handleStatCardClick = (title) => {
    if (selectedStat === title) {
      setSelectedStat(null); // Deselect if already selected
    } else {
      setSelectedStat(title); // Select the clicked stat
    }
  };

  return (
    <DashboardLayout role="admin" showWelcomeMessage={true}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Projects"
          value={stats.projectsCount}
          onClick={() => handleStatCardClick("Projects")}
          isSelected={selectedStat === "Projects"}
        />
        <StatCard
          title="Students"
          value={stats.studentsCount}
          onClick={() => handleStatCardClick("Students")}
          isSelected={selectedStat === "Students"}
        />
        <StatCard
          title="Tasks"
          value={stats.tasksCount}
          onClick={() => handleStatCardClick("Tasks")}
          isSelected={selectedStat === "Tasks"}
        />
        <StatCard
          title="Finished Projects"
          value={stats.finishedProjectsCount}
          onClick={() => handleStatCardClick("Finished Projects")}
          isSelected={selectedStat === "Finished Projects"}
        />
      </div>

      {/* Chart Section */}
      <div className="w-full max-w-4xl mx-auto">
        <DashboardChart
          stats={stats}
          highlightIndex={selectedStat ? statIndexMap[selectedStat] : null}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminHome;
