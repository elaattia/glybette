export const NOTIFICATION_TYPES = [
    "join_request_created",
    "join_request_approved",
    "join_request_rejected",
    "project_comment_created",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface NotificationDTO {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    preview?: string;
    actorUserId: string;
    actorDisplayName: string;
    projectId?: string;
    projectTitle?: string;
    href: string;
    readAt?: string;
    createdAt: string;
}

export interface NotificationsListResponse {
    notifications: NotificationDTO[];
}

export interface NotificationsUnreadCountResponse {
    count: number;
}

export interface MarkNotificationReadResponse {
    notification: NotificationDTO;
}

export interface MarkAllNotificationsReadResponse {
    updatedCount: number;
}

export interface ProjectNotificationContextRequest {
    projectId: string;
    requestId?: string;
    commentId?: string;
}

export interface ProjectNotificationContextResponse {
    projectTitle: string;
    ownerId: string;
    memberUserIds: string[];
    joinRequestMessage?: string;
    commentContent?: string;
    parentCommentAuthorId?: string;
}
