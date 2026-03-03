import { apiClient } from './client';

export const sprintApi = {
    getSprints: (projectId) => {
        return apiClient.get(`/projects/${projectId}/sprints`);
    },
    createSprint: (projectId, data) => {
        return apiClient.post(`/projects/${projectId}/sprints`, data);
    },
    updateSprint: (sprintId, data) => {
        return apiClient.put(`/sprints/${sprintId}`, data);
    },
    deleteSprint: (sprintId) => {
        return apiClient.delete(`/sprints/${sprintId}`);
    }
};
