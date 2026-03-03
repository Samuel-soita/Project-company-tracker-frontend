import { apiClient } from './client';

export const notificationsApi = {
    getNotifications: () => {
        return apiClient.get('/notifications');
    },

    markAsRead: (id) => {
        return apiClient.patch(`/notifications/${id}/read`);
    }
};
