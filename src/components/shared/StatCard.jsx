import React from "react";
import PropTypes from "prop-types";
import { Card } from "../ui";

/**
 * StatCard component for displaying statistics
 * Used in both admin and student dashboards
 */
const StatCard = ({ title, value, hoverable = true }) => {
  return (
    <Card 
      className={`text-center p-4 ${
        hoverable ? "card-hover-effect cursor-pointer dashboard-card" : ""
      }`}
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
};

export default StatCard;
