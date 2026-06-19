import type {
    MarkNotificationReadResponse,
    NotificationsListResponse,
    NotificationsUnreadCountResponse,
} from "@glybette/contracts";
import { apiRequest } from "@/lib/api";

export const notificationsApi = {
    list(): Promise<NotificationsListResponse> {
        return apiRequest<NotificationsListResponse>("/api/notifications");
    },

    unreadCount(): Promise<NotificationsUnreadCountResponse> {
        return apiRequest<NotificationsUnreadCountResponse>("/api/notifications/unread-count");
    },

    markRead(notificationId: string): Promise<MarkNotificationReadResponse> {
        return apiRequest<MarkNotificationReadResponse>(`/api/notifications/${notificationId}/read`, {
            method: "PATCH",
        });
    },
};
