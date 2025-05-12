import { useReducer, useCallback } from "react";
import { useGraphQL } from "../Context/GraphQLContext";
import { projectsReducer, initialProjects } from "../utils/projectReducer";
import {
  GET_PROJECTS_QUERY,
  CREATE_PROJECT_MUTATION,
  UPDATE_PROJECT_MUTATION,
  DELETE_PROJECT_MUTATION,
} from "../graphql/queries";

export function useProjects() {
  const [projects, dispatch] = useReducer(projectsReducer, initialProjects);
  const { executeQuery, loading, error } = useGraphQL();

  const fetchProjects = useCallback(
    async (forceRefresh = false) => {
      try {
        const data = await executeQuery(
          GET_PROJECTS_QUERY,
          {},
          true,
          !forceRefresh
        );
        if (data && data.projects) {
          dispatch({ type: "loaded", projects: data.projects });
          return data.projects;
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
        throw err;
      }
    },
    [executeQuery]
  );

  const addProject = useCallback(
    async (projectData) => {
      try {
        const response = await executeQuery(
          CREATE_PROJECT_MUTATION,
          { input: projectData },
          true,
          false
        );
        if (response) {
          await fetchProjects(true);
          return response;
        }
      } catch (err) {
        console.error("Error adding project:", err);
        throw err;
      }
    },
    [executeQuery, fetchProjects]
  );

  const updateProject = useCallback(
    async (id, projectData) => {
      try {
        const response = await executeQuery(
          UPDATE_PROJECT_MUTATION,
          { id, input: projectData },
          true,
          false
        );
        if (response) {
          await fetchProjects(true);
          return response;
        }
      } catch (err) {
        console.error("Error updating project:", err);
        throw err;
      }
    },
    [executeQuery, fetchProjects]
  );

  const deleteProject = useCallback(
    async (id) => {
      try {
        const response = await executeQuery(
          DELETE_PROJECT_MUTATION,
          { id },
          true,
          false
        );
        if (response) {
          await fetchProjects(true);
          return response;
        }
      } catch (err) {
        console.error("Error deleting project:", err);
        throw err;
      }
    },
    [executeQuery, fetchProjects]
  );

  return {
    projects,
    loading,
    error,
    fetchProjects,
    addProject,
    updateProject,
    deleteProject,
  };
}
