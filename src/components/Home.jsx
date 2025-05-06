import { useEffect, useState } from "react";
import DashboardChart from "./DashboardChart";
import { DashboardLayout } from "./layout";
import { Card } from "./ui";

/**
 * Home component for admin dashboard
 */
const Home = () => {
  useEffect(() => {
    document.title = "Dashboard | Task Manager";
  }, []);

  // Dashboard statistics
  const stats = {
    projectsCount: 5,
    studentsCount: 20,
    tasksCount: 10,
    finishedProjectsCount: 2,
  };

  return (
    <DashboardLayout role="admin" showWelcomeMessage={true}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Projects" value={stats.projectsCount} />
        <StatCard title="Students" value={stats.studentsCount} />
        <StatCard title="Tasks" value={stats.tasksCount} />
        <StatCard
          title="Finished Projects"
          value={stats.finishedProjectsCount}
        />
      </div>

      {/* Chart Section */}
      <div className="w-full max-w-4xl mx-auto">
        <DashboardChart stats={stats} />
      </div>
    </DashboardLayout>
  );
};

/**
 * StatCard component for displaying statistics
 */
const StatCard = ({ title, value }) => {
  return (
    <Card className="text-center card-hover-effect cursor-pointer dashboard-card p-4">
      <p className="text-lg mb-1">{title}</p>
      <span className="text-2xl font-bold">{value}</span>
    </Card>
  );
};

export default Home;
