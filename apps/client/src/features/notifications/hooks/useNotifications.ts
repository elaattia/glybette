import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "@/features/notifications/api/notifications.api";

const NOTIFICATIONS_QUERY_KEY = ["notifications"] as const;
const UNREAD_COUNT_QUERY_KEY = ["notifications", "unread-count"] as const;

const POLL_INTERVAL_MS = 30_000;

export function useNotifications() {
    return useQuery({
        queryKey: NOTIFICATIONS_QUERY_KEY,
        queryFn: () => notificationsApi.list(),
        refetchInterval: POLL_INTERVAL_MS,
    });
}

export function useUnreadNotificationCount() {
    return useQuery({
        queryKey: UNREAD_COUNT_QUERY_KEY,
        queryFn: () => notificationsApi.unreadCount(),
        refetchInterval: POLL_INTERVAL_MS,
    });
}

export function useMarkNotificationRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId: string) => notificationsApi.markRead(notificationId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
        },
    });
}
