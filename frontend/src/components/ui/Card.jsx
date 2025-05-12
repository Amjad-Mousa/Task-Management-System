import React, { useContext } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../../Context/DarkModeContext";

/**
 * @file Card.jsx - Reusable card container component
 * @module components/ui/Card
 */

/**
 * Reusable Card component with consistent styling
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} [props.title] - Optional card title
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {('none'|'small'|'normal'|'large')} [props.padding='normal'] - Card padding size
 * @param {boolean} [props.shadow=true] - Whether to show shadow
 * @param {boolean} [props.hover=false] - Whether to show hover effect
 * @returns {React.ReactElement} Rendered Card component
 */
const Card = ({
  children,
  title,
  className = "",
  padding = "normal",
  shadow = true,
  hover = false,
  ...props
}) => {
  const { isDarkMode } = useContext(DarkModeContext);

  const paddingClasses = {
    none: "",
    small: "p-3",
    normal: "p-6",
    large: "p-8",
  };

  const cardClasses = `
    rounded-lg
    ${shadow ? "shadow-lg" : ""}
    ${paddingClasses[padding]}
    ${hover ? "card-hover-effect" : ""}
    ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"}
    ${className}
  `;

  return (
    <div className={cardClasses} {...props}>
      {title && (
        <div className="mb-4">
          <h3
            className={`text-xl font-bold ${
              isDarkMode ? "text-blue-400" : "text-blue-600"
            }`}
          >
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  className: PropTypes.string,
  padding: PropTypes.oneOf(["none", "small", "normal", "large"]),
  shadow: PropTypes.bool,
  hover: PropTypes.bool,
};

export default Card;
