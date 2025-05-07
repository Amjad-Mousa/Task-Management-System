import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Card } from "../ui";
import { DarkModeContext } from "../../Context/DarkModeContext";

/**
 * StatCard component for displaying statistics
 * Used in both admin and student dashboards
 */
const StatCard = ({
  title,
  value,
  hoverable = true,
  onClick,
  isSelected = false,
}) => {
  const { isDarkMode } = useContext(DarkModeContext);

  // Get the appropriate color based on the title
  const getCardColor = () => {
    if (!isSelected) return "";

    switch (title) {
      case "Projects":
        return isDarkMode
          ? "border-2 border-[rgba(255,99,132,1)] bg-[rgba(255,99,132,0.1)]"
          : "border-2 border-[rgba(255,99,132,1)] bg-[rgba(255,99,132,0.1)]";
      case "Students":
        return isDarkMode
          ? "border-2 border-[rgba(54,162,235,1)] bg-[rgba(54,162,235,0.1)]"
          : "border-2 border-[rgba(54,162,235,1)] bg-[rgba(54,162,235,0.1)]";
      case "Tasks":
        return isDarkMode
          ? "border-2 border-[rgba(255,206,86,1)] bg-[rgba(255,206,86,0.1)]"
          : "border-2 border-[rgba(255,206,86,1)] bg-[rgba(255,206,86,0.1)]";
      case "Finished Projects":
        return isDarkMode
          ? "border-2 border-[rgba(75,192,192,1)] bg-[rgba(75,192,192,0.1)]"
          : "border-2 border-[rgba(75,192,192,1)] bg-[rgba(75,192,192,0.1)]";
      default:
        return "";
    }
  };

  return (
    <Card
      className={`text-center p-4 transition-all duration-300 ${
        hoverable ? "card-hover-effect cursor-pointer dashboard-card" : ""
      } ${getCardColor()}`}
      onClick={onClick}
    >
      <p className="text-lg mb-1">{title}</p>
      <span className="text-2xl font-bold">{value}</span>
    </Card>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  hoverable: PropTypes.bool,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
};

export default StatCard;
