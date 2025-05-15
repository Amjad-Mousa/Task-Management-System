/**
 * @file StatusUpdateModal.jsx - Modal component for updating task status
 * @module components/student/StatusUpdateModal
 */

import React, { useState, useContext } from "react";
import PropTypes from "prop-types";
import { DarkModeContext } from "../../Context/DarkModeContext";
import { Modal, Select, StatusBadge } from "../ui";

/**
 * StatusUpdateModal component for updating task status
 * Displays current task status and allows student to update it
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Object} props.task - Task object to update
 * @param {number} props.task.id - Task ID
 * @param {string} props.task.title - Task title
 * @param {string} props.task.status - Current task status
 * @param {string} [props.task.description] - Task description
 * @param {Function} props.onUpdateStatus - Function to handle status update
 * @returns {React.ReactElement|null} Rendered modal or null if no task
 */
const StatusUpdateModal = ({ isOpen, onClose, task, onUpdateStatus }) => {
  const { isDarkMode } = useContext(DarkModeContext);
  const [selectedStatus, setSelectedStatus] = useState(task?.status || "");

  /**
   * Reset selected status when task changes
   */
  React.useEffect(() => {
    if (task) {
      setSelectedStatus(task.status);
    }
  }, [task]);

  /**
   * Handle status selection change
   * @param {React.ChangeEvent<HTMLSelectElement>} e - Change event
   */
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  /**
   * Handle form submission
   * @param {React.FormEvent<HTMLFormElement>} e - Form event
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedStatus && task) {
      onUpdateStatus(task.id, selectedStatus);
      onClose();
    }
  };

  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Task Status"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Task: {task.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              {task.description}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Current Status:</span>
              <StatusBadge status={task.status} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Update Status To:
            </label>
            <Select
              name="status"
              value={selectedStatus}
              onChange={handleStatusChange}
              options={[
                { value: "Not Started", label: "Not Started" },
                { value: "In Progress", label: "In Progress" },
                { value: "Pending", label: "Pending" },
                { value: "Completed", label: "Completed" },
              ]}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded transition-colors ${
              isDarkMode
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                : "bg-gray-200 hover:bg-gray-300 text-gray-800"
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Update Status
          </button>
        </div>
      </form>
    </Modal>
  );
};

StatusUpdateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  task: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    description: PropTypes.string,
  }),
  onUpdateStatus: PropTypes.func.isRequired,
};

export default StatusUpdateModal;
