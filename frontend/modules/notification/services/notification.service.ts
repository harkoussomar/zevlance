import api from '@/modules/shared/lib/axios';
import type { NotificationsPage, UnreadCountResponse } from '../types';

export const notificationService = {
  getNotifications: (page = 0, size = 20) =>
    api.get<NotificationsPage>('/notifications', { params: { page, size } })
      .then(r => r.data),

  getUnreadCount: () =>
    api.get<UnreadCountResponse>('/notifications/unread-count')
      .then(r => r.data),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
};