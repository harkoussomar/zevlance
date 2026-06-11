import "server-only";
import { serverFetch } from "@/modules/shared/lib/bff/server-fetch";
import type {
    NotificationsPage,
    UnreadCountResponse,
} from "../types/notification";

export async function getNotificationsServer(
    qs?: string,
): Promise<NotificationsPage> {
    return await serverFetch<NotificationsPage>(
        `/notifications${qs ? `?${qs}` : ""}`,
    );
}

export async function getUnreadCountServer(): Promise<UnreadCountResponse> {
    return await serverFetch<UnreadCountResponse>(
        `/notifications/unread-count`,
    );
}

export async function markAsReadServer(id: string): Promise<void> {
    await serverFetch(`/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllAsReadServer(): Promise<void> {
    await serverFetch(`/notifications/read-all`, { method: "PATCH" });
}
