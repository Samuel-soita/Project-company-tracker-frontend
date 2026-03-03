import { apiClient } from './client';

export const commentApi = {
    // Project Comments
    getProjectComments: (projectId) => {
        return apiClient.get(`/projects/${projectId}/comments`);
    },
    addProjectComment: (projectId, content) => {
        return apiClient.post(`/projects/${projectId}/comments`, { content });
    },

    // Task Comments
    getTaskComments: (taskId) => {
        return apiClient.get(`/tasks/${taskId}/comments`);
    },
    addTaskComment: (taskId, content) => {
        return apiClient.post(`/tasks/${taskId}/comments`, { content });
    },

    // Delete Comment
    deleteComment: (commentId) => {
        return apiClient.delete(`/comments/${commentId}`);
    }
};
