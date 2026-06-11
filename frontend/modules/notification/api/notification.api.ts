import api from "@/modules/shared/lib/axios";
import type { NotificationsPage, UnreadCountResponse } from "../types/notification";

export const notificationService = {
  async getNotifications(page = 0, size = 20, signal?: AbortSignal): Promise<NotificationsPage> {
    const { data } = await api.get<NotificationsPage>("/notifications", {
      params: { page, size },
      signal,
    });
    return data;
  },

  async getUnreadCount(signal?: AbortSignal): Promise<UnreadCountResponse> {
    const { data } = await api.get<UnreadCountResponse>("/notifications/unread-count", { signal });
    return data;
  },

  async markAsRead(id: string, signal?: AbortSignal): Promise<void> {
    await api.patch(`/notifications/${id}/read`, undefined, { signal });
  },

  async markAllAsRead(signal?: AbortSignal): Promise<void> {
    await api.patch("/notifications/read-all", undefined, { signal });
  },
} as const;