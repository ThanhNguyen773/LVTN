// components/UserRoleDoughnutChart.jsx
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import PropTypes from "prop-types";

ChartJS.register(ArcElement, Tooltip, Legend);

const UserRoleDoughnutChart = ({ roleStats }) => {
  const data = {
    labels: ["Admin", "Staff", "Customer"],
    datasets: [
      {
        label: "Tỉ lệ người dùng",
        data: [roleStats.admin, roleStats.staff, roleStats.customer],
        backgroundColor: ["#60A5FA", "#34D399", "#FBBF24"],
        borderColor: ["#3B82F6", "#10B981", "#F59E0B"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#E5E7EB",
        },
      },
    },
  };

  return (
    <div className="bg-gray-800/60 rounded-lg p-6 shadow-lg">
      <h3 className="text-white text-lg font-semibold mb-4">
        Tỉ lệ người dùng theo vai trò
      </h3>
      <Doughnut data={data} options={options} />
    </div>
  );
};

UserRoleDoughnutChart.propTypes = {
  roleStats: PropTypes.shape({
    admin: PropTypes.number.isRequired,
    staff: PropTypes.number.isRequired,
    customer: PropTypes.number.isRequired,
  }).isRequired,
};

export default UserRoleDoughnutChart;
