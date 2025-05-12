// Project reducer function for managing project state
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

// Initial projects state
export const initialProjects = [];
