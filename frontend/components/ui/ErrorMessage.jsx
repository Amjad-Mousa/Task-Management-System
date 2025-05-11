import PropTypes from "prop-types";

/**
 * Reusable ErrorMessage component for displaying different types of errors
 */
const ErrorMessage = ({ type = "general", message, errors = null }) => {
  if (!message && (!errors || Object.keys(errors).length === 0)) {
    return null;
  }

  // Determine background color based on type
  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";

  return (
    <div
      className={`mb-4 p-3 ${bgColor} text-white rounded-md relative z-[60]`}
    >
      {type === "backend" && errors && Object.keys(errors).length > 0 ? (
        <>
          <p className="font-bold mb-2">Please fix the following errors:</p>
          <ul className="list-disc pl-5">
            {Object.entries(errors).map(([field, errorMsg]) => (
              <li key={field}>
                <span className="font-semibold">{field}:</span> {errorMsg}
              </li>
            ))}
          </ul>
        </>
      ) : (
        message
      )}
    </div>
  );
};

ErrorMessage.propTypes = {
  type: PropTypes.oneOf(["general", "success", "backend"]),
  message: PropTypes.string,
  errors: PropTypes.object,
};

export default ErrorMessage;
