/**
 * @file projectReducer.js - Reducer functions for project state management
 * @module src/utils/projectReducer
 */

/**
 * Project reducer function for managing project state
 * Handles adding, updating, deleting, and loading projects
 *
 * @param {Array} projects - Current projects state array
 * @param {Object} action - Action object with type and payload
 * @param {string} action.type - Action type ('added', 'updated', 'deleted', 'loaded')
 * @param {string} [action.id] - Project ID for add/update/delete actions
 * @param {Object} [action.projectData] - Project data for add/update actions
 * @param {Array} [action.projects] - Projects array for load action
 * @returns {Array} New projects state
 * @throws {Error} If action type is unknown
 */
export function projectsReducer(projects, action) {
  switch (action.type) {
    case "added": {
      return [
        ...projects,
        {
          id: action.id,
          projectName: action.projectData.projectName,
          projectDescription: action.projectData.projectDescription,
          projectCategory: action.projectData.projectCategory,
          progress: action.projectData.progress || 0,
          status: action.projectData.status || "Not Started",
          studentsWorkingOn: action.projectData.studentsWorkingOn || [],
        },
      ];
    }
    case "updated": {
      return projects.map((project) => {
        if (project.id === action.id) {
          return { ...project, ...action.projectData };
        } else {
          return project;
        }
      });
    }
    case "deleted": {
      return projects.filter((project) => project.id !== action.id);
    }
    case "loaded": {
      return action.projects;
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

/**
 * Initial projects state
 * Empty array used as the default state for the projects reducer
 *
 * @type {Array}
 */
export const initialProjects = [];
