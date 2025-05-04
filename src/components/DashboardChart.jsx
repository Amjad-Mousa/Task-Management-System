import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// تسجيل المكونات المطلوبة من Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DashboardChart = ({ stats }) => {
  const data = {
    labels: ['Projects', 'Students', 'Tasks', 'Finished Projects'],
    datasets: [
      {
        label: 'Stats',
        data: [
          stats.projectsCount,
          stats.studentsCount,
          stats.tasksCount,
          stats.finishedProjectsCount
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.3)',   // Projects - أحمر فاتح
          'rgba(54, 162, 235, 0.3)',   // Students - أزرق فاتح
          'rgba(255, 206, 86, 0.3)',   // Tasks - أصفر فاتح
          'rgba(75, 192, 192, 0.3)'    // Finished Projects - أخضر مائل للزرقة
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Statistics Overview',
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
