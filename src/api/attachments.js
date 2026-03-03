import { apiClient } from './client';

export const attachmentApi = {
    // Project Attachments
    getProjectAttachments: (projectId) => {
        return apiClient.get(`/projects/${projectId}/attachments`);
    },
    addProjectAttachment: (projectId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        // Use standard fetch here because apiClient stringifies the body to JSON by default
        return fetch(`${apiClient.baseURL}/projects/${projectId}/attachments`, {
            method: 'POST',
            headers: apiClient.getAuthHeaders(), // Does not include Content-Type, browser will set multipart/form-data
            credentials: 'include',
            body: formData,
        }).then(res => {
            if (!res.ok) throw new Error('File upload failed');
            return res.json();
        });
    },

    // Task Attachments
    getTaskAttachments: (taskId) => {
        return apiClient.get(`/tasks/${taskId}/attachments`);
    },
    addTaskAttachment: (taskId, file) => {
        const formData = new FormData();
        formData.append('file', file);

        return fetch(`${apiClient.baseURL}/tasks/${taskId}/attachments`, {
            method: 'POST',
            headers: apiClient.getAuthHeaders(),
            credentials: 'include',
            body: formData,
        }).then(res => {
            if (!res.ok) throw new Error('File upload failed');
            return res.json();
        });
    },

    // Delete Attachment
    deleteAttachment: (attachmentId) => {
        return apiClient.delete(`/attachments/${attachmentId}`);
    }
};
