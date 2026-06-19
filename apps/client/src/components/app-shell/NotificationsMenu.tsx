import { Bell, Handshake, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import type { NotificationDTO, NotificationType } from "@glybette/contracts";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    useMarkNotificationRead,
    useNotifications,
    useUnreadNotificationCount,
} from "@/features/notifications/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/pages/app/opportunities/constants";

function NotificationIcon({ type }: { type: NotificationType }) {
    const Icon = type === "join_request_created" ? Handshake : MessageSquare;

    return (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--gb-border)]/50 bg-[var(--gb-surface)]">
            <Icon className="h-4 w-4 text-[var(--gb-muted)]" aria-hidden />
        </span>
    );
}

function isUnread(notification: NotificationDTO): boolean {
    return !notification.readAt;
}

export default function NotificationsMenu() {
    const notificationsQuery = useNotifications();
    const unreadCountQuery = useUnreadNotificationCount();
    const markReadMutation = useMarkNotificationRead();

    const notifications = notificationsQuery.data?.notifications ?? [];
    const unreadCount = unreadCountQuery.data?.count ?? 0;

    async function handleNotificationClick(notification: NotificationDTO) {
        if (isUnread(notification)) {
            try {
                await markReadMutation.mutateAsync(notification.id);
            } catch {
                // Navigation should still proceed if mark-read fails.
            }
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                        "relative size-10 shrink-0 rounded-xl border border-[var(--gb-border)]/60 bg-[var(--gb-app-panel-bg)]",
                        "text-[var(--gb-muted)] hover:border-[var(--gb-border)] hover:bg-[var(--gb-app-hover)] hover:text-[var(--gb-text)]",
                        "data-[state=open]:border-[var(--gb-border)] data-[state=open]:bg-[var(--gb-app-hover)] data-[state=open]:text-[var(--gb-text)]",
                    )}
                    aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}>
                    <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />

                    {unreadCount > 0 ? (
                        <span
                            className="pointer-events-none absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[var(--gb-app-topbar-bg)] bg-[#ef4444] px-1 text-[10px] font-bold leading-none text-white shadow-sm"
                            aria-hidden>
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    ) : null}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className={cn(
                    "w-80 overflow-hidden rounded-2xl border border-[var(--gb-border)]/45 bg-[var(--gb-app-panel-bg)]/95 p-0 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl",
                    "ring-1 ring-white/5",
                )}>
                <div className="border-b border-[var(--gb-border)]/40 px-4 py-3">
                    <DropdownMenuLabel className="p-0 text-sm font-semibold text-[var(--gb-text)]">
                        Notifications
                    </DropdownMenuLabel>
                    <p className="mt-0.5 text-xs text-[var(--gb-muted)]">View all Glybette notifications here.</p>
                </div>

                <div className="max-h-80 overflow-y-auto">
                    {notificationsQuery.isPending ? (
                        <p className="px-4 py-6 text-sm text-[var(--gb-muted)]">Loading notifications...</p>
                    ) : notifications.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-[var(--gb-muted)]">No notifications yet.</p>
                    ) : (
                        notifications.map((notification, index) => (
                            <DropdownMenuItem
                                key={notification.id}
                                asChild
                                className="rounded-none px-0 py-0 focus:bg-transparent">
                                <Link
                                    to={notification.href}
                                    onClick={() => void handleNotificationClick(notification)}
                                    className={cn(
                                        "flex cursor-pointer gap-3 px-4 py-3.5 transition",
                                        "hover:bg-[var(--gb-app-hover)]/80 focus-visible:bg-[var(--gb-app-hover)]/80 focus-visible:outline-none",
                                        index < notifications.length - 1 && "border-b border-[var(--gb-border)]/35",
                                    )}>
                                    <NotificationIcon type={notification.type} />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex min-w-0 items-center gap-2">
                                                {isUnread(notification) ? (
                                                    <span
                                                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef4444]"
                                                        aria-hidden
                                                    />
                                                ) : null}
                                                <p className="truncate text-sm font-semibold text-[var(--gb-text)]">
                                                    {notification.title}
                                                </p>
                                            </div>
                                            <span className="shrink-0 text-[11px] tabular-nums text-[var(--gb-muted)]">
                                                {timeAgo(notification.createdAt)}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm leading-snug text-[var(--gb-text-off)]">
                                            {notification.body}
                                        </p>
                                        {notification.preview ? (
                                            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--gb-muted)]">
                                                {notification.preview}
                                            </p>
                                        ) : null}
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
