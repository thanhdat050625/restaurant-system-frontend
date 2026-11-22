import apiClient from './api';
import { ApiResponse } from '../types/api-response.type';
import {
  INotification,
  INotificationPreferences,
  IQueryNotificationsParams,
  IUpdateNotificationPreferencesDto,
} from '../types/notification.type';

export const notificationService = {
  getMyNotifications: async (
    params?: IQueryNotificationsParams,
  ): Promise<ApiResponse<INotification[]>> => {
    return await apiClient.get('/notifications', { params });
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    return await apiClient.get('/notifications/unread-count');
  },

  markAsRead: async (id: string): Promise<ApiResponse<INotification>> => {
    return await apiClient.patch(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<
    ApiResponse<{ updatedCount: number; readAt: string }>
  > => {
    return await apiClient.patch('/notifications/read-all');
  },

  getPreferences: async (): Promise<ApiResponse<INotificationPreferences>> => {
    return await apiClient.get('/notifications/preferences');
  },

  updatePreferences: async (
    payload: IUpdateNotificationPreferencesDto,
  ): Promise<ApiResponse<INotificationPreferences>> => {
    return await apiClient.patch('/notifications/preferences', payload);
  },
};
