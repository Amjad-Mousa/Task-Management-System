import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

/**
 * @file DashboardChart.jsx - Chart component for dashboard statistics
 * @module components/DashboardChart
 */

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Bar chart component for displaying dashboard statistics
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.stats - Statistics data object
 * @param {number} props.stats.projectsCount - Number of projects
 * @param {number} props.stats.studentsCount - Number of students
 * @param {number} props.stats.tasksCount - Number of tasks
 * @param {number} props.stats.finishedProjectsCount - Number of completed projects
 * @param {number|null} [props.highlightIndex] - Index of the bar to highlight (0-3)
 * @returns {React.ReactElement} Rendered DashboardChart component
 */
const DashboardChart = ({ stats, highlightIndex }) => {
  const baseColors = {
    backgroundColor: [
      "rgba(255, 99, 132, 0.3)",
      "rgba(54, 162, 235, 0.3)",
      "rgba(255, 206, 86, 0.3)",
      "rgba(75, 192, 192, 0.3)",
    ],
    borderColor: [
      "rgba(255, 99, 132, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(75, 192, 192, 1)",
    ],
  };

  const getHighlightedColors = () => {
    if (highlightIndex === null) return baseColors;

    const highlightedBackgroundColors = [...baseColors.backgroundColor];
    const highlightedBorderColors = [...baseColors.borderColor];

    for (let i = 0; i < highlightedBackgroundColors.length; i++) {
      if (i !== highlightIndex) {
        highlightedBackgroundColors[i] = highlightedBackgroundColors[i].replace(
          "0.3",
          "0.1"
        );
      } else {
        highlightedBackgroundColors[i] = highlightedBackgroundColors[i].replace(
          "0.3",
          "0.6"
        );
      }
    }

    return {
      backgroundColor: highlightedBackgroundColors,
      borderColor: highlightedBorderColors,
    };
  };

  const colors = getHighlightedColors();

  const data = {
    labels: ["Projects", "Students", "Tasks", "Finished Projects"],
    datasets: [
      {
        label: "Stats",
        data: [
          stats.projectsCount,
          stats.studentsCount,
          stats.tasksCount,
          stats.finishedProjectsCount,
        ],
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth:
          highlightIndex !== null
            ? Array(4)
                .fill(1)
                .map((_, idx) => (idx === highlightIndex ? 2 : 1))
            : 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 500, // Animation duration in milliseconds
      easing: "easeOutQuad", // Easing function
    },
    plugins: {
      title: {
        display: false, // Removed title as we have one in the Card
      },
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            return `${tooltipItem.label}: ${tooltipItem.raw}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart-container" style={{ height: "400px", width: "100%" }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default DashboardChart;
