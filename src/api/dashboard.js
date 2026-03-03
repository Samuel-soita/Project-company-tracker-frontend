import { apiClient } from './client';

export const dashboardApi = {
    getManagerSummary: () => {
        return apiClient.get('/dashboard/manager-summary');
    },

    getProjectsByStatus: () => {
        return apiClient.get('/dashboard/projects-by-status');
    },

    getProjectsByTeam: () => {
        return apiClient.get('/dashboard/projects-by-team');
    },

    getTaskProductivity: () => {
        return apiClient.get('/dashboard/task-productivity');
    }
};
