import { apiClient } from './client';

export const timeApi = {
    getTimeLogs: (taskId) => {
        return apiClient.get(`/tasks/${taskId}/time`);
    },
    logTime: (taskId, data) => {
        return apiClient.post(`/tasks/${taskId}/time`, data);
    },
    deleteTimeLog: (logId) => {
        return apiClient.delete(`/time/${logId}`);
    }
};
