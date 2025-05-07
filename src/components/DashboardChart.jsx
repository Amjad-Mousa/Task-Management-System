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
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const DashboardChart = ({ stats, highlightIndex }) => {
  // Base colors for the chart
  const baseColors = {
    backgroundColor: [
      "rgba(255, 99, 132, 0.3)", // Projects
      "rgba(54, 162, 235, 0.3)", // Students
      "rgba(255, 206, 86, 0.3)", // Tasks
      "rgba(75, 192, 192, 0.3)", // Finished Projects
    ],
    borderColor: [
      "rgba(255, 99, 132, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(75, 192, 192, 1)",
    ],
  };

  // Create highlighted colors based on the selected index
  const getHighlightedColors = () => {
    if (highlightIndex === null) return baseColors;

    const highlightedBackgroundColors = [...baseColors.backgroundColor];
    const highlightedBorderColors = [...baseColors.borderColor];

    // Make non-highlighted bars more transparent
    for (let i = 0; i < highlightedBackgroundColors.length; i++) {
      if (i !== highlightIndex) {
        highlightedBackgroundColors[i] = highlightedBackgroundColors[i].replace(
          "0.3",
          "0.1"
        );
      } else {
        // Make the highlighted bar more vibrant
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
    animation: {
      duration: 500, // Animation duration in milliseconds
      easing: "easeOutQuad", // Easing function
    },
    plugins: {
      title: {
        display: true,
        text: "Statistics Overview",
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
    <div className="chart-container">
      <Bar data={data} options={options} />
    </div>
  );
};

export default DashboardChart;
