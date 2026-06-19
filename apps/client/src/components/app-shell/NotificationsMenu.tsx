import { Bell, Handshake, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type MockNotification =
    | {
          id: string;
          type: "join_request_created";
          projectTitle: string;
          actorName: string;
          message?: string;
          occurredAtLabel: string;
          href: string;
      }
    | {
          id: string;
          type: "project_comment_created";
          projectTitle: string;
          actorName: string;
          content: string;
          occurredAtLabel: string;
          href: string;
      };

const mockNotifications: MockNotification[] = [
    {
        id: "mock-join-request",
        type: "join_request_created",
        projectTitle: "Open Source Portfolio Tracker",
        actorName: "Sara Ben Ali",
        message: "I can contribute on the frontend and help with API integration.",
        occurredAtLabel: "12 min ago",
        href: "/app/projects",
    },
    {
        id: "mock-project-comment",
        type: "project_comment_created",
        projectTitle: "AI Study Buddy",
        actorName: "Youssef M.",
        content: "The milestone breakdown looks solid, maybe add a short demo video in the README?",
        occurredAtLabel: "2 hr ago",
        href: "/app/projects",
    },
];

function NotificationIcon({ type }: { type: MockNotification["type"] }) {
    const Icon = type === "join_request_created" ? Handshake : MessageSquare;

    return (
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--gb-border)]/50 bg-[var(--gb-surface)]">
            <Icon className="h-4 w-4 text-[var(--gb-muted)]" aria-hidden />
        </span>
    );
}

function notificationTitle(notification: MockNotification): string {
    if (notification.type === "join_request_created") {
        return "New join request";
    }

    return "New comment";
}

function notificationBody(notification: MockNotification): string {
    if (notification.type === "join_request_created") {
        return `${notification.actorName} requested to join ${notification.projectTitle}`;
    }

    return `${notification.actorName} commented on ${notification.projectTitle}`;
}

function notificationPreview(notification: MockNotification): string {
    if (notification.type === "join_request_created") {
        return notification.message ?? "No message provided.";
    }

    return notification.content;
}

export default function NotificationsMenu() {
    const unreadCount = mockNotifications.length;

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
                    {mockNotifications.map((notification, index) => (
                        <DropdownMenuItem
                            key={notification.id}
                            asChild
                            className="rounded-none px-0 py-0 focus:bg-transparent">
                            <Link
                                to={notification.href}
                                className={cn(
                                    "flex cursor-pointer gap-3 px-4 py-3.5 transition",
                                    "hover:bg-[var(--gb-app-hover)]/80 focus-visible:bg-[var(--gb-app-hover)]/80 focus-visible:outline-none",
                                    index < mockNotifications.length - 1 && "border-b border-[var(--gb-border)]/35",
                                )}>
                                <NotificationIcon type={notification.type} />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex min-w-0 items-center gap-2">
                                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef4444]" aria-hidden />
                                            <p className="truncate text-sm font-semibold text-[var(--gb-text)]">
                                                {notificationTitle(notification)}
                                            </p>
                                        </div>
                                        <span className="shrink-0 text-[11px] tabular-nums text-[var(--gb-muted)]">
                                            {notification.occurredAtLabel}
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm leading-snug text-[var(--gb-text-off)]">
                                        {notificationBody(notification)}
                                    </p>
                                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[var(--gb-muted)]">
                                        {notificationPreview(notification)}
                                    </p>
                                </div>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
